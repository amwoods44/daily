// Vault Store
// Encrypted localStorage-based storage for vault data

import {
  VaultData,
  VaultItem,
  VaultItemInput,
  VaultItemUpdate,
  ServiceContact,
  ServiceContactInput,
  ServiceContactUpdate,
  VaultReminder,
  EMPTY_VAULT_DATA,
} from './types';
import { encrypt, decrypt, hashPassphrase, verifyPassphrase, EncryptedData } from './crypto';

const STORAGE_KEY = 'daily_pulse_vault';
const AUTH_KEY = 'daily_pulse_vault_auth';

// Check if we're in a browser environment
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

interface VaultAuth {
  hash: string;
  salt: string;
  initialized: boolean;
}

// In-memory state
let cachedData: VaultData | null = null;
let cachedPassphrase: string | null = null;
let listeners: Array<() => void> = [];

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Get current timestamp
function now(): string {
  return new Date().toISOString();
}

// Notify listeners of data change
function notifyListeners(): void {
  listeners.forEach((fn) => fn());
}

// Save encrypted data to localStorage
async function saveToStorage(data: VaultData, passphrase: string): Promise<void> {
  if (!isBrowser()) return;
  const json = JSON.stringify(data);
  const encrypted = await encrypt(json, passphrase);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(encrypted));
}

// Load and decrypt data from localStorage
async function loadFromStorage(passphrase: string): Promise<VaultData | null> {
  if (!isBrowser()) return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;

  try {
    const encrypted: EncryptedData = JSON.parse(stored);
    const json = await decrypt(encrypted, passphrase);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// Get auth info
function getAuth(): VaultAuth | null {
  if (!isBrowser()) return null;
  const stored = localStorage.getItem(AUTH_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

// Save auth info
function saveAuth(auth: VaultAuth): void {
  if (!isBrowser()) return;
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
}

// ============================================
// Public API
// ============================================

// Check if vault has been initialized (passphrase set)
export function isInitialized(): boolean {
  const auth = getAuth();
  return auth?.initialized ?? false;
}

// Check if vault is currently unlocked
export function isUnlocked(): boolean {
  return cachedPassphrase !== null && cachedData !== null;
}

// Initialize vault with a new passphrase
export async function initialize(passphrase: string): Promise<void> {
  if (isInitialized()) {
    throw new Error('Vault already initialized');
  }

  const { hash, salt } = await hashPassphrase(passphrase);
  saveAuth({ hash, salt, initialized: true });

  cachedPassphrase = passphrase;
  cachedData = { ...EMPTY_VAULT_DATA, lastUpdated: now() };

  await saveToStorage(cachedData, passphrase);
  notifyListeners();
}

// Unlock vault with passphrase
export async function unlock(passphrase: string): Promise<boolean> {
  const auth = getAuth();
  if (!auth) {
    throw new Error('Vault not initialized');
  }

  const valid = await verifyPassphrase(passphrase, auth.hash, auth.salt);
  if (!valid) {
    return false;
  }

  const data = await loadFromStorage(passphrase);
  if (!data) {
    // Auth is valid but no data - create fresh
    cachedPassphrase = passphrase;
    cachedData = { ...EMPTY_VAULT_DATA, lastUpdated: now() };
    await saveToStorage(cachedData, passphrase);
  } else {
    cachedPassphrase = passphrase;
    cachedData = data;
  }

  notifyListeners();
  return true;
}

// Lock vault (clear cached data)
export function lock(): void {
  cachedPassphrase = null;
  cachedData = null;
  notifyListeners();
}

// Change passphrase
export async function changePassphrase(currentPassphrase: string, newPassphrase: string): Promise<boolean> {
  const auth = getAuth();
  if (!auth) return false;

  const valid = await verifyPassphrase(currentPassphrase, auth.hash, auth.salt);
  if (!valid) return false;

  // Re-encrypt with new passphrase
  const data = await loadFromStorage(currentPassphrase);
  if (!data) return false;

  const { hash, salt } = await hashPassphrase(newPassphrase);
  saveAuth({ hash, salt, initialized: true });
  await saveToStorage(data, newPassphrase);

  cachedPassphrase = newPassphrase;
  return true;
}

// Subscribe to data changes
export function subscribe(listener: () => void): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

// Get all data (requires unlocked vault)
export function getData(): VaultData {
  if (!cachedData) {
    throw new Error('Vault is locked');
  }
  return cachedData;
}

// ============================================
// Items CRUD
// ============================================

export function getItems(): VaultItem[] {
  return getData().items.filter((i) => !i.archived);
}

export function getArchivedItems(): VaultItem[] {
  return getData().items.filter((i) => i.archived);
}

export function getItem(id: string): VaultItem | null {
  return getData().items.find((i) => i.id === id) ?? null;
}

export async function addItem(input: VaultItemInput): Promise<VaultItem> {
  if (!cachedData || !cachedPassphrase) {
    throw new Error('Vault is locked');
  }

  const item: VaultItem = {
    ...input,
    id: generateId(),
    archived: false,
    createdAt: now(),
    updatedAt: now(),
  };

  cachedData.items.push(item);
  cachedData.lastUpdated = now();

  await saveToStorage(cachedData, cachedPassphrase);
  notifyListeners();

  return item;
}

export async function updateItem(id: string, updates: VaultItemUpdate): Promise<VaultItem> {
  if (!cachedData || !cachedPassphrase) {
    throw new Error('Vault is locked');
  }

  const index = cachedData.items.findIndex((i) => i.id === id);
  if (index === -1) {
    throw new Error('Item not found');
  }

  cachedData.items[index] = {
    ...cachedData.items[index],
    ...updates,
    updatedAt: now(),
  };
  cachedData.lastUpdated = now();

  await saveToStorage(cachedData, cachedPassphrase);
  notifyListeners();

  return cachedData.items[index];
}

export async function deleteItem(id: string): Promise<void> {
  if (!cachedData || !cachedPassphrase) {
    throw new Error('Vault is locked');
  }

  cachedData.items = cachedData.items.filter((i) => i.id !== id);
  // Also remove related reminders
  cachedData.reminders = cachedData.reminders.filter((r) => r.itemId !== id);
  cachedData.lastUpdated = now();

  await saveToStorage(cachedData, cachedPassphrase);
  notifyListeners();
}

export async function archiveItem(id: string): Promise<void> {
  await updateItem(id, { archived: true });
}

export async function unarchiveItem(id: string): Promise<void> {
  await updateItem(id, { archived: false });
}

// ============================================
// Contacts CRUD
// ============================================

export function getContacts(): ServiceContact[] {
  return getData().contacts;
}

export function getContact(id: string): ServiceContact | null {
  return getData().contacts.find((c) => c.id === id) ?? null;
}

export async function addContact(input: ServiceContactInput): Promise<ServiceContact> {
  if (!cachedData || !cachedPassphrase) {
    throw new Error('Vault is locked');
  }

  const contact: ServiceContact = {
    ...input,
    id: generateId(),
    createdAt: now(),
    updatedAt: now(),
  };

  cachedData.contacts.push(contact);
  cachedData.lastUpdated = now();

  await saveToStorage(cachedData, cachedPassphrase);
  notifyListeners();

  return contact;
}

export async function updateContact(id: string, updates: ServiceContactUpdate): Promise<ServiceContact> {
  if (!cachedData || !cachedPassphrase) {
    throw new Error('Vault is locked');
  }

  const index = cachedData.contacts.findIndex((c) => c.id === id);
  if (index === -1) {
    throw new Error('Contact not found');
  }

  cachedData.contacts[index] = {
    ...cachedData.contacts[index],
    ...updates,
    updatedAt: now(),
  };
  cachedData.lastUpdated = now();

  await saveToStorage(cachedData, cachedPassphrase);
  notifyListeners();

  return cachedData.contacts[index];
}

export async function deleteContact(id: string): Promise<void> {
  if (!cachedData || !cachedPassphrase) {
    throw new Error('Vault is locked');
  }

  cachedData.contacts = cachedData.contacts.filter((c) => c.id !== id);
  // Also remove from items' relatedContacts
  cachedData.items = cachedData.items.map((item) => ({
    ...item,
    relatedContacts: item.relatedContacts.filter((cid) => cid !== id),
  }));
  cachedData.lastUpdated = now();

  await saveToStorage(cachedData, cachedPassphrase);
  notifyListeners();
}

// ============================================
// Reminders
// ============================================

export function getReminders(): VaultReminder[] {
  return getData().reminders;
}

export function getActiveReminders(): VaultReminder[] {
  const today = new Date().toISOString().split('T')[0];
  return getData().reminders.filter((r) => {
    if (r.dismissed) return false;
    if (r.snoozedUntil && r.snoozedUntil > today) return false;
    return true;
  });
}

export async function setReminders(reminders: VaultReminder[]): Promise<void> {
  if (!cachedData || !cachedPassphrase) {
    throw new Error('Vault is locked');
  }

  cachedData.reminders = reminders;
  cachedData.lastUpdated = now();

  await saveToStorage(cachedData, cachedPassphrase);
  notifyListeners();
}

export async function dismissReminder(id: string): Promise<void> {
  if (!cachedData || !cachedPassphrase) {
    throw new Error('Vault is locked');
  }

  const index = cachedData.reminders.findIndex((r) => r.id === id);
  if (index !== -1) {
    cachedData.reminders[index].dismissed = true;
    cachedData.lastUpdated = now();
    await saveToStorage(cachedData, cachedPassphrase);
    notifyListeners();
  }
}

export async function snoozeReminder(id: string, untilDate: string): Promise<void> {
  if (!cachedData || !cachedPassphrase) {
    throw new Error('Vault is locked');
  }

  const index = cachedData.reminders.findIndex((r) => r.id === id);
  if (index !== -1) {
    cachedData.reminders[index].snoozedUntil = untilDate;
    cachedData.lastUpdated = now();
    await saveToStorage(cachedData, cachedPassphrase);
    notifyListeners();
  }
}

// ============================================
// Queries
// ============================================

export function getItemsByType(type: VaultItem['type']): VaultItem[] {
  return getItems().filter((i) => i.type === type);
}

export function getItemsByCategory(category: VaultItem['category']): VaultItem[] {
  return getItems().filter((i) => i.category === category);
}

export function searchItems(query: string): VaultItem[] {
  const q = query.toLowerCase();
  return getItems().filter(
    (i) =>
      i.name.toLowerCase().includes(q) ||
      i.description?.toLowerCase().includes(q) ||
      i.notes?.toLowerCase().includes(q) ||
      i.tags.some((t) => t.toLowerCase().includes(q))
  );
}

export function getExpiringItems(withinDays: number): VaultItem[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + withinDays);
  const cutoffStr = cutoff.toISOString().split('T')[0];

  return getItems().filter((i) => {
    if (i.expirationDate && i.expirationDate <= cutoffStr) return true;
    if (i.renewalDate && i.renewalDate <= cutoffStr) return true;
    return false;
  });
}

export function getTotalAssetValue(): number {
  return getItems()
    .filter((i) => i.type === 'asset' && i.currentValue)
    .reduce((sum, i) => sum + (i.currentValue ?? 0), 0);
}

// ============================================
// Storage size check
// ============================================

export function getStorageSize(): { used: number; limit: number; percentage: number } {
  if (!isBrowser()) {
    return { used: 0, limit: 5 * 1024 * 1024, percentage: 0 };
  }
  const stored = localStorage.getItem(STORAGE_KEY) ?? '';
  const used = new Blob([stored]).size;
  const limit = 5 * 1024 * 1024; // 5MB conservative estimate
  return {
    used,
    limit,
    percentage: Math.round((used / limit) * 100),
  };
}

// ============================================
// Reset (dangerous)
// ============================================

export async function resetVault(): Promise<void> {
  if (isBrowser()) {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(AUTH_KEY);
  }
  cachedData = null;
  cachedPassphrase = null;
  notifyListeners();
}
