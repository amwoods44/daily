'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Search, User, Trash2, Edit } from 'lucide-react';
import {
  isUnlocked,
  getContacts,
  addContact,
  updateContact,
  deleteContact,
  subscribe,
} from '@/lib/vault';
import type { ServiceContact, ServiceContactInput } from '@/lib/vault';
import { VaultUnlock, ContactCard } from '@/components/vault';

interface ContactFormProps {
  contact?: ServiceContact;
  onSave: (data: ServiceContactInput) => void;
  onCancel: () => void;
}

function ContactForm({ contact, onSave, onCancel }: ContactFormProps) {
  const [name, setName] = useState(contact?.name ?? '');
  const [company, setCompany] = useState(contact?.company ?? '');
  const [role, setRole] = useState(contact?.role ?? '');
  const [phone, setPhone] = useState(contact?.phone ?? '');
  const [email, setEmail] = useState(contact?.email ?? '');
  const [notes, setNotes] = useState(contact?.notes ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) return;

    onSave({
      name: name.trim(),
      company: company.trim() || undefined,
      role: role.trim(),
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., John Smith"
          className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
          autoFocus
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">
          Role <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="e.g., Insurance Agent, Mechanic, Doctor"
          className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">
          Company
        </label>
        <input
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="e.g., State Farm, Honda Dealership"
          className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Phone
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(555) 123-4567"
            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional notes..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900 resize-none"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 rounded-xl border border-stone-200 text-stone-600 font-medium hover:bg-stone-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!name.trim() || !role.trim()}
          className="flex-1 px-4 py-3 rounded-xl bg-stone-900 text-white font-medium hover:bg-stone-800 disabled:opacity-50"
        >
          {contact ? 'Update' : 'Add'} Contact
        </button>
      </div>
    </form>
  );
}

export default function ContactsPage() {
  const router = useRouter();
  // Use lazy initializer for unlock status
  const [unlocked, setUnlocked] = useState<boolean>(() => isUnlocked());
  const [contacts, setContacts] = useState<ServiceContact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<ServiceContact | null>(null);

  const loadData = useCallback(() => {
    if (!isUnlocked()) return;
    setContacts(getContacts());
  }, []);

  useEffect(() => {
    // Load data if already unlocked
    if (unlocked) {
      loadData();
    }

    // Subscribe to changes (callback-based setState is valid)
    const unsubscribe = subscribe(() => {
      const nowUnlocked = isUnlocked();
      setUnlocked(nowUnlocked);
      if (nowUnlocked) {
        loadData();
      }
    });

    return unsubscribe;
  }, [loadData, unlocked]);

  const handleAdd = async (data: ServiceContactInput) => {
    await addContact(data);
    loadData();
    setShowForm(false);
  };

  const handleUpdate = async (data: ServiceContactInput) => {
    if (!editingContact) return;
    await updateContact(editingContact.id, data);
    loadData();
    setEditingContact(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this contact?')) {
      await deleteContact(id);
      loadData();
    }
  };

  // Filter contacts
  const filteredContacts = contacts.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.role.toLowerCase().includes(q) ||
      c.company?.toLowerCase().includes(q)
    );
  });

  // Still checking
  if (unlocked === null) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not unlocked
  if (!unlocked) {
    return <VaultUnlock onUnlock={() => setUnlocked(true)} />;
  }

  // Show form
  if (showForm || editingContact) {
    return (
      <div className="min-h-screen bg-stone-50">
        <header className="sticky top-0 z-10 bg-white border-b border-stone-200">
          <div className="flex items-center px-4 py-3 max-w-lg mx-auto">
            <button
              onClick={() => {
                setShowForm(false);
                setEditingContact(null);
              }}
              className="p-2 -ml-2 text-stone-600 hover:text-stone-900"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="ml-2 font-semibold text-stone-900">
              {editingContact ? 'Edit Contact' : 'Add Contact'}
            </h1>
          </div>
        </header>

        <main className="px-4 py-6 max-w-lg mx-auto">
          <ContactForm
            contact={editingContact ?? undefined}
            onSave={editingContact ? handleUpdate : handleAdd}
            onCancel={() => {
              setShowForm(false);
              setEditingContact(null);
            }}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-stone-200">
        <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
          <button
            onClick={() => router.push('/vault')}
            className="p-2 -ml-2 text-stone-600 hover:text-stone-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold text-stone-900">Contacts</h1>
          <button
            onClick={() => setShowForm(true)}
            className="p-2 -mr-2 text-stone-600 hover:text-stone-900"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Search */}
      <div className="px-4 py-3 max-w-lg mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search contacts..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
          />
        </div>
      </div>

      {/* Contacts list */}
      <main className="px-4 pb-6 max-w-lg mx-auto">
        {filteredContacts.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500">
              {contacts.length === 0
                ? 'No contacts yet'
                : 'No contacts match your search'}
            </p>
            {contacts.length === 0 && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 px-4 py-2 rounded-lg bg-stone-900 text-white text-sm"
              >
                Add Contact
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className="bg-white rounded-xl border border-stone-200 overflow-hidden"
              >
                <ContactCard contact={contact} />
                <div className="flex border-t border-stone-100">
                  <button
                    onClick={() => setEditingContact(contact)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 border-l border-stone-100"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
