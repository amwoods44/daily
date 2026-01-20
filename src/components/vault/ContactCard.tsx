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
      <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-[var(--text-muted)]" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-[var(--text-primary)] text-sm truncate">{contact.name}</p>
            <p className="text-xs text-[var(--text-muted)] truncate">
              {contact.role}
              {contact.company && ` at ${contact.company}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {contact.phone && (
            <a
              href={`tel:${contact.phone}`}
              className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Phone className="w-4 h-4" />
            </a>
          )}
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
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
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-[var(--bg-secondary)] transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center">
            <User className="w-6 h-6 text-[var(--text-muted)]" />
          </div>
          <div className="text-left">
            <h4 className="font-semibold text-[var(--text-primary)]">{contact.name}</h4>
            <p className="text-sm text-[var(--text-muted)]">{contact.role}</p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-[var(--text-muted)]" />
        ) : (
          <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-[var(--border)] pt-3">
          {contact.company && (
            <div className="flex items-center gap-3 text-sm">
              <Building className="w-4 h-4 text-[var(--text-muted)]" />
              <span className="text-[var(--text-secondary)]">{contact.company}</span>
            </div>
          )}

          {contact.phone && (
            <a
              href={`tel:${contact.phone}`}
              className="flex items-center gap-3 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <Phone className="w-4 h-4 text-[var(--text-muted)]" />
              {contact.phone}
            </a>
          )}

          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              className="flex items-center gap-3 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <Mail className="w-4 h-4 text-[var(--text-muted)]" />
              {contact.email}
            </a>
          )}

          {contact.notes && (
            <p className="text-sm text-[var(--text-muted)] pt-2 border-t border-[var(--border)]">
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
      <p className="text-sm text-[var(--text-muted)] text-center py-4">No contacts linked</p>
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
