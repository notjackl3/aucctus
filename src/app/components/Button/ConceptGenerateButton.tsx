import { ComponentTooltip, Icon, Loading, PulsatingText } from '@components';
import {
  ConceptReportStatus,
  ConceptReportStatusBySection,
} from '@libs/api/types';
import { canOpenConceptWhilePending } from '@libs/utils/concepts';
import { cn } from '@libs/utils/react';
import { FunctionComponent, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ConceptStatusTooltip } from '../ToolTip/ConceptStatusTooltip';
import ConceptGeneratingButton from './ConceptGeneratingButton';

type ConceptRowButtonProps = {
  variant: ConceptReportStatus;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  reportStatusBySection?: ConceptReportStatusBySection;
  dateReportStarted?: string;
  dateReportCompleted?: string;
  conceptUuid?: string;
};

const getButtonContext = (variant: ConceptRowButtonProps['variant']) => {
  const variantContext: Record<
    ConceptReportStatus,
    { style: string; label: string | ReactNode }
  > = {
    complete: {
      style: `btn btn-light btn-bold btn-sm`,
      label: 'Open',
    },

    pending: {
      style: `btn btn-light btn-bold btn-sm`,
      label: (
        <span className='flex flex-row gap-2'>
          Loading
          <Loading isSmall />
        </span>
      ),
    },
    notStarted: {
      style: `btn btn-primary btn-bold btn-sm`,
      label: 'Generate',
    },

    error: {
      style: `btn btn-light btn-bold btn-sm`,
      label: (
        <>
          <Icon variant='refresh' height={20} width={20} /> Retry
        </>
      ),
    },
    draft: {
      style: `btn btn-light btn-bold btn-sm`,
      label: 'Continue',
    },
  };

  return variantContext[variant];
};

const ConceptGenerateButton: FunctionComponent<ConceptRowButtonProps> = ({
  variant,
  onClick,
  disabled,
  reportStatusBySection,
  dateReportStarted,
  dateReportCompleted,
  conceptUuid,
}) => {
  const canOpenWhilePending = canOpenConceptWhilePending(
    reportStatusBySection,
    dateReportCompleted,
  );

  const isGenerating = variant === 'pending' && !canOpenWhilePending;

  const animatedMaxWidth = isGenerating ? '150px' : '120px';

  // If in pending state, use the ConceptGeneratingButton component
  if (isGenerating) {
    return (
      <ConceptGeneratingButton
        reportStatusBySection={reportStatusBySection}
        dateReportStarted={dateReportStarted}
        dateReportCompleted={dateReportCompleted}
        conceptUuid={conceptUuid}
        animatedMaxWidth={animatedMaxWidth}
      />
    );
  }

  // Determine effective variant:
  // - If pending but can open (has completed sections), show as 'complete'
  // - If error but has dateReportCompleted, show as 'complete' (don't show Retry)
  // Treat pending with partial completion as openable, but keep real errors visible
  const effectiveVariant =
    variant === 'pending' && canOpenWhilePending ? 'complete' : variant;

  // Get button style and label
  const { style, label } = getButtonContext(effectiveVariant);
  const isUpdating = variant === 'pending' && canOpenWhilePending;

  const resolvedLabel = isUpdating ? (
    <PulsatingText text='Open' delayPerLetter={100} />
  ) : (
    label
  );

  // CSS for border trace pseudo-element
  const borderTraceStyles = isUpdating ? (
    <style>{`
      @keyframes borderTrace {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .btn-border-trace {
        position: relative;
        overflow: hidden;
      }
      .btn-border-trace::after {
        content: '';
        position: absolute;
        inset: -100%;
        background: conic-gradient(
          from 0deg,
          transparent 0%,
          transparent 88%,
          rgba(175, 20, 20, 0.5) 93%,
          rgba(175, 20, 20, 0.7) 96%,
          rgba(175, 20, 20, 0.5) 100%
        );
        animation: borderTrace 3s linear infinite;
        pointer-events: none;
        z-index: 0;
      }
      .btn-border-trace::before {
        content: '';
        position: absolute;
        inset: 1px;
        border-radius: 6px;
        background: inherit;
        z-index: 1;
        pointer-events: none;
      }
      .btn-border-trace > * {
        position: relative;
        z-index: 2;
      }
    `}</style>
  ) : null;

  // For all states with reportStatusBySection data, wrap with tooltip
  if (reportStatusBySection) {
    return (
      <>
        {borderTraceStyles}
        <ComponentTooltip
          tip={
            <ConceptStatusTooltip
              reportStatusBySection={reportStatusBySection}
              dateReportStarted={dateReportStarted}
              dateReportCompleted={dateReportCompleted}
              conceptUuid={conceptUuid}
            />
          }
          hideDelay={0}
        >
          <motion.button
            className={cn(style, { 'btn-border-trace': isUpdating })}
            onClick={onClick}
            disabled={disabled}
            initial={false}
            animate={{ maxWidth: animatedMaxWidth }}
            transition={{ type: 'spring', stiffness: 280, damping: 60 }}
          >
            <span>{resolvedLabel}</span>
          </motion.button>
        </ComponentTooltip>
      </>
    );
  }

  // Otherwise return the regular button
  return (
    <>
      {borderTraceStyles}
      <motion.button
        className={cn(style, { 'btn-border-trace': isUpdating })}
        onClick={onClick}
        disabled={disabled}
        initial={false}
        animate={{ maxWidth: animatedMaxWidth }}
        transition={{ type: 'spring', stiffness: 280, damping: 60 }}
      >
        <span>{resolvedLabel}</span>
      </motion.button>
    </>
  );
};

export default ConceptGenerateButton;
