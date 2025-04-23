import {
  ConceptReportStatus,
  ConceptReportStatusBySection,
} from '@libs/api/types';
import { FunctionComponent, ReactNode } from 'react';
import { Icon, Loading, ComponentTooltip } from '@components';
import ConceptGeneratingButton from './ConceptGeneratingButton';
import { ConceptStatusTooltip } from '../ToolTip/ConceptStatusTooltip';

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
  // If in pending state, use the ConceptGeneratingButton component
  if (variant === 'pending') {
    return (
      <ConceptGeneratingButton
        onClick={onClick}
        disabled={disabled}
        reportStatusBySection={reportStatusBySection}
      />
    );
  }

  // Get button style and label
  const { style, label } = getButtonContext(variant);

  // For complete or error state, wrap with tooltip
  if (
    (variant === 'complete' || variant === 'error') &&
    reportStatusBySection
  ) {
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
          {label}
        </button>
      </ComponentTooltip>
    );
  }

  // Otherwise return the regular button
  return (
    <button className={style} onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
};

export default ConceptGenerateButton;
