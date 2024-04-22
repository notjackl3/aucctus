import { FunctionComponent } from 'react';

import styles from '../assets/styles/components/onboarding-message.module.scss';
import FeatureIcon, { IFeatureIconProps } from './FeatureIcon';

interface OnboardingMessageProps extends IFeatureIconProps {
  title: string;
  description: string;
}

const OnboardingMessage: FunctionComponent<OnboardingMessageProps> = ({ title, description, icon, color }) => {
  return (
    <div className={styles.onboardingMessage}>
      <FeatureIcon icon={icon} color={color} />

      <div className={styles.message}>
        <span className={styles.title}>{title}</span>
        <span className={styles.description}>{description}</span>
      </div>
    </div>
  );
};

export default OnboardingMessage;
