import { FunctionComponent } from 'react';
import styles from '../styles/concepts.module.scss';
import { ConceptReportStatus } from '../../../../libs/api/typings';

type ConceptRowButtonProps = {
  //TODO align with concept types
  variant: ConceptReportStatus;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

const ConceptRowButton: FunctionComponent<ConceptRowButtonProps> = ({ variant, onClick }) => {
  const getButtonLabel = (variant: ConceptRowButtonProps['variant']) => {
    switch (variant) {
      case 'complete':
        return 'OPEN';
      case 'pending':
        return 'LOADING';
      case 'notStarted':
        return 'LAUNCH';
    }
  };

  const getButtonStyle = (variant: ConceptRowButtonProps['variant']) => {
    switch (variant) {
      case 'complete':
        return styles.openButton;
      case 'pending':
        return `${styles.actionButton} btn btn-primary`;
      case 'notStarted':
        return `${styles.actionButton} btn btn-primary`;
      default:
        return '';
    }
  };

  const buttonStyle = getButtonStyle(variant);
  const buttonLabel = getButtonLabel(variant);

  return (
    <button className={buttonStyle} onClick={onClick}>
      {buttonLabel}
    </button>
  );
};

export default ConceptRowButton;
