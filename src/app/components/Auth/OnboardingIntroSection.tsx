import { FunctionComponent } from 'react';
import styles from '../../assets/styles/pages/auth-screens.module.scss';
import OnboardingMessage from './OnboardingMessage';

const OnboardingIntoSection: FunctionComponent = () => {
  return (
    <div className={styles.authContainer}>
      <div className={`${styles.intoSection}  ${styles.onboarding}`}>
        <h1>Get ready to unleash the Power of AI-Driven Innovation:</h1>
        <OnboardingMessage
          title={'Identify Innovative Ideas'}
          description={
            'Our AI agents will find unique, innovative opportunities for your company to pursue – instantly'
          }
          icon={'target'}
          color={'primary'}
        />
        <OnboardingMessage
          title={'Instantly Validate Idea Potential'}
          description={
            'In minutes, our agents conduct weeks worth of research and investigation on market trends, startups, customer personas and financial modelling'
          }
          icon='lightbulb'
          color={'primary'}
        />
        <OnboardingMessage
          title={'Democratize Innovation Best Practice'}
          description={
            'Our standardized innovation process guides employees from any business unit through a stage-gated, risk mitigated process'
          }
          icon='user-group'
          color={'primary'}
        />
        <OnboardingMessage
          title={'Tracking, ROI and Accountability'}
          description={
            'Visualize all activity company-wide to track idea stage, impact size, and return on investment of your innovation practice'
          }
          icon='rocket'
          color={'primary'}
        />
      </div>
    </div>
  );
};

export default OnboardingIntoSection;
