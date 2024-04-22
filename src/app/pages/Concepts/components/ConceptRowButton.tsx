import { FunctionComponent, ReactNode } from 'react';
import styles from '../styles/concepts.module.scss';
import { ConceptReportStatus } from '../../../../libs/api/typings';
import Icon from '../../../components/Icon/Icon';
import Loading from '../../../components/Loading';

type ConceptRowButtonProps = {
  variant: ConceptReportStatus;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

const ConceptRowButton: FunctionComponent<ConceptRowButtonProps> = ({ variant, onClick }) => {
  const getButtonContext = (variant: ConceptRowButtonProps['variant']) => {
    const variantContext: Record<ConceptReportStatus, { style: string; label: string | ReactNode }> = {
      complete: {
        style: `btn btn-light btn-bold`,
        label: 'Open',
      },

      pending: {
        style: `btn btn-light btn-bold`,
        label: (
          <span className={styles.loadingButton}>
            Loading<span></span>
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
          <span>
            <Icon variant="refresh" /> Retry
          </span>
        ),
      },
    };

    return variantContext[variant];
  };

  const { style, label } = getButtonContext(variant);

  return (
    <button className={style} onClick={onClick}>
      {label}
    </button>
  );
};

export default ConceptRowButton;
