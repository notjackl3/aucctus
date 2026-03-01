/**
 * AddOverviewWidgetModal - Modal for adding new widgets to the overview
 *
 * Allows users to select a widget type, configure title + icon,
 * and optionally pre-populate the widget with initial items.
 * Follows the Living Personas AddWidgetModal inline data builder pattern.
 */

import { motion, AnimatePresence } from 'framer-motion';
import {
  AlignLeft,
  CheckSquare,
  ChevronDown,
  Layers,
  List,
  PieChart,
  Plus,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { LiquidGlassModal, LiquidGlassModalFooter } from '@components';
import { cn } from '@libs/utils/react';
import type {
  NucleusOverviewWidgetType,
  ICreateNucleusOverviewWidgetPayload,
  ICreateOverviewWidgetItemPayload,
} from '@libs/api/types/nucleusOverview';
import WidgetIconPicker from '../LivingPersonasTab/widgets/WidgetIconPicker';

/** Props for the AddOverviewWidgetModal component */
export interface AddOverviewWidgetModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when the modal should close */
  onOpenChange: (open: boolean) => void;
  /** Callback to create the widget via API */
  onCreateWidget: (data: ICreateNucleusOverviewWidgetPayload) => Promise<void>;
}

/** Widget type configuration */
interface WidgetTypeConfig {
  type: NucleusOverviewWidgetType;
  label: string;
  description: string;
  icon: LucideIcon;
}

/** Available widget types (thesis excluded — unique per overview) */
const widgetTypes: WidgetTypeConfig[] = [
  {
    type: 'card_list',
    label: 'Card List',
    description: 'Cards with title, description, and icon',
    icon: List,
  },
  {
    type: 'checklist',
    label: 'Checklist',
    description: 'Simple text checklist items',
    icon: CheckSquare,
  },
  {
    type: 'accordion',
    label: 'Accordion',
    description: 'Expandable sections with details',
    icon: Layers,
  },
  {
    type: 'visualization',
    label: 'Visualization',
    description: 'Visual data representation',
    icon: PieChart,
  },
  {
    type: 'constrained_text',
    label: 'Constrained Text',
    description: 'Two-line constraint pairs',
    icon: AlignLeft,
  },
];

/** Pending item for widget initialization — fields used depend on widget type */
interface PendingItem {
  id: number;
  text?: string;
  title?: string;
  description?: string;
  name?: string;
  line1?: string;
  line2?: string;
  label?: string;
  shortName?: string;
}

/** Shared input class for inline item builders */
const inputClass = cn(
  'rounded-lg border px-2.5 py-1.5',
  'aucctus-bg-secondary aucctus-text-primary',
  'aucctus-border-secondary',
  'placeholder:aucctus-text-quaternary',
  'focus:aucctus-border-brand focus:outline-none',
  'text-sm',
);

/** Returns the display label for a pending item based on widget type */
const getPendingItemLabel = (
  item: PendingItem,
  type: NucleusOverviewWidgetType,
): string => {
  if (type === 'checklist') return item.text ?? '';
  if (type === 'card_list') return item.title ?? '';
  if (type === 'accordion') return item.name ?? '';
  if (type === 'visualization')
    return `${item.label ?? ''} — ${item.title ?? ''}`;
  if (type === 'constrained_text') return item.line1 ?? '';
  return '';
};

/** Returns the secondary text for a pending item */
const getPendingItemSecondary = (
  item: PendingItem,
  type: NucleusOverviewWidgetType,
): string | undefined => {
  if (type === 'card_list' || type === 'accordion' || type === 'visualization')
    return item.description;
  if (type === 'constrained_text') return item.line2;
  return undefined;
};

const AddOverviewWidgetModal: React.FC<AddOverviewWidgetModalProps> = ({
  open,
  onOpenChange,
  onCreateWidget,
}) => {
  const [selectedType, setSelectedType] =
    useState<NucleusOverviewWidgetType | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('target');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);

  // Inline data builder state
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [nextItemId, setNextItemId] = useState(1);

  // Type-specific input fields
  const [dpText, setDpText] = useState('');
  const [dpTitle, setDpTitle] = useState('');
  const [dpDescription, setDpDescription] = useState('');
  const [dpName, setDpName] = useState('');
  const [dpLine1, setDpLine1] = useState('');
  const [dpLine2, setDpLine2] = useState('');
  const [dpLabel, setDpLabel] = useState('');
  const [dpShortName, setDpShortName] = useState('');

  const clearItemInputs = useCallback(() => {
    setDpText('');
    setDpTitle('');
    setDpDescription('');
    setDpName('');
    setDpLine1('');
    setDpLine2('');
    setDpLabel('');
    setDpShortName('');
  }, []);

  const resetForm = useCallback(() => {
    setSelectedType(null);
    setTitle('');
    setDescription('');
    setIcon('target');
    setIsSubmitting(false);
    setShowIconPicker(false);
    setPendingItems([]);
    setNextItemId(1);
    clearItemInputs();
  }, [clearItemInputs]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
    resetForm();
  }, [onOpenChange, resetForm]);

  const handleTypeSelect = useCallback(
    (type: NucleusOverviewWidgetType) => {
      setSelectedType(type);
      setPendingItems([]);
      clearItemInputs();
    },
    [clearItemInputs],
  );

  // Check if the current item inputs are valid for adding
  const canAddItem = useCallback((): boolean => {
    if (!selectedType) return false;
    if (selectedType === 'checklist') return dpText.trim().length > 0;
    if (selectedType === 'card_list') return dpTitle.trim().length > 0;
    if (selectedType === 'accordion') return dpName.trim().length > 0;
    if (selectedType === 'visualization')
      return dpLabel.trim().length > 0 && dpTitle.trim().length > 0;
    if (selectedType === 'constrained_text') return dpLine1.trim().length > 0;
    return false;
  }, [selectedType, dpText, dpTitle, dpName, dpLabel, dpLine1]);

  const handleAddPendingItem = useCallback(() => {
    if (!canAddItem()) return;

    const item: PendingItem = { id: nextItemId };

    if (selectedType === 'checklist') {
      item.text = dpText.trim();
    } else if (selectedType === 'card_list') {
      item.title = dpTitle.trim();
      if (dpDescription.trim()) item.description = dpDescription.trim();
    } else if (selectedType === 'accordion') {
      item.name = dpName.trim();
      if (dpDescription.trim()) item.description = dpDescription.trim();
    } else if (selectedType === 'visualization') {
      item.label = dpLabel.trim();
      item.title = dpTitle.trim();
      if (dpShortName.trim()) item.shortName = dpShortName.trim();
      if (dpDescription.trim()) item.description = dpDescription.trim();
    } else if (selectedType === 'constrained_text') {
      item.line1 = dpLine1.trim();
      if (dpLine2.trim()) item.line2 = dpLine2.trim();
    }

    setPendingItems((prev) => [...prev, item]);
    setNextItemId((prev) => prev + 1);
    clearItemInputs();
  }, [
    canAddItem,
    nextItemId,
    selectedType,
    dpText,
    dpTitle,
    dpDescription,
    dpName,
    dpLabel,
    dpShortName,
    dpLine1,
    dpLine2,
    clearItemInputs,
  ]);

  const handleItemKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddPendingItem();
      }
    },
    [handleAddPendingItem],
  );

  const removePendingItem = useCallback((id: number) => {
    setPendingItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedType || !title.trim()) return;

    setIsSubmitting(true);
    try {
      const payload: ICreateNucleusOverviewWidgetPayload = {
        widgetType: selectedType,
        title: title.trim(),
        icon,
      };

      if (description.trim()) {
        payload.description = description.trim();
      }

      if (pendingItems.length > 0) {
        payload.initialItems = pendingItems.map(
          (item): ICreateOverviewWidgetItemPayload => {
            if (selectedType === 'checklist') {
              return { text: item.text };
            }
            if (selectedType === 'card_list') {
              return { title: item.title, description: item.description };
            }
            if (selectedType === 'accordion') {
              return { name: item.name, description: item.description };
            }
            if (selectedType === 'visualization') {
              return {
                label: item.label,
                shortName: item.shortName,
                title: item.title,
                description: item.description,
              };
            }
            // constrained_text
            return { line1: item.line1, line2: item.line2 };
          },
        );
      }

      await onCreateWidget(payload);
      handleClose();
    } catch {
      // Error handled by the mutation hook
    } finally {
      setIsSubmitting(false);
    }
  }, [
    selectedType,
    title,
    description,
    icon,
    pendingItems,
    onCreateWidget,
    handleClose,
  ]);

  const canSubmit = selectedType !== null && title.trim().length > 0;

  /** Section label for the inline item builder based on type */
  const itemsLabel =
    selectedType === 'checklist'
      ? 'Checklist Items'
      : selectedType === 'card_list'
        ? 'Cards'
        : selectedType === 'accordion'
          ? 'Sections'
          : selectedType === 'visualization'
            ? 'Horizons'
            : selectedType === 'constrained_text'
              ? 'Constraints'
              : 'Items';

  return (
    <LiquidGlassModal
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose();
      }}
      title='Add Widget'
      description='Choose a widget type and configure it for your overview.'
      size='md'
    >
      <div className='space-y-5 p-1'>
        {/* Step 1: Type selection */}
        <div>
          <label className='aucctus-text-xs-bold aucctus-text-secondary mb-2 block uppercase tracking-wider'>
            Widget Type
          </label>
          <div className='grid grid-cols-2 gap-2'>
            {widgetTypes.map((wt) => {
              const Icon = wt.icon;
              const isSelected = selectedType === wt.type;

              return (
                <button
                  key={wt.type}
                  type='button'
                  onClick={() => handleTypeSelect(wt.type)}
                  className={cn(
                    'flex items-start gap-3 rounded-xl border-2 p-3 text-left transition-all',
                    isSelected
                      ? 'aucctus-border-brand aucctus-bg-brand-secondary'
                      : 'aucctus-border-secondary aucctus-bg-secondary hover:aucctus-bg-tertiary',
                  )}
                >
                  <Icon
                    size={18}
                    className={cn(
                      'mt-0.5 shrink-0',
                      isSelected
                        ? 'aucctus-stroke-brand-primary'
                        : 'aucctus-stroke-secondary',
                    )}
                  />
                  <div>
                    <div
                      className={cn(
                        'text-sm font-medium',
                        isSelected
                          ? 'aucctus-text-brand-primary'
                          : 'aucctus-text-primary',
                      )}
                    >
                      {wt.label}
                    </div>
                    <div className='aucctus-text-tertiary text-xs'>
                      {wt.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Config (after type selection) */}
        <AnimatePresence>
          {selectedType && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className='space-y-4 overflow-hidden'
            >
              {/* Title input */}
              <div>
                <label className='aucctus-text-xs-bold aucctus-text-secondary mb-1.5 block uppercase tracking-wider'>
                  Widget Title
                </label>
                <input
                  type='text'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder='e.g., Key Initiatives'
                  maxLength={255}
                  className='aucctus-bg-secondary aucctus-border-secondary aucctus-text-primary focus:aucctus-border-brand w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors'
                  autoFocus
                />
              </div>

              {/* Description input */}
              <div>
                <label className='aucctus-text-xs-bold aucctus-text-secondary mb-1.5 block uppercase tracking-wider'>
                  Description
                  <span className='aucctus-text-tertiary ml-1.5 font-normal normal-case'>
                    (optional)
                  </span>
                </label>
                <input
                  type='text'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder='Brief description of this widget...'
                  maxLength={500}
                  className='aucctus-bg-secondary aucctus-border-secondary aucctus-text-primary focus:aucctus-border-brand w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors'
                />
              </div>

              {/* Icon picker */}
              <div>
                <button
                  type='button'
                  onClick={() => setShowIconPicker(!showIconPicker)}
                  className='aucctus-text-xs-bold aucctus-text-secondary mb-1.5 flex items-center gap-1 uppercase tracking-wider'
                >
                  Icon
                  <ChevronDown
                    size={12}
                    className={cn(
                      'transition-transform',
                      showIconPicker && 'rotate-180',
                    )}
                  />
                </button>
                <AnimatePresence>
                  {showIconPicker && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.15 }}
                      className='overflow-hidden'
                    >
                      <WidgetIconPicker value={icon} onChange={setIcon} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Inline item builder */}
              <div>
                <label className='aucctus-text-xs-bold aucctus-text-secondary mb-2 block uppercase tracking-wider'>
                  {itemsLabel}
                  <span className='aucctus-text-tertiary ml-1.5 font-normal normal-case'>
                    (optional)
                  </span>
                </label>

                {/* Pending items list */}
                <AnimatePresence mode='popLayout'>
                  {pendingItems.map((item, idx) => {
                    const primary = getPendingItemLabel(item, selectedType);
                    const secondary = getPendingItemSecondary(
                      item,
                      selectedType,
                    );

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20, height: 0 }}
                        transition={{ duration: 0.15 }}
                        className='mb-1.5 flex items-center gap-2'
                      >
                        <span className='aucctus-bg-tertiary aucctus-text-xs-bold aucctus-text-secondary flex h-5 w-5 shrink-0 items-center justify-center rounded-full'>
                          {idx + 1}
                        </span>
                        <span className='aucctus-text-sm aucctus-text-primary flex-1 truncate'>
                          {primary}
                        </span>
                        {secondary && (
                          <span className='aucctus-text-xs aucctus-text-tertiary max-w-[120px] truncate'>
                            {secondary}
                          </span>
                        )}
                        <button
                          type='button'
                          onClick={() => removePendingItem(item.id)}
                          className='flex h-5 w-5 shrink-0 items-center justify-center rounded hover:bg-red-100 dark:hover:bg-red-900/30'
                        >
                          <X size={12} className='text-red-500' />
                        </button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {/* Add item inline form — type-specific fields */}
                <div className='mt-2 flex items-center gap-2'>
                  {selectedType === 'checklist' && (
                    <input
                      type='text'
                      value={dpText}
                      onChange={(e) => setDpText(e.target.value)}
                      onKeyDown={handleItemKeyDown}
                      placeholder='Checklist item text...'
                      className={cn(inputClass, 'flex-1')}
                    />
                  )}

                  {selectedType === 'card_list' && (
                    <>
                      <input
                        type='text'
                        value={dpTitle}
                        onChange={(e) => setDpTitle(e.target.value)}
                        onKeyDown={handleItemKeyDown}
                        placeholder='Title'
                        className={cn(inputClass, 'flex-1')}
                      />
                      <input
                        type='text'
                        value={dpDescription}
                        onChange={(e) => setDpDescription(e.target.value)}
                        onKeyDown={handleItemKeyDown}
                        placeholder='Description'
                        className={cn(inputClass, 'flex-1')}
                      />
                    </>
                  )}

                  {selectedType === 'accordion' && (
                    <>
                      <input
                        type='text'
                        value={dpName}
                        onChange={(e) => setDpName(e.target.value)}
                        onKeyDown={handleItemKeyDown}
                        placeholder='Section name'
                        className={cn(inputClass, 'flex-1')}
                      />
                      <input
                        type='text'
                        value={dpDescription}
                        onChange={(e) => setDpDescription(e.target.value)}
                        onKeyDown={handleItemKeyDown}
                        placeholder='Description'
                        className={cn(inputClass, 'flex-1')}
                      />
                    </>
                  )}

                  {selectedType === 'visualization' && (
                    <>
                      <input
                        type='text'
                        value={dpLabel}
                        onChange={(e) => setDpLabel(e.target.value)}
                        onKeyDown={handleItemKeyDown}
                        placeholder='Label (e.g., H1)'
                        className={cn(inputClass, 'w-24')}
                      />
                      <input
                        type='text'
                        value={dpShortName}
                        onChange={(e) => setDpShortName(e.target.value)}
                        onKeyDown={handleItemKeyDown}
                        placeholder='Short name'
                        className={cn(inputClass, 'w-28')}
                      />
                      <input
                        type='text'
                        value={dpTitle}
                        onChange={(e) => setDpTitle(e.target.value)}
                        onKeyDown={handleItemKeyDown}
                        placeholder='Title'
                        className={cn(inputClass, 'flex-1')}
                      />
                    </>
                  )}

                  {selectedType === 'constrained_text' && (
                    <>
                      <input
                        type='text'
                        value={dpLine1}
                        onChange={(e) => setDpLine1(e.target.value)}
                        onKeyDown={handleItemKeyDown}
                        placeholder='First line'
                        className={cn(inputClass, 'flex-1')}
                      />
                      <input
                        type='text'
                        value={dpLine2}
                        onChange={(e) => setDpLine2(e.target.value)}
                        onKeyDown={handleItemKeyDown}
                        placeholder='Second line'
                        className={cn(inputClass, 'flex-1')}
                      />
                    </>
                  )}

                  <button
                    type='button'
                    onClick={handleAddPendingItem}
                    disabled={!canAddItem()}
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors',
                      canAddItem()
                        ? 'aucctus-bg-brand-solid text-white hover:opacity-90'
                        : 'aucctus-bg-tertiary aucctus-text-quaternary cursor-not-allowed',
                    )}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Description input for visualization items */}
                {selectedType === 'visualization' && (
                  <input
                    type='text'
                    value={dpDescription}
                    onChange={(e) => setDpDescription(e.target.value)}
                    onKeyDown={handleItemKeyDown}
                    placeholder='Description (optional)'
                    className={cn(inputClass, 'mt-2 w-full')}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <LiquidGlassModalFooter>
        <button
          type='button'
          onClick={handleClose}
          className='aucctus-text-secondary hover:aucctus-bg-secondary rounded-lg px-4 py-2 text-sm font-medium transition-colors'
        >
          Cancel
        </button>
        <button
          type='button'
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          className='aucctus-bg-brand-solid rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-50'
        >
          {isSubmitting ? 'Adding...' : 'Add Widget'}
        </button>
      </LiquidGlassModalFooter>
    </LiquidGlassModal>
  );
};

export default AddOverviewWidgetModal;
