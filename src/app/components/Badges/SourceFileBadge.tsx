import { ComponentTooltip } from '@components';
import { ISourceFileInfo } from '@libs/api/types/ideaSubmissions';
import { cn } from '@libs/utils/react';
import { motion } from 'framer-motion';
import { FileSpreadsheet, FileText } from 'lucide-react';
import React from 'react';

// File type icon mapping
const FILE_TYPE_ICONS: Record<string, typeof FileSpreadsheet> = {
  csv: FileSpreadsheet,
  xlsx: FileSpreadsheet,
  xls: FileSpreadsheet,
  tsv: FileSpreadsheet,
  pdf: FileText,
  doc: FileText,
  docx: FileText,
  txt: FileText,
};

// File type labels for display
const FILE_TYPE_LABELS: Record<string, string> = {
  csv: 'CSV File',
  xlsx: 'Excel Spreadsheet',
  xls: 'Excel Spreadsheet',
  tsv: 'TSV File',
  pdf: 'PDF Document',
  doc: 'Word Document',
  docx: 'Word Document',
  txt: 'Text File',
};

interface SourceFileBadgeProps {
  sourceFile: ISourceFileInfo;
  onClick?: () => void;
  size?: 'small' | 'medium';
  className?: string;
  /** Maximum characters to show for filename before truncating */
  maxLength?: number;
}

/**
 * SourceFileBadge Component
 *
 * Displays a clickable badge showing the source file for bulk-uploaded ideas.
 * Features:
 * - File type icon (spreadsheet vs document)
 * - Truncated filename with full name in tooltip
 * - Hover state with scale animation
 * - Click handler for future functionality (e.g., download, preview)
 */
const SourceFileBadge: React.FC<SourceFileBadgeProps> = ({
  sourceFile,
  onClick,
  size = 'small',
  className = '',
  maxLength = 20,
}) => {
  const FileIcon = FILE_TYPE_ICONS[sourceFile.fileType] || FileText;
  const fileTypeLabel = FILE_TYPE_LABELS[sourceFile.fileType] || 'Unknown File';

  // Truncate filename if needed
  const displayName =
    sourceFile.filename.length > maxLength
      ? `${sourceFile.filename.slice(0, maxLength)}...`
      : sourceFile.filename;

  const iconSizeClass = size === 'small' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  const textSizeClass =
    size === 'small' ? 'aucctus-text-xs' : 'aucctus-text-sm';
  const paddingClass = size === 'small' ? 'px-2 py-0.5' : 'px-2.5 py-1';

  const renderTooltipContent = () => (
    <div
      className='aucctus-bg-primary aucctus-border-secondary max-w-xs rounded-lg border p-3 shadow-lg'
      style={{
        boxShadow:
          '0 0 10px rgba(0, 0, 0, 0.05), 0 4px 10px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div className='mb-2 flex items-center gap-2'>
        <div className='aucctus-bg-secondary flex h-8 w-8 items-center justify-center rounded-lg'>
          <FileIcon className='aucctus-stroke-tertiary h-4 w-4' />
        </div>
        <div>
          <div className='aucctus-text-xs aucctus-text-tertiary'>
            {fileTypeLabel}
          </div>
        </div>
      </div>
      <div className='aucctus-text-sm-medium aucctus-text-primary break-all'>
        {sourceFile.filename}
      </div>
    </div>
  );

  return (
    <ComponentTooltip tip={renderTooltipContent()}>
      <motion.button
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        className={cn(
          'aucctus-border-secondary aucctus-bg-secondary inline-flex items-center gap-1.5 rounded-full border transition-colors',
          paddingClass,
          onClick && 'aucctus-bg-secondary-hover cursor-pointer',
          !onClick && 'cursor-default',
          className,
        )}
        whileHover={onClick ? { scale: 1.02 } : undefined}
        whileTap={onClick ? { scale: 0.98 } : undefined}
        type='button'
      >
        <FileIcon className={cn('aucctus-stroke-tertiary', iconSizeClass)} />
        <span
          className={cn('aucctus-text-secondary', textSizeClass)}
          title={sourceFile.filename}
        >
          {displayName}
        </span>
      </motion.button>
    </ComponentTooltip>
  );
};

export default SourceFileBadge;
