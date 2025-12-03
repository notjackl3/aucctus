import { ComponentTooltip, Icon, Loading } from '@components';
import {
  ConceptReportStatus,
  ConceptReportStatusBySection,
} from '@libs/api/types';
import { canOpenConceptWhilePending } from '@libs/utils/concepts';
import { FunctionComponent, ReactNode } from 'react';
import { animated, useSpring } from 'react-spring';
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

  // Animate width transition between Generate (120px) and Generating (150px)
  const animationStyle = useSpring({
    maxWidth: isGenerating ? '150px' : '120px',
    config: {
      tension: 280,
      friction: 60,
    },
  });

  // If in pending state, use the ConceptGeneratingButton component
  if (isGenerating) {
    return (
      <ConceptGeneratingButton
        reportStatusBySection={reportStatusBySection}
        dateReportStarted={dateReportStarted}
        dateReportCompleted={dateReportCompleted}
        conceptUuid={conceptUuid}
        animationStyle={animationStyle}
      />
    );
  }

  // Determine effective variant:
  // - If pending but can open (has completed sections), show as 'complete'
  // - If error but has dateReportCompleted, show as 'complete' (don't show Retry)
  const effectiveVariant =
    (variant === 'pending' && canOpenWhilePending) ||
    (variant === 'error' && dateReportCompleted)
      ? 'complete'
      : variant;

  // Get button style and label
  const { style, label } = getButtonContext(effectiveVariant);
  const resolvedLabel =
    variant === 'pending' && canOpenWhilePending ? (
      <span className='flex items-center gap-2'>
        <span className='aucctus-text-primary flex'>
          {'Updating'.split('').map((letter, index) => (
            <span
              key={index}
              className='inline-block animate-pulse-slow'
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {letter}
            </span>
          ))}
        </span>
      </span>
    ) : (
      label
    );

  // For all states with reportStatusBySection data, wrap with tooltip
  if (reportStatusBySection) {
    return (
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
        <animated.button
          className={style}
          onClick={onClick}
          disabled={disabled}
          style={animationStyle}
        >
          {resolvedLabel}
        </animated.button>
      </ComponentTooltip>
    );
  }

  // Otherwise return the regular button
  return (
    <animated.button
      className={style}
      onClick={onClick}
      disabled={disabled}
      style={animationStyle}
    >
      {resolvedLabel}
    </animated.button>
  );
};

export default ConceptGenerateButton;
