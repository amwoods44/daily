// Vault Types
// Life Vault - Personal asset and document management

// Item Types
export type VaultItemType = 'asset' | 'document' | 'account';

// Categories by type
export const ASSET_CATEGORIES = ['jewelry', 'electronics', 'vehicles', 'property', 'collectibles'] as const;
export const DOCUMENT_CATEGORIES = ['insurance', 'warranty', 'identity', 'tax', 'medical', 'contract'] as const;
export const ACCOUNT_CATEGORIES = ['credit_card', 'loan', 'subscription', 'membership'] as const;

export type AssetCategory = typeof ASSET_CATEGORIES[number];
export type DocumentCategory = typeof DOCUMENT_CATEGORIES[number];
export type AccountCategory = typeof ACCOUNT_CATEGORIES[number];
export type VaultCategory = AssetCategory | DocumentCategory | AccountCategory;

export const ALL_CATEGORIES: VaultCategory[] = [
  ...ASSET_CATEGORIES,
  ...DOCUMENT_CATEGORIES,
  ...ACCOUNT_CATEGORIES,
];

// Category metadata for UI
export const CATEGORY_META: Record<VaultCategory, { label: string; emoji: string; type: VaultItemType }> = {
  // Assets
  jewelry: { label: 'Jewelry', emoji: '💍', type: 'asset' },
  electronics: { label: 'Electronics', emoji: '💻', type: 'asset' },
  vehicles: { label: 'Vehicles', emoji: '🚗', type: 'asset' },
  property: { label: 'Property', emoji: '🏠', type: 'asset' },
  collectibles: { label: 'Collectibles', emoji: '🎨', type: 'asset' },
  // Documents
  insurance: { label: 'Insurance', emoji: '🛡️', type: 'document' },
  warranty: { label: 'Warranty', emoji: '📋', type: 'document' },
  identity: { label: 'Identity', emoji: '🛂', type: 'document' },
  tax: { label: 'Tax', emoji: '📊', type: 'document' },
  medical: { label: 'Medical', emoji: '🏥', type: 'document' },
  contract: { label: 'Contract', emoji: '📝', type: 'document' },
  // Accounts
  credit_card: { label: 'Credit Card', emoji: '💳', type: 'account' },
  loan: { label: 'Loan', emoji: '🏦', type: 'account' },
  subscription: { label: 'Subscription', emoji: '🔄', type: 'account' },
  membership: { label: 'Membership', emoji: '🎫', type: 'account' },
};

// Get categories by type
export function getCategoriesByType(type: VaultItemType): VaultCategory[] {
  switch (type) {
    case 'asset':
      return [...ASSET_CATEGORIES];
    case 'document':
      return [...DOCUMENT_CATEGORIES];
    case 'account':
      return [...ACCOUNT_CATEGORIES];
  }
}

// Attachment stored as base64
export interface VaultAttachment {
  id: string;
  name: string;
  type: string; // mime type
  dataUrl: string; // base64 encoded
  size: number; // bytes
  createdAt: string;
}

// Core vault item
export interface VaultItem {
  id: string;
  type: VaultItemType;
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

  // Attachments
  attachments: VaultAttachment[];

  // Relationships
  relatedContacts: string[]; // ServiceContact IDs
  relatedItems: string[]; // VaultItem IDs

  // Reminders
  reminderDays: number;
  reminderEnabled: boolean;

  // Metadata
  notes?: string;
  tags: string[];
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

// Service contact (mechanic, insurance agent, etc.)
export interface ServiceContact {
  id: string;
  name: string;
  company?: string;
  role: string;
  phone?: string;
  email?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Reminder types
export type VaultReminderType = 'expiration' | 'renewal' | 'maintenance' | 'review' | 'custom';

// Generated reminder
export interface VaultReminder {
  id: string;
  itemId: string;
  type: VaultReminderType;
  title: string;
  message: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  dismissed: boolean;
  snoozedUntil?: string;
  createdAt: string;
}

// Input types for creating/updating
export type VaultItemInput = Omit<VaultItem, 'id' | 'createdAt' | 'updatedAt' | 'archived'>;
export type VaultItemUpdate = Partial<Omit<VaultItem, 'id' | 'createdAt'>>;
export type ServiceContactInput = Omit<ServiceContact, 'id' | 'createdAt' | 'updatedAt'>;
export type ServiceContactUpdate = Partial<Omit<ServiceContact, 'id' | 'createdAt'>>;

// Store state
export interface VaultData {
  items: VaultItem[];
  contacts: ServiceContact[];
  reminders: VaultReminder[];
  version: number;
  lastUpdated: string;
}

// Empty vault data
export const EMPTY_VAULT_DATA: VaultData = {
  items: [],
  contacts: [],
  reminders: [],
  version: 1,
  lastUpdated: new Date().toISOString(),
};
