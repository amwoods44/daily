'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Package,
  FileText,
  Wallet,
  Upload,
  X,
  Calendar,
  DollarSign,
  Bell,
  Loader2,
} from 'lucide-react';
import type { VaultItemType, VaultCategory, VaultAttachment, VaultItemInput } from '@/lib/vault';
import {
  CATEGORY_META,
  getCategoriesByType,
  getCategoryConfig,
  addItem,
} from '@/lib/vault';

const STEPS = ['Type', 'Category', 'Details', 'Dates', 'Attachments'] as const;
type Step = (typeof STEPS)[number];

interface AddItemFlowProps {
  initialType?: VaultItemType;
  initialCategory?: VaultCategory;
  onComplete?: () => void;
  onCancel?: () => void;
}

// Step 1: Type selection
function TypeStep({
  value,
  onChange,
}: {
  value: VaultItemType | null;
  onChange: (type: VaultItemType) => void;
}) {
  const types: { value: VaultItemType; label: string; description: string; icon: React.ElementType }[] = [
    {
      value: 'asset',
      label: 'Asset',
      description: 'Physical items with value (jewelry, electronics, vehicles)',
      icon: Package,
    },
    {
      value: 'document',
      label: 'Document',
      description: 'Important papers (insurance, warranties, contracts)',
      icon: FileText,
    },
    {
      value: 'account',
      label: 'Account',
      description: 'Financial accounts (credit cards, subscriptions, memberships)',
      icon: Wallet,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-stone-900">What are you adding?</h2>
        <p className="text-stone-500 mt-1">Choose the type of item</p>
      </div>

      <div className="space-y-3">
        {types.map((type) => {
          const Icon = type.icon;
          const isSelected = value === type.value;

          return (
            <button
              key={type.value}
              onClick={() => onChange(type.value)}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                isSelected
                  ? 'border-stone-900 bg-stone-50'
                  : 'border-stone-200 bg-white hover:border-stone-300'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-500'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-900">{type.label}</h3>
                  <p className="text-sm text-stone-500">{type.description}</p>
                </div>
                {isSelected && (
                  <Check className="w-5 h-5 text-stone-900 ml-auto" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Step 2: Category selection
function CategoryStep({
  type,
  value,
  onChange,
}: {
  type: VaultItemType;
  value: VaultCategory | null;
  onChange: (category: VaultCategory) => void;
}) {
  const categories = getCategoriesByType(type);

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-stone-900">What kind of {type}?</h2>
        <p className="text-stone-500 mt-1">Select a category</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {categories.map((category) => {
          const meta = CATEGORY_META[category];
          const isSelected = value === category;

          return (
            <button
              key={category}
              onClick={() => onChange(category)}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                isSelected
                  ? 'border-stone-900 bg-stone-50'
                  : 'border-stone-200 bg-white hover:border-stone-300'
              }`}
            >
              <span className="text-2xl block mb-2">{meta.emoji}</span>
              <span className="text-sm font-medium text-stone-900">{meta.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Step 3: Details form
function DetailsStep({
  category,
  data,
  onChange,
}: {
  category: VaultCategory;
  data: Partial<VaultItemInput>;
  onChange: (updates: Partial<VaultItemInput>) => void;
}) {
  const meta = CATEGORY_META[category];

  // Determine which fields to show based on category
  const showValue = ['jewelry', 'electronics', 'vehicles', 'property', 'collectibles'].includes(category);
  const showMonthlyPayment = ['subscription', 'membership', 'loan'].includes(category);

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <span className="text-3xl">{meta.emoji}</span>
        <h2 className="text-xl font-bold text-stone-900 mt-2">Add {meta.label}</h2>
        <p className="text-stone-500 mt-1">Enter the details</p>
      </div>

      <div className="space-y-4">
        {/* Name - always required */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.name || ''}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder={`e.g., ${category === 'vehicles' ? '2021 Honda Accord' : category === 'jewelry' ? 'Engagement Ring' : category === 'subscription' ? 'Netflix' : 'My Item'}`}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Description
          </label>
          <textarea
            value={data.description || ''}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Optional notes or details"
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent resize-none"
          />
        </div>

        {/* Value fields for assets */}
        {showValue && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Purchase Price
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="number"
                  value={data.purchasePrice || ''}
                  onChange={(e) => onChange({ purchasePrice: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Current Value
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="number"
                  value={data.currentValue || ''}
                  onChange={(e) => onChange({ currentValue: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Monthly payment for subscriptions/loans */}
        {showMonthlyPayment && (
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Monthly Payment
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="number"
                value={data.monthlyPayment || ''}
                onChange={(e) => onChange({ monthlyPayment: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="0"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Tags
          </label>
          <input
            type="text"
            value={data.tags?.join(', ') || ''}
            onChange={(e) => onChange({ tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })}
            placeholder="e.g., important, insured, work"
            className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
          />
          <p className="text-xs text-stone-400 mt-1">Separate with commas</p>
        </div>
      </div>
    </div>
  );
}

// Step 4: Dates and reminders
function DatesStep({
  category,
  data,
  onChange,
}: {
  category: VaultCategory;
  data: Partial<VaultItemInput>;
  onChange: (updates: Partial<VaultItemInput>) => void;
}) {
  const categoryConfig = getCategoryConfig(category);

  // Determine which date fields to show
  const showPurchaseDate = CATEGORY_META[category].type === 'asset';
  const showExpiration = ['identity', 'warranty', 'credit_card', 'insurance', 'contract', 'medical'].includes(category);
  const showRenewal = ['subscription', 'membership', 'insurance', 'contract'].includes(category);
  const showNextAction = true; // Always available for maintenance reminders

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <Calendar className="w-8 h-8 text-stone-400 mx-auto mb-2" />
        <h2 className="text-xl font-bold text-stone-900">Important Dates</h2>
        <p className="text-stone-500 mt-1">Add dates to track</p>
      </div>

      <div className="space-y-4">
        {showPurchaseDate && (
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Purchase Date
            </label>
            <input
              type="date"
              value={data.purchaseDate || ''}
              onChange={(e) => onChange({ purchaseDate: e.target.value || undefined })}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
            />
          </div>
        )}

        {showExpiration && (
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Expiration Date
            </label>
            <input
              type="date"
              value={data.expirationDate || ''}
              onChange={(e) => onChange({ expirationDate: e.target.value || undefined })}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
            />
          </div>
        )}

        {showRenewal && (
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Renewal Date
            </label>
            <input
              type="date"
              value={data.renewalDate || ''}
              onChange={(e) => onChange({ renewalDate: e.target.value || undefined })}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
            />
          </div>
        )}

        {showNextAction && (
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Next Action Date
            </label>
            <input
              type="date"
              value={data.nextActionDate || ''}
              onChange={(e) => onChange({ nextActionDate: e.target.value || undefined })}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
            />
            <p className="text-xs text-stone-400 mt-1">e.g., next service, checkup, review</p>
          </div>
        )}

        {/* Reminder settings */}
        <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-stone-500" />
              <span className="font-medium text-stone-700">Reminders</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={data.reminderEnabled ?? true}
                onChange={(e) => onChange({ reminderEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-stone-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-stone-900"></div>
            </label>
          </div>

          {(data.reminderEnabled ?? true) && (
            <div>
              <label className="block text-sm text-stone-600 mb-1.5">
                Remind me this many days before
              </label>
              <input
                type="number"
                value={data.reminderDays ?? categoryConfig.reminderDays}
                onChange={(e) => onChange({ reminderDays: Number(e.target.value) })}
                min={1}
                max={365}
                className="w-full px-4 py-2 rounded-lg border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
              />
              <p className="text-xs text-stone-400 mt-1">
                Default for {CATEGORY_META[category].label}: {categoryConfig.reminderDays} days
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Step 5: Attachments
function AttachmentsStep({
  attachments,
  onAdd,
  onRemove,
}: {
  attachments: VaultAttachment[];
  onAdd: (attachment: VaultAttachment) => void;
  onRemove: (id: string) => void;
}) {
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);

    for (const file of Array.from(files)) {
      const reader = new FileReader();
      reader.onload = () => {
        const attachment: VaultAttachment = {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: file.name,
          type: file.type,
          dataUrl: reader.result as string,
          size: file.size,
          createdAt: new Date().toISOString(),
        };
        onAdd(attachment);
      };
      reader.readAsDataURL(file);
    }

    setUploading(false);
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <Upload className="w-8 h-8 text-stone-400 mx-auto mb-2" />
        <h2 className="text-xl font-bold text-stone-900">Attachments</h2>
        <p className="text-stone-500 mt-1">Add photos, receipts, or documents</p>
      </div>

      {/* Upload area */}
      <label className="block p-8 border-2 border-dashed border-stone-300 rounded-xl text-center cursor-pointer hover:border-stone-400 transition-colors">
        <input
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
        {uploading ? (
          <Loader2 className="w-8 h-8 text-stone-400 mx-auto animate-spin" />
        ) : (
          <>
            <Upload className="w-8 h-8 text-stone-400 mx-auto mb-2" />
            <p className="text-stone-600 font-medium">Click to upload</p>
            <p className="text-sm text-stone-400 mt-1">or drag and drop</p>
          </>
        )}
      </label>

      {/* Attachment list */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-stone-50 border border-stone-200"
            >
              {attachment.type.startsWith('image/') ? (
                <img
                  src={attachment.dataUrl}
                  alt={attachment.name}
                  className="w-12 h-12 rounded object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded bg-stone-200 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-stone-500" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-stone-900 text-sm truncate">
                  {attachment.name}
                </p>
                <p className="text-xs text-stone-500">
                  {(attachment.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                onClick={() => onRemove(attachment.id)}
                className="p-2 text-stone-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-stone-400 text-center">
        This step is optional. You can add attachments later.
      </p>
    </div>
  );
}

export function AddItemFlow({
  initialType,
  initialCategory,
  onComplete,
  onCancel,
}: AddItemFlowProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(initialType ? (initialCategory ? 2 : 1) : 0);
  const [saving, setSaving] = useState(false);

  // Form data
  const [selectedType, setSelectedType] = useState<VaultItemType | null>(initialType || null);
  const [selectedCategory, setSelectedCategory] = useState<VaultCategory | null>(initialCategory || null);
  const [itemData, setItemData] = useState<Partial<VaultItemInput>>({
    reminderEnabled: true,
    tags: [],
    attachments: [],
    relatedContacts: [],
    relatedItems: [],
  });

  const updateItemData = useCallback((updates: Partial<VaultItemInput>) => {
    setItemData((prev) => ({ ...prev, ...updates }));
  }, []);

  const addAttachment = useCallback((attachment: VaultAttachment) => {
    setItemData((prev) => ({
      ...prev,
      attachments: [...(prev.attachments || []), attachment],
    }));
  }, []);

  const removeAttachment = useCallback((id: string) => {
    setItemData((prev) => ({
      ...prev,
      attachments: (prev.attachments || []).filter((a) => a.id !== id),
    }));
  }, []);

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return selectedType !== null;
      case 1:
        return selectedCategory !== null;
      case 2:
        return itemData.name?.trim();
      case 3:
        return true; // Dates are optional
      case 4:
        return true; // Attachments are optional
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    } else {
      onCancel?.();
      router.push('/vault');
    }
  };

  const handleSave = async () => {
    if (!selectedType || !selectedCategory || !itemData.name) return;

    setSaving(true);
    try {
      const categoryConfig = getCategoryConfig(selectedCategory);

      const newItem = await addItem({
        type: selectedType,
        category: selectedCategory,
        name: itemData.name,
        description: itemData.description,
        purchaseDate: itemData.purchaseDate,
        expirationDate: itemData.expirationDate,
        renewalDate: itemData.renewalDate,
        nextActionDate: itemData.nextActionDate,
        purchasePrice: itemData.purchasePrice,
        currentValue: itemData.currentValue,
        monthlyPayment: itemData.monthlyPayment,
        attachments: itemData.attachments || [],
        relatedContacts: itemData.relatedContacts || [],
        relatedItems: itemData.relatedItems || [],
        reminderDays: itemData.reminderDays ?? categoryConfig.reminderDays,
        reminderEnabled: itemData.reminderEnabled ?? true,
        notes: itemData.notes,
        tags: itemData.tags || [],
      });

      onComplete?.();
      router.push(`/vault/${newItem.id}`);
    } catch (error) {
      console.error('Failed to save item:', error);
    } finally {
      setSaving(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <TypeStep
            value={selectedType}
            onChange={(type) => {
              setSelectedType(type);
              setSelectedCategory(null); // Reset category when type changes
            }}
          />
        );
      case 1:
        return (
          <CategoryStep
            type={selectedType!}
            value={selectedCategory}
            onChange={setSelectedCategory}
          />
        );
      case 2:
        return (
          <DetailsStep
            category={selectedCategory!}
            data={itemData}
            onChange={updateItemData}
          />
        );
      case 3:
        return (
          <DatesStep
            category={selectedCategory!}
            data={itemData}
            onChange={updateItemData}
          />
        );
      case 4:
        return (
          <AttachmentsStep
            attachments={itemData.attachments || []}
            onAdd={addAttachment}
            onRemove={removeAttachment}
          />
        );
      default:
        return null;
    }
  };

  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-stone-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <button
            onClick={handleBack}
            className="p-2 -ml-2 text-stone-600 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-stone-500">
            Step {currentStep + 1} of {STEPS.length}
          </span>
          <div className="w-9" /> {/* Spacer */}
        </div>

        {/* Progress bar */}
        <div className="max-w-lg mx-auto mt-3">
          <div className="h-1 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-stone-900 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-6">
        <div className="max-w-lg mx-auto">{renderStep()}</div>
      </main>

      {/* Footer */}
      <footer className="sticky bottom-0 bg-white border-t border-stone-200 px-4 py-4">
        <div className="max-w-lg mx-auto flex gap-3">
          {isLastStep ? (
            <>
              <button
                onClick={() => {
                  onComplete?.();
                  router.push('/vault');
                }}
                className="flex-1 px-4 py-3 rounded-xl border border-stone-200 text-stone-600 font-medium hover:bg-stone-50 transition-colors"
              >
                Skip
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !canProceed()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-stone-900 text-white font-medium hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Save
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-stone-900 text-white font-medium hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
