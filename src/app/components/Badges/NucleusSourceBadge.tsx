import React, { useMemo } from 'react';
import images from '@assets/img';
import { ComponentTooltip } from '@components';
import type { NucleusAnswerSource, FileType } from '@libs/api/types/nucleus';
import { cn } from '@libs/utils/react';
import { getBaseUrl, getLogoUrl } from '@libs/utils/source';
import { motion } from 'framer-motion';
import { Lightbulb, Link } from 'lucide-react';
import { DynamicIcon } from '@libs/utils/iconMap';

// File type icon mapping to Icon component variants
const FILE_TYPE_ICONS: Record<FileType, string> = {
  pdf: 'file-text',
  doc: 'file-text',
  docx: 'file-text',
  txt: 'file-text',
  csv: 'file-spreadsheet',
  xls: 'file-spreadsheet',
  xlsx: 'file-spreadsheet',
  ppt: 'file-text',
  pptx: 'file-text',
  file: 'file',
};

// File type labels for display
const FILE_TYPE_LABELS: Record<FileType, string> = {
  pdf: 'PDF Document',
  doc: 'Word Document',
  docx: 'Word Document',
  txt: 'Text File',
  csv: 'CSV Spreadsheet',
  xls: 'Excel Spreadsheet',
  xlsx: 'Excel Spreadsheet',
  ppt: 'PowerPoint',
  pptx: 'PowerPoint',
  file: 'File',
};

// Source type detection
type SourceType = 'file' | 'ai-reasoning' | 'web';

const getSourceType = (source: NucleusAnswerSource): SourceType => {
  if (source.nucleusFileSource) return 'file';
  if (
    !source.url &&
    (source.title?.toLowerCase().includes('ai reasoning') ||
      source.title?.toLowerCase().includes('ai synthesis'))
  ) {
    return 'ai-reasoning';
  }
  return 'web';
};

interface NucleusSourceBadgeProps {
  source: NucleusAnswerSource;
  onClick?: () => void;
  size?: 'small' | 'medium';
  className?: string;
  /** Maximum characters to show for title before truncating */
  maxLength?: number;
  /** Hide delay for tooltip in ms */
  hideDelay?: number;
}

/**
 * NucleusSourceBadge Component
 *
 * Displays a badge for Nucleus answer sources, with special handling for
 * user-uploaded file sources (nucleusFileSource). Features:
 * - File type icon for uploaded documents
 * - Truncated filename with full details in tooltip
 * - Credibility score indicator
 * - Hover state with scale animation
 * - Click handler for future functionality
 */
const NucleusSourceBadge: React.FC<NucleusSourceBadgeProps> = ({
  source,
  onClick,
  size = 'small',
  className = '',
  maxLength = 25,
  hideDelay = 0,
}) => {
  const sourceType = getSourceType(source);

  const { displayTitle, fileTypeLabel, iconVariant } = useMemo(() => {
    // File source - use file metadata
    if (sourceType === 'file' && source.nucleusFileSource) {
      const fileType = source.nucleusFileSource.type || 'file';
      const title = source.nucleusFileSource.title || source.title;
      return {
        displayTitle:
          title.length > maxLength ? `${title.slice(0, maxLength)}...` : title,
        fileTypeLabel: FILE_TYPE_LABELS[fileType] || 'File',
        iconVariant: FILE_TYPE_ICONS[fileType] || 'file',
      };
    }

    // AI Reasoning source
    if (sourceType === 'ai-reasoning') {
      const isAiSynthesis = source.title
        ?.toLowerCase()
        .includes('ai synthesis');
      return {
        displayTitle: isAiSynthesis ? 'AI Synthesis' : 'AI Reasoning',
        fileTypeLabel: isAiSynthesis ? 'AI Synthesis' : 'AI Reasoning',
        iconVariant: 'lightbulb',
      };
    }

    // Web source - use URL/title
    const title = source.url ? getBaseUrl(source.url) : source.title;
    return {
      displayTitle:
        title.length > maxLength ? `${title.slice(0, maxLength)}...` : title,
      fileTypeLabel: 'Web Source',
      iconVariant: 'link',
    };
  }, [source, maxLength, sourceType]);

  const iconSizeClass = size === 'small' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  const textSizeClass =
    size === 'small' ? 'aucctus-text-xs' : 'aucctus-text-sm';
  const paddingClass = size === 'small' ? 'px-2 py-0.5' : 'px-2.5 py-1';
  const logoContainerClass = size === 'small' ? 'h-5 w-5' : 'h-6 w-6';

  const renderIcon = () => {
    // File source - show file type icon
    if (sourceType === 'file') {
      return (
        <div
          className={cn(
            'aucctus-bg-secondary flex items-center justify-center rounded-full',
            logoContainerClass,
          )}
        >
          <DynamicIcon
            variant={iconVariant as 'file'}
            className={cn('aucctus-stroke-tertiary', iconSizeClass)}
          />
        </div>
      );
    }

    // AI Reasoning - show lightbulb icon
    if (sourceType === 'ai-reasoning') {
      return (
        <div
          className={cn(
            'aucctus-border-primary flex items-center justify-center overflow-hidden rounded-full',
            logoContainerClass,
          )}
        >
          <Lightbulb
            className={cn('aucctus-stroke-quaternary', iconSizeClass)}
          />
        </div>
      );
    }

    // Web source - show website logo
    const sourceBaseUrl = source.url ? getBaseUrl(source.url) : null;
    return (
      <div
        className={cn(
          'flex items-center justify-center overflow-hidden rounded-full border border-transparent',
          logoContainerClass,
        )}
      >
        {sourceBaseUrl ? (
          <img
            className='h-full w-full object-contain'
            alt='source-logo'
            src={getLogoUrl(sourceBaseUrl)}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = images.link;
            }}
          />
        ) : (
          <Link className={cn('aucctus-stroke-tertiary', iconSizeClass)} />
        )}
      </div>
    );
  };

  const renderTooltipContent = () => (
    <div
      className='aucctus-bg-primary aucctus-border-secondary max-w-sm overflow-hidden rounded-xl border p-4 shadow-lg'
      style={{
        boxShadow:
          '0 0 15px rgba(0, 0, 0, 0.075), 0 8px 15px rgba(0, 0, 0, 0.15)',
      }}
    >
      {/* Header with icon and source type */}
      <div className='mb-3 flex items-center gap-3'>
        <div className='aucctus-bg-secondary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg'>
          <DynamicIcon
            variant={iconVariant as 'file'}
            className='aucctus-stroke-tertiary h-5 w-5'
          />
        </div>
        <div className='aucctus-text-xs aucctus-text-tertiary'>
          {fileTypeLabel}
        </div>
      </div>

      {/* Title */}
      <div className='aucctus-text-sm-semibold aucctus-text-primary mb-2 break-words'>
        {sourceType === 'file'
          ? source.nucleusFileSource?.title
          : sourceType === 'web' && source.url
            ? source.title
            : fileTypeLabel}
      </div>

      {/* Description */}
      {source.description && (
        <div className='aucctus-text-xs aucctus-text-secondary mb-2'>
          {source.description}
        </div>
      )}

      {/* URL for web sources */}
      {sourceType === 'web' && source.url && (
        <div className='aucctus-text-xs aucctus-text-tertiary mb-2 truncate'>
          {source.url}
        </div>
      )}

      {/* Citations */}
      {source.citations && (
        <div className='aucctus-bg-secondary aucctus-text-xs aucctus-text-tertiary mt-2 rounded-lg p-2 italic'>
          &ldquo;{source.citations}&rdquo;
        </div>
      )}

      {/* File metadata for file sources */}
      {sourceType === 'file' && source.nucleusFileSource?.originalFilename && (
        <div className='aucctus-border-secondary aucctus-text-xs aucctus-text-tertiary mt-3 truncate border-t pt-2'>
          {source.nucleusFileSource.originalFilename}
        </div>
      )}
    </div>
  );

  return (
    <ComponentTooltip tip={renderTooltipContent()} hideDelay={hideDelay}>
      <motion.button
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        className={cn(
          'aucctus-border-primary flex items-center gap-1.5 rounded-full border transition-colors',
          paddingClass,
          onClick && 'aucctus-bg-primary-hover cursor-pointer',
          !onClick && 'cursor-default',
          className,
        )}
        whileHover={onClick ? { scale: 1.02 } : undefined}
        whileTap={onClick ? { scale: 0.98 } : undefined}
        type='button'
      >
        {renderIcon()}
        <span
          className={cn('aucctus-text-secondary pr-1', textSizeClass)}
          title={
            sourceType === 'file'
              ? source.nucleusFileSource?.title
              : source.title
          }
        >
          {displayTitle}
        </span>
      </motion.button>
    </ComponentTooltip>
  );
};

export default React.memo(NucleusSourceBadge);
