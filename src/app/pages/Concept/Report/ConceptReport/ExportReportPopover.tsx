import { toast } from '@components';
import { useExportConceptReport } from '@hooks/query/concepts.hook';
import { downloadCsv, downloadExcel } from '@libs/utils/files';
import { cn } from '@libs/utils/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
} from 'lucide-react';
import React, { useCallback, useState } from 'react';

const SECTION_GROUPS = [
  { key: 'overview', label: 'Overview' },
  { key: 'trends', label: 'Trends' },
  { key: 'ecosystem', label: 'Ecosystem' },
  { key: 'financial_projections', label: 'Financial' },
  { key: 'customer_profiles', label: 'Customers' },
  { key: 'assumptions', label: 'Assumptions' },
] as const;

const ALL_SECTION_KEYS = SECTION_GROUPS.map((s) => s.key);

interface ExportReportPopoverProps {
  conceptUuid: string;
  conceptTitle?: string;
  onClose: () => void;
}

const ExportReportPopover: React.FC<ExportReportPopoverProps> = ({
  conceptUuid,
  conceptTitle,
  onClose,
}) => {
  const [selectedSections, setSelectedSections] = useState<Set<string>>(
    () => new Set(ALL_SECTION_KEYS),
  );
  const [format, setFormat] = useState<'xlsx' | 'csv'>('xlsx');
  const exportMutation = useExportConceptReport();

  const allSelected = selectedSections.size === ALL_SECTION_KEYS.length;
  const noneSelected = selectedSections.size === 0;

  const toggleSection = useCallback((key: string) => {
    setSelectedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedSections((prev) =>
      prev.size === ALL_SECTION_KEYS.length
        ? new Set()
        : new Set(ALL_SECTION_KEYS),
    );
  }, []);

  const handleExport = useCallback(() => {
    const sections = Array.from(selectedSections);
    exportMutation.mutate(
      { conceptUuid, sections, format },
      {
        onSuccess: (blob) => {
          const sanitizedTitle = (conceptTitle || 'concept-report')
            .replace(/[^a-zA-Z0-9-_ ]/g, '')
            .replace(/\s+/g, '-')
            .toLowerCase();
          const filename = `${sanitizedTitle}.${format}`;
          if (format === 'xlsx') {
            downloadExcel(blob, filename);
          } else {
            downloadCsv(blob, filename);
          }
          toast.success('Export Complete', 'Your report has been downloaded.');
          onClose();
        },
      },
    );
  }, [
    conceptUuid,
    conceptTitle,
    format,
    selectedSections,
    exportMutation,
    onClose,
  ]);

  return (
    <div className='aucctus-bg-primary aucctus-border-primary flex w-[280px] select-none flex-col overflow-hidden rounded-md border shadow-xl'>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.2 }}
        className='flex items-center gap-2 px-3 py-3'
      >
        <Download className='aucctus-stroke-secondary h-4 w-4' />
        <span className='aucctus-text-sm-semibold aucctus-text-secondary'>
          Export Report
        </span>
      </motion.div>

      {/* Section toggles */}
      <div className='flex flex-col px-2 pb-2'>
        <div className='mb-2 flex items-center justify-between px-1'>
          <span className='aucctus-text-xs aucctus-text-tertiary'>
            Sections
          </span>
          <button
            onClick={toggleAll}
            className='aucctus-text-brand-primary hover:aucctus-text-brand-primary-hover aucctus-text-xs-semibold transition-colors'
          >
            {allSelected ? 'Deselect all' : 'Select all'}
          </button>
        </div>

        <div className='flex flex-col'>
          {SECTION_GROUPS.map((section, index) => {
            const isSelected = selectedSections.has(section.key);
            return (
              <motion.button
                key={section.key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 30,
                  delay: 0.06 + index * 0.035,
                }}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 transition-colors',
                  isSelected
                    ? 'aucctus-bg-secondary-hover'
                    : 'hover:aucctus-bg-secondary-hover',
                )}
                onClick={() => toggleSection(section.key)}
              >
                <motion.div
                  animate={{
                    scale: isSelected ? 1 : 0.9,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 25,
                  }}
                  className={cn(
                    'flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-colors',
                    isSelected
                      ? 'aucctus-bg-brand-solid border-transparent'
                      : 'aucctus-border-secondary',
                  )}
                >
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{
                          type: 'spring',
                          stiffness: 600,
                          damping: 20,
                        }}
                      >
                        <Check className='h-3 w-3 text-white' />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
                <span className='aucctus-text-sm aucctus-text-secondary flex-1 text-left'>
                  {section.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Format selector */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.2 }}
        className='aucctus-border-secondary border-t px-3 py-2.5'
      >
        <span className='aucctus-text-xs aucctus-text-tertiary mb-1.5 block px-1'>
          Format
        </span>
        <div className='flex gap-2'>
          <button
            onClick={() => setFormat('xlsx')}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              format === 'xlsx'
                ? 'aucctus-bg-brand-subtle aucctus-text-brand-primary'
                : 'aucctus-bg-secondary aucctus-text-tertiary aucctus-bg-secondary-hover',
            )}
          >
            <FileSpreadsheet className='h-3.5 w-3.5' />
            Excel
          </button>
          <button
            onClick={() => setFormat('csv')}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              format === 'csv'
                ? 'aucctus-bg-brand-subtle aucctus-text-brand-primary'
                : 'aucctus-bg-secondary aucctus-text-tertiary aucctus-bg-secondary-hover',
            )}
          >
            <FileText className='h-3.5 w-3.5' />
            CSV
          </button>
        </div>
      </motion.div>

      {/* Export button */}
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.2 }}
        className='aucctus-border-secondary border-t px-3 py-2.5'
      >
        <motion.button
          whileHover={
            noneSelected || exportMutation.isLoading
              ? undefined
              : { scale: 1.01 }
          }
          whileTap={
            noneSelected || exportMutation.isLoading
              ? undefined
              : { scale: 0.98 }
          }
          onClick={handleExport}
          disabled={noneSelected || exportMutation.isLoading}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-white transition-colors',
            noneSelected || exportMutation.isLoading
              ? 'cursor-not-allowed opacity-50'
              : '',
            'aucctus-bg-brand-solid',
          )}
        >
          {exportMutation.isLoading ? (
            <>
              <Loader2 className='h-4 w-4 animate-spin' />
              Exporting…
            </>
          ) : (
            <>
              <Download className='h-4 w-4' />
              Export {selectedSections.size}{' '}
              {selectedSections.size === 1 ? 'section' : 'sections'}
            </>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default ExportReportPopover;
