// Vault Library
// Public API for Life Vault feature

// Types
export type {
  VaultItemType,
  AssetCategory,
  DocumentCategory,
  AccountCategory,
  VaultCategory,
  VaultAttachment,
  VaultItem,
  ServiceContact,
  VaultReminderType,
  VaultReminder,
  VaultItemInput,
  VaultItemUpdate,
  ServiceContactInput,
  ServiceContactUpdate,
  VaultData,
} from './types';

export {
  ASSET_CATEGORIES,
  DOCUMENT_CATEGORIES,
  ACCOUNT_CATEGORIES,
  ALL_CATEGORIES,
  CATEGORY_META,
  getCategoriesByType,
  EMPTY_VAULT_DATA,
} from './types';

// Store
export {
  isInitialized,
  isUnlocked,
  initialize,
  unlock,
  lock,
  changePassphrase,
  subscribe,
  getData,
  getItems,
  getArchivedItems,
  getItem,
  addItem,
  updateItem,
  deleteItem,
  archiveItem,
  unarchiveItem,
  getContacts,
  getContact,
  addContact,
  updateContact,
  deleteContact,
  getReminders,
  getActiveReminders,
  setReminders,
  dismissReminder,
  snoozeReminder,
  getItemsByType,
  getItemsByCategory,
  searchItems,
  getExpiringItems,
  getTotalAssetValue,
  getStorageSize,
  resetVault,
} from './store';

// Reminder Config
export type { CategoryReminderConfig, ReminderConfig } from './reminder-config';
export {
  DEFAULT_REMINDER_CONFIG,
  DEFAULT_CATEGORY_CONFIG,
  getCategoryConfig,
  mergeConfig,
  loadReminderConfig,
  saveReminderConfig,
  resetReminderConfig,
} from './reminder-config';

// Reminder Engine
export {
  generateAllReminders,
  syncReminders,
  getActiveRemindersFromList,
  getReminderCounts,
} from './reminder-engine';

// Crypto (selective exports)
export { isCryptoAvailable } from './crypto';
