import { ConceptReportStatus } from '@libs/api/types';
import { FunctionComponent, ReactNode } from 'react';

import { Icon, Loading } from '@components';

type ConceptRowButtonProps = {
  variant: ConceptReportStatus;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
};

const ConceptGenerateButton: FunctionComponent<ConceptRowButtonProps> = ({
  variant,
  onClick,
  disabled,
}) => {
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
        style: ` btn btn-light btn-bold`,
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

  const { style, label } = getButtonContext(variant);

  return (
    <button className={style} onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
};

export default ConceptGenerateButton;
