import { ComponentTooltip, Icon, Loading } from '@components';
import {
  ConceptReportStatus,
  ConceptReportStatusBySection,
} from '@libs/api/types';
import { canOpenConceptWhilePending } from '@libs/utils/concepts';
import { FunctionComponent, ReactNode } from 'react';
import { ConceptStatusTooltip } from '../ToolTip/ConceptStatusTooltip';
import ConceptGeneratingButton from './ConceptGeneratingButton';

type ConceptRowButtonProps = {
  variant: ConceptReportStatus;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  reportStatusBySection?: ConceptReportStatusBySection;
  dateReportStarted?: string;
  dateReportCompleted?: string;
};

const getButtonContext = (variant: ConceptRowButtonProps['variant']) => {
  const variantContext: Record<
    ConceptReportStatus,
    { style: string; label: string | ReactNode }
  > = {
    complete: {
      style: `btn btn-light btn-bold`,
      label: 'Open',
    },

    pending: {
      style: `btn btn-light btn-bold`,
      label: (
        <span className='flex flex-row gap-2'>
          Loading
          <Loading isSmall />
        </span>
      ),
    },
    notStarted: {
      style: `btn btn-primary btn-bold`,
      label: 'Generate',
    },

    error: {
      style: `btn btn-light btn-bold`,
      label: (
        <>
          <Icon variant='refresh' height={20} width={20} /> Retry
        </>
      ),
    },
    draft: {
      style: `btn btn-light btn-bold`,
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
}) => {
  const canOpenWhilePending = canOpenConceptWhilePending(
    reportStatusBySection,
    dateReportCompleted,
  );

  // If in pending state, use the ConceptGeneratingButton component
  if (variant === 'pending' && !canOpenWhilePending) {
    return (
      <ConceptGeneratingButton
        reportStatusBySection={reportStatusBySection}
        dateReportStarted={dateReportStarted}
        dateReportCompleted={dateReportCompleted}
      />
    );
  }

  const effectiveVariant =
    variant === 'pending' && canOpenWhilePending ? 'complete' : variant;

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
          />
        }
        hideDelay={0}
      >
        <button className={style} onClick={onClick} disabled={disabled}>
          {resolvedLabel}
        </button>
      </ComponentTooltip>
    );
  }

  // Otherwise return the regular button
  return (
    <button className={style} onClick={onClick} disabled={disabled}>
      {resolvedLabel}
    </button>
  );
};

export default ConceptGenerateButton;
