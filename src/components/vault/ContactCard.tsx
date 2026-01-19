'use client';

import { Phone, Mail, User, Building, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { ServiceContact } from '@/lib/vault';

interface ContactCardProps {
  contact: ServiceContact;
  compact?: boolean;
}

export function ContactCard({ contact, compact = false }: ContactCardProps) {
  const [expanded, setExpanded] = useState(false);

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 rounded-lg bg-stone-50 border border-stone-200">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-stone-500" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-stone-900 text-sm truncate">{contact.name}</p>
            <p className="text-xs text-stone-500 truncate">
              {contact.role}
              {contact.company && ` at ${contact.company}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {contact.phone && (
            <a
              href={`tel:${contact.phone}`}
              className="p-2 rounded-lg bg-white border border-stone-200 text-stone-600 hover:bg-stone-100 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Phone className="w-4 h-4" />
            </a>
          )}
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              className="p-2 rounded-lg bg-white border border-stone-200 text-stone-600 hover:bg-stone-100 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Mail className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-stone-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center">
            <User className="w-6 h-6 text-stone-400" />
          </div>
          <div className="text-left">
            <h4 className="font-semibold text-stone-900">{contact.name}</h4>
            <p className="text-sm text-stone-500">{contact.role}</p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-stone-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-stone-400" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-stone-100 pt-3">
          {contact.company && (
            <div className="flex items-center gap-3 text-sm">
              <Building className="w-4 h-4 text-stone-400" />
              <span className="text-stone-600">{contact.company}</span>
            </div>
          )}

          {contact.phone && (
            <a
              href={`tel:${contact.phone}`}
              className="flex items-center gap-3 text-sm text-stone-600 hover:text-stone-900"
            >
              <Phone className="w-4 h-4 text-stone-400" />
              {contact.phone}
            </a>
          )}

          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              className="flex items-center gap-3 text-sm text-stone-600 hover:text-stone-900"
            >
              <Mail className="w-4 h-4 text-stone-400" />
              {contact.email}
            </a>
          )}

          {contact.notes && (
            <p className="text-sm text-stone-500 pt-2 border-t border-stone-100">
              {contact.notes}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

interface ContactListProps {
  contacts: ServiceContact[];
  compact?: boolean;
}

export function ContactList({ contacts, compact = false }: ContactListProps) {
  if (contacts.length === 0) {
    return (
      <p className="text-sm text-stone-400 text-center py-4">No contacts linked</p>
    );
  }

  return (
    <div className={compact ? 'space-y-2' : 'space-y-3'}>
      {contacts.map((contact) => (
        <ContactCard key={contact.id} contact={contact} compact={compact} />
      ))}
    </div>
  );
}
