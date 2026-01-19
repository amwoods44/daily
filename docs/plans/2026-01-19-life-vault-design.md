# Life Vault Feature Design

**Date:** 2026-01-19
**Status:** Approved

## Overview

Life Vault is a personal asset and document management system integrated into Daily Pulse. It tracks important items (assets, documents, accounts), their key dates, and surfaces reminders through the existing temporal bucket system.

## Data Model

### VaultItem

```typescript
interface VaultItem {
  id: string;
  type: 'asset' | 'document' | 'account';
  category: VaultCategory;
  name: string;
  description?: string;

  // Dates
  purchaseDate?: string;
  expirationDate?: string;
  renewalDate?: string;
  nextActionDate?: string;

  // Financial
  purchasePrice?: number;
  currentValue?: number;
  monthlyPayment?: number;

  // Attachments (stored as encrypted base64 data URLs)
  attachments: VaultAttachment[];

  // Relationships
  relatedContacts: string[];  // ServiceContact IDs
  relatedItems: string[];     // VaultItem IDs

  // Reminders
  reminderDays: number;
  reminderEnabled: boolean;

  // Metadata
  notes?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
```

### VaultAttachment

```typescript
interface VaultAttachment {
  id: string;
  name: string;
  type: string;        // mime type
  dataUrl: string;     // base64 encoded, encrypted
  createdAt: string;
}
```

### ServiceContact

```typescript
interface ServiceContact {
  id: string;
  name: string;
  company?: string;
  role: string;        // insurance agent, mechanic, doctor, etc.
  phone?: string;
  email?: string;
  notes?: string;
}
```

### VaultReminder

```typescript
interface VaultReminder {
  id: string;
  itemId: string;
  type: 'expiration' | 'renewal' | 'maintenance' | 'review' | 'custom';
  title: string;
  message: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  dismissed: boolean;
  snoozedUntil?: string;
}
```

### Categories

**Assets:** jewelry, electronics, vehicles, property, collectibles
**Documents:** insurance, warranty, identity, tax, medical, contract
**Accounts:** credit_card, loan, subscription, membership

## Storage Layer

### Approach
- localStorage with Web Crypto API encryption
- User sets passphrase on first use
- Derive key using PBKDF2 (100k iterations)
- Encrypt vault data with AES-GCM
- Passphrase required each session (cached in memory)

### Store Structure

```typescript
interface VaultStore {
  items: VaultItem[];
  contacts: ServiceContact[];
  reminders: VaultReminder[];
  config: ReminderConfig;
  lastUpdated: string;
}
```

### Store API

```typescript
interface VaultStoreAPI {
  // Setup
  isInitialized(): boolean;
  initialize(passphrase: string): Promise<void>;
  unlock(passphrase: string): Promise<boolean>;
  lock(): void;

  // Items CRUD
  getItems(): VaultItem[];
  getItem(id: string): VaultItem | null;
  addItem(item: Omit<VaultItem, 'id' | 'createdAt' | 'updatedAt'>): VaultItem;
  updateItem(id: string, updates: Partial<VaultItem>): VaultItem;
  deleteItem(id: string): void;

  // Contacts CRUD
  getContacts(): ServiceContact[];
  getContact(id: string): ServiceContact | null;
  addContact(contact: Omit<ServiceContact, 'id'>): ServiceContact;
  updateContact(id: string, updates: Partial<ServiceContact>): ServiceContact;
  deleteContact(id: string): void;

  // Reminders
  getReminders(): VaultReminder[];
  dismissReminder(id: string): void;
  snoozeReminder(id: string, until: string): void;

  // Queries
  getItemsByType(type: VaultItem['type']): VaultItem[];
  getExpiringItems(withinDays: number): VaultItem[];
  searchItems(query: string): VaultItem[];
}
```

## Reminder Engine

### Auto-Generation
Scans vault items on app load and daily. Generates reminders based on dates and category-specific rules.

### Default Reminder Windows

| Category | Days Before | Priority Boost Threshold |
|----------|-------------|--------------------------|
| identity | 180 | high if <60 days |
| insurance | 45 | high if <14 days |
| vehicle | 30 | high if <7 days |
| credit_card | 30 | medium |
| subscription | 14 | low |
| warranty | 30 | low |
| jewelry | 30 | autoReview: 24 months |
| default | 30 | medium |

### Configuration

```typescript
interface ReminderConfig {
  categoryDefaults: {
    [category: string]: {
      reminderDays: number;
      priorityBoostDays: number;
      autoReviewMonths?: number;
    };
  };
  globalEnabled: boolean;
}
```

Users can override per-category via `/vault/settings` or per-item via `item.reminderDays`.

### Reminder Types
- `expiration` → from expirationDate
- `renewal` → from renewalDate
- `maintenance` → from nextActionDate
- `review` → auto-generated (jewelry appraisals, insurance reviews)

## UI Components

### Page Structure

```
/vault              → VaultDashboard
/vault/add          → AddItemFlow
/vault/[id]         → ItemDetail
/vault/contacts     → ContactsList
/vault/settings     → ReminderConfig editor
```

### VaultDashboard Layout
1. Header - title + quick add button
2. Needs Attention - urgent items from reminder engine
3. Assets Overview - total value, category breakdown
4. All Items - filterable list (type tabs, search, tags)

### Components

| Component | Purpose |
|-----------|---------|
| VaultDashboard | Main page layout |
| NeedsAttentionList | Urgent items display |
| AssetsSummary | Total value, category chart |
| VaultItemList | Filterable/searchable list |
| VaultItemCard | Single item in list |
| AddItemFlow | 5-step wizard |
| ItemDetail | Full item view with actions |
| AttachmentViewer | Preview/download attachments |
| ContactCard | Service contact with actions |
| VaultUnlock | Passphrase entry modal |

## Add Item Flow

### 5-Step Wizard

1. **Type** - Asset / Document / Account (large cards)
2. **Category** - Grid of chips filtered by type
3. **Details** - Smart form based on category
4. **Dates & Reminders** - Key dates + reminder preferences
5. **Attachments** - Photos, PDFs (optional)

### Smart Form Fields by Category

| Category | Fields |
|----------|--------|
| jewelry | name, description, purchasePrice, currentValue, purchaseDate |
| vehicle | name, description, purchasePrice, currentValue |
| insurance | name, company contact, coverage amount |
| subscription | name, monthlyPayment, renewalDate |
| identity | name, expirationDate |

## Item Detail View

### Layout
- Alert banner (if upcoming expiration/renewal)
- Details section (key-value pairs)
- Attachments section (thumbnails)
- Contacts section (tap-to-call/email)
- Related Items section (links)
- Notes section
- Action buttons (Edit, Archive, Delete)

### Actions
- Edit → opens AddItemFlow pre-filled
- Archive → soft delete
- Delete → confirmation modal, permanent
- Contact phone → tel: link
- Contact email → mailto: link
- Attachment tap → full preview modal

## Daily Pulse Integration

### Temporal Buckets
Vault reminders become UnifiedItem with type `life_admin`:
- High priority → RIGHT_NOW bucket
- Medium priority → TODAY bucket
- Low priority → THIS_WEEK bucket

### Nudge Cards
High-priority vault items appear in nudge carousel:
- Category: life_admin
- Color: purple

### Pulse Check Section
New "Life Admin" subsection:
- Items needing attention count
- Total asset value
- Next upcoming expiration

### Command Bar (Cmd+K)
New intents:
- "show expiring items"
- "add warranty"
- "passport status"
- "vault"

### Navigation
Vault icon added to bottom nav bar.

## File Structure

### New Files

```
src/lib/vault/
  types.ts
  store.ts
  reminder-engine.ts
  reminder-config.ts
  crypto.ts
  index.ts

src/components/vault/
  VaultDashboard.tsx
  NeedsAttentionList.tsx
  AssetsSummary.tsx
  VaultItemList.tsx
  VaultItemCard.tsx
  AddItemFlow.tsx
  ItemDetail.tsx
  AttachmentViewer.tsx
  ContactCard.tsx
  VaultUnlock.tsx
  index.ts

src/app/vault/
  page.tsx
  add/page.tsx
  [id]/page.tsx
  contacts/page.tsx
  settings/page.tsx
```

### Modified Files

- `src/lib/types/index.ts` - add vault types
- `src/lib/temporal-buckets.ts` - add bucketVaultReminder()
- `src/lib/mock-data.ts` - add sample vault items
- `src/app/page.tsx` - add vault to bottom nav
- `src/components/pulse-check/PulseCheckSection.tsx` - add Life Admin section
- `src/lib/nlp/intent-parser.ts` - add vault intents
