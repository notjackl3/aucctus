import { ChevronDown, Pencil, X } from 'lucide-react';
import { useScoringConfigs } from '@hooks/query/scoringConfig.hook';
import { useBulkSubmissionUpdate } from '@hooks/query/idea-submissions.hook';
import {
  IBulkSubmissionUpdate,
  IdeaSubmissionStatus,
} from '@libs/api/types/ideaSubmissions';
import { cn } from '@libs/utils/react';
import useStore from '@stores/store';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const SUBMISSION_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'to_review', label: 'To Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectProps {
  label: string;
  placeholder: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}

const FormSelect: React.FC<FormSelectProps> = ({
  label,
  placeholder,
  value,
  options,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  const selectedLabel =
    options.find((o) => o.value === value)?.label || placeholder;

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (
        !triggerRef.current?.contains(target) &&
        !dropdownRef.current?.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className='space-y-1.5'>
      <label className='aucctus-text-sm-medium aucctus-text-primary'>
        {label}
      </label>
      <div ref={triggerRef}>
        <div
          className={cn(
            'aucctus-bg-primary aucctus-text-primary flex w-full cursor-pointer items-center justify-between rounded-lg border px-3 py-2 text-sm transition-all duration-200',
            {
              'aucctus-border-brand': isOpen,
              'aucctus-border-secondary': !isOpen,
            },
          )}
          onClick={() => setIsOpen(!isOpen)}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setIsOpen(!isOpen);
              e.preventDefault();
            }
          }}
        >
          <span
            className={cn({
              'aucctus-text-quaternary': !value,
              'aucctus-text-primary': !!value,
            })}
          >
            {selectedLabel}
          </span>
          <ChevronDown
            className={cn(
              'aucctus-stroke-secondary h-4 w-4 transition-transform duration-200',
              { 'rotate-180': isOpen },
            )}
          />
        </div>
      </div>

      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            data-aucctus-portal-target='true'
            className='aucctus-bg-primary aucctus-border-secondary fixed z-[10000] rounded-lg border shadow-lg'
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
              width: `${position.width}px`,
            }}
          >
            <ul className='no-scrollbar max-h-60 overflow-y-auto overscroll-contain py-1'>
              <li
                className={cn(
                  'aucctus-text-sm cursor-pointer px-3 py-2 transition-colors',
                  {
                    'aucctus-text-quaternary aucctus-bg-primary-hover':
                      value !== '',
                    'aucctus-text-primary aucctus-bg-secondary': value === '',
                  },
                )}
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                }}
              >
                {placeholder}
              </li>
              {options.map((opt) => (
                <li
                  key={opt.value}
                  className={cn(
                    'aucctus-text-sm aucctus-text-primary cursor-pointer px-3 py-2 transition-colors',
                    {
                      'aucctus-bg-primary-hover': opt.value !== value,
                      'aucctus-bg-secondary': opt.value === value,
                    },
                  )}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onChange(opt.value);
                      setIsOpen(false);
                      e.preventDefault();
                    }
                  }}
                >
                  {opt.label}
                </li>
              ))}
            </ul>
          </div>,
          document.body,
        )}
    </div>
  );
};

interface BulkEditSubmissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSubmissionUuids: string[];
  onSuccess?: () => void;
}

const BulkEditSubmissionsModal: React.FC<BulkEditSubmissionsModalProps> = ({
  isOpen,
  onClose,
  selectedSubmissionUuids,
  onSuccess,
}) => {
  const accountUuid = useStore((state) => state.auth.user?.account?.uuid);
  const { configs } = useScoringConfigs(accountUuid);
  const bulkUpdate = useBulkSubmissionUpdate();
  const contentRef = useRef<HTMLDivElement>(null);

  const [status, setStatus] = useState<string>('');
  const [scoringConfigUuid, setScoringConfigUuid] = useState<string>('');

  const count = selectedSubmissionUuids.length;
  const hasChanges = status !== '' || scoringConfigUuid !== '';

  const scoringConfigOptions: SelectOption[] = configs.map((config) => ({
    value: config.uuid,
    label: `${config.name}${config.isDefault ? ' (Default)' : ''}`,
  }));

  const resetForm = useCallback(() => {
    setStatus('');
    setScoringConfigUuid('');
  }, []);

  const handleApply = () => {
    const payload: IBulkSubmissionUpdate = {
      submission_uuids: selectedSubmissionUuids,
    };

    if (status) payload.status = status as IdeaSubmissionStatus;
    if (scoringConfigUuid) payload.scoring_config_uuid = scoringConfigUuid;

    bulkUpdate.mutate(payload, {
      onSuccess: () => {
        onClose();
        onSuccess?.();
        resetForm();
      },
    });
  };

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  // Close on overlay click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      const isPortalTarget =
        (event.target as Element)?.closest(
          '[data-aucctus-portal-target="true"]',
        ) ||
        (event.target as Element)?.hasAttribute('data-aucctus-portal-target');
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target as Node) &&
        !isPortalTarget
      ) {
        handleClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, handleClose]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, handleClose]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className='fixed inset-0 z-50 overflow-hidden'>
          {/* Glass overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className='glass-modal-overlay absolute inset-0'
          />

          {/* Content */}
          <div className='relative flex h-full w-full items-center justify-center'>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className='m-auto cursor-default'
            >
              {/* Shell */}
              <div className='liquid-glass-modal-shell'>
                {/* Rim */}
                <div
                  aria-hidden='true'
                  className='liquid-glass-modal-rim liquid-glass-modal-rim-animated'
                >
                  <div className='rim-orb rim-orb-1' />
                  <div className='rim-orb rim-orb-2' />
                </div>

                {/* Surface */}
                <div
                  ref={contentRef}
                  className='liquid-glass-modal-surface flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden'
                >
                  {/* Header */}
                  <div className='flex shrink-0 items-center justify-between border-b px-6 py-4'>
                    <div className='flex items-center gap-2'>
                      <Pencil className='aucctus-stroke-primary h-5 w-5' />
                      <h2 className='aucctus-text-lg-semibold aucctus-text-primary'>
                        Bulk Edit
                      </h2>
                    </div>
                    <button
                      onClick={handleClose}
                      className='aucctus-bg-secondary-hover rounded-md p-1.5 transition-colors'
                    >
                      <X className='aucctus-stroke-tertiary h-4 w-4' />
                    </button>
                  </div>

                  {/* Body */}
                  <div className='min-h-0 flex-1 overflow-y-auto'>
                    <div className='space-y-5 px-6 py-5'>
                      <p className='aucctus-text-sm aucctus-text-secondary'>
                        Editing {count} submission{count !== 1 ? 's' : ''}. Only
                        changed fields will be updated.
                      </p>

                      <FormSelect
                        label='Scoring Criteria'
                        placeholder='No change'
                        value={scoringConfigUuid}
                        options={scoringConfigOptions}
                        onChange={setScoringConfigUuid}
                      />

                      <FormSelect
                        label='Status'
                        placeholder='No change'
                        value={status}
                        options={SUBMISSION_STATUS_OPTIONS}
                        onChange={setStatus}
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className='flex shrink-0 items-center justify-end gap-3 border-t px-6 py-4'>
                    <button className='btn btn-secondary' onClick={handleClose}>
                      Cancel
                    </button>
                    <button
                      className='btn btn-primary'
                      onClick={handleApply}
                      disabled={!hasChanges || bulkUpdate.isLoading}
                    >
                      {bulkUpdate.isLoading
                        ? 'Applying...'
                        : `Apply to ${count} submission${count !== 1 ? 's' : ''}`}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default BulkEditSubmissionsModal;
