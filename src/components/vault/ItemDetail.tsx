'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MoreVertical,
  Edit,
  Archive,
  Trash2,
  AlertTriangle,
  Calendar,
  DollarSign,
  Tag,
  Clock,
  FileText,
  Users,
  Link2,
} from 'lucide-react';
import type { VaultItem, ServiceContact, VaultReminder } from '@/lib/vault';
import { CATEGORY_META, deleteItem, archiveItem, getContact, getItem } from '@/lib/vault';
import { AttachmentGrid } from './AttachmentViewer';
import { ContactList } from './ContactCard';

interface ItemDetailProps {
  item: VaultItem;
  reminders?: VaultReminder[];
  onUpdate?: () => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatRelativeDate(dateStr: string): string {
  const days = daysUntil(dateStr);
  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days < 7) return `${days} days`;
  if (days < 30) return `${Math.floor(days / 7)} weeks`;
  if (days < 365) return `${Math.floor(days / 30)} months`;
  return `${Math.floor(days / 365)} years`;
}

interface SectionProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}

function Section({ title, icon: Icon, children }: SectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-stone-500">
        <Icon className="w-4 h-4" />
        {title}
      </div>
      {children}
    </div>
  );
}

export function ItemDetail({ item, reminders = [], onUpdate }: ItemDetailProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const meta = CATEGORY_META[item.category];

  // Get related contacts
  const relatedContacts: ServiceContact[] = item.relatedContacts
    .map((id) => getContact(id))
    .filter((c): c is ServiceContact => c !== null);

  // Get related items
  const relatedItems: VaultItem[] = item.relatedItems
    .map((id) => getItem(id))
    .filter((i): i is VaultItem => i !== null);

  // Get active reminders for this item
  const itemReminders = reminders.filter((r) => r.itemId === item.id && !r.dismissed);

  // Determine alert state
  const relevantDate = item.expirationDate || item.renewalDate || item.nextActionDate;
  const daysLeft = relevantDate ? daysUntil(relevantDate) : null;
  const showAlert = daysLeft !== null && daysLeft <= 30;
  const alertSeverity = daysLeft !== null && daysLeft <= 7 ? 'high' : 'medium';

  const handleEdit = () => {
    router.push(`/vault/add?edit=${item.id}`);
  };

  const handleArchive = async () => {
    await archiveItem(item.id);
    onUpdate?.();
    router.push('/vault');
  };

  const handleDelete = async () => {
    await deleteItem(item.id);
    onUpdate?.();
    router.push('/vault');
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-stone-200">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => router.push('/vault')}
            className="p-2 -ml-2 text-stone-600 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 -mr-2 text-stone-600 hover:text-stone-900 transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 z-20 w-48 bg-white rounded-xl border border-stone-200 shadow-lg overflow-hidden">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleEdit();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-stone-700 hover:bg-stone-50 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleArchive();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-stone-700 hover:bg-stone-50 transition-colors"
                  >
                    <Archive className="w-4 h-4" />
                    Archive
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setConfirmDelete(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6 space-y-6 max-w-lg mx-auto">
        {/* Item header */}
        <div className="text-center">
          <span className="text-4xl">{meta?.emoji || '📦'}</span>
          <h1 className="text-2xl font-bold text-stone-900 mt-3">{item.name}</h1>
          <p className="text-stone-500 mt-1">
            {meta?.label || item.category} • {item.type}
          </p>
          <p className="text-xs text-stone-400 mt-2">
            Updated {formatRelativeDate(item.updatedAt)} ago
          </p>
        </div>

        {/* Alert banner */}
        {showAlert && relevantDate && (
          <div
            className={`flex items-center gap-3 p-4 rounded-xl ${
              alertSeverity === 'high'
                ? 'bg-red-50 border border-red-200 text-red-700'
                : 'bg-amber-50 border border-amber-200 text-amber-700'
            }`}
          >
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-medium">
                {item.expirationDate
                  ? 'Expires'
                  : item.renewalDate
                    ? 'Renews'
                    : 'Action due'}{' '}
                {formatRelativeDate(relevantDate)}
              </p>
              <p className="text-sm opacity-80">{formatDate(relevantDate)}</p>
            </div>
          </div>
        )}

        {/* Description */}
        {item.description && (
          <p className="text-stone-600 leading-relaxed">{item.description}</p>
        )}

        {/* Details section */}
        <Section title="DETAILS" icon={FileText}>
          <div className="bg-white rounded-xl border border-stone-200 divide-y divide-stone-100">
            {item.purchasePrice !== undefined && (
              <div className="flex justify-between px-4 py-3">
                <span className="text-stone-500">Purchase Price</span>
                <span className="font-medium text-stone-900">
                  {formatCurrency(item.purchasePrice)}
                </span>
              </div>
            )}
            {item.currentValue !== undefined && (
              <div className="flex justify-between px-4 py-3">
                <span className="text-stone-500">Current Value</span>
                <span className="font-medium text-stone-900">
                  {formatCurrency(item.currentValue)}
                </span>
              </div>
            )}
            {item.monthlyPayment !== undefined && (
              <div className="flex justify-between px-4 py-3">
                <span className="text-stone-500">Monthly Payment</span>
                <span className="font-medium text-stone-900">
                  {formatCurrency(item.monthlyPayment)}
                </span>
              </div>
            )}
            {item.purchaseDate && (
              <div className="flex justify-between px-4 py-3">
                <span className="text-stone-500">Purchased</span>
                <span className="font-medium text-stone-900">
                  {formatDate(item.purchaseDate)}
                </span>
              </div>
            )}
            {item.expirationDate && (
              <div className="flex justify-between px-4 py-3">
                <span className="text-stone-500">Expires</span>
                <span className="font-medium text-stone-900">
                  {formatDate(item.expirationDate)}
                </span>
              </div>
            )}
            {item.renewalDate && (
              <div className="flex justify-between px-4 py-3">
                <span className="text-stone-500">Renews</span>
                <span className="font-medium text-stone-900">
                  {formatDate(item.renewalDate)}
                </span>
              </div>
            )}
            {item.nextActionDate && (
              <div className="flex justify-between px-4 py-3">
                <span className="text-stone-500">Next Action</span>
                <span className="font-medium text-stone-900">
                  {formatDate(item.nextActionDate)}
                </span>
              </div>
            )}
          </div>
        </Section>

        {/* Attachments */}
        {item.attachments.length > 0 && (
          <Section title={`ATTACHMENTS (${item.attachments.length})`} icon={FileText}>
            <AttachmentGrid attachments={item.attachments} />
          </Section>
        )}

        {/* Contacts */}
        {relatedContacts.length > 0 && (
          <Section title="CONTACTS" icon={Users}>
            <ContactList contacts={relatedContacts} compact />
          </Section>
        )}

        {/* Related items */}
        {relatedItems.length > 0 && (
          <Section title="RELATED ITEMS" icon={Link2}>
            <div className="space-y-2">
              {relatedItems.map((relatedItem) => {
                const relatedMeta = CATEGORY_META[relatedItem.category];
                return (
                  <button
                    key={relatedItem.id}
                    onClick={() => router.push(`/vault/${relatedItem.id}`)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-white border border-stone-200 hover:border-stone-300 transition-colors text-left"
                  >
                    <span className="text-lg">{relatedMeta?.emoji || '📦'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-stone-900 text-sm truncate">
                        {relatedItem.name}
                      </p>
                      <p className="text-xs text-stone-500">
                        {relatedMeta?.label || relatedItem.category}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </Section>
        )}

        {/* Notes */}
        {item.notes && (
          <Section title="NOTES" icon={FileText}>
            <div className="bg-white rounded-xl border border-stone-200 p-4">
              <p className="text-stone-600 whitespace-pre-wrap">{item.notes}</p>
            </div>
          </Section>
        )}

        {/* Tags */}
        {item.tags.length > 0 && (
          <Section title="TAGS" icon={Tag}>
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-stone-100 text-stone-600 text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Reminder status */}
        <Section title="REMINDERS" icon={Clock}>
          <div className="bg-white rounded-xl border border-stone-200 p-4">
            {item.reminderEnabled ? (
              <p className="text-stone-600">
                Reminders enabled • {item.reminderDays} days before due dates
              </p>
            ) : (
              <p className="text-stone-400">Reminders disabled</p>
            )}
            {itemReminders.length > 0 && (
              <div className="mt-3 pt-3 border-t border-stone-100">
                <p className="text-sm text-stone-500 mb-2">
                  {itemReminders.length} active reminder{itemReminders.length > 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        </Section>

        {/* Action buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={handleEdit}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-stone-900 text-white font-medium hover:bg-stone-800 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={handleArchive}
            className="px-4 py-3 rounded-xl border border-stone-200 text-stone-600 font-medium hover:bg-stone-50 transition-colors"
          >
            <Archive className="w-4 h-4" />
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="px-4 py-3 rounded-xl border border-red-200 text-red-600 font-medium hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </main>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6">
            <h3 className="text-lg font-bold text-stone-900 mb-2">Delete Item?</h3>
            <p className="text-stone-600 mb-6">
              This will permanently delete &quot;{item.name}&quot; and all its attachments. This
              action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-medium hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
