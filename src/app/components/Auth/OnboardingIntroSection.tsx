import { FunctionComponent } from 'react';
import styles from '../../assets/styles/pages/auth-screens.module.scss';
import OnboardingMessage from './OnboardingMessage';

const OnboardingIntoSection: FunctionComponent = () => {
  return (
    <div className={`${styles.intoSection}  ${styles.onboarding}`}>
      <h1>Get ready to unleash the Power of AI-Driven Innovation:</h1>
      <OnboardingMessage
        title={'Instant Industry Intel'}
        description={'Dive in and dominate with on-the-spot market insights'}
        icon={'target'}
        color={'purple'}
      />
      <OnboardingMessage
        title={'Idea Factory'}
        description={'Let innovation flow! We generate and rank your next big moves'}
        icon="lightbulb"
        color={'purple'}
      />
      <OnboardingMessage
        title={'Persona Magic'}
        description={'Tailor-made strategies that resonate with your ideal audience'}
        icon="user-group"
        color={'purple'}
      />
      <OnboardingMessage
        title={'Seamless Strategy Roadmaps'}
        description={'From spark to success, we guide every step'}
        icon="rocket"
        color={'purple'}
      />
      <OnboardingMessage
        title={'Make Moves with Confidence'}
        description={
          'Backed by the freshest, most precise data-driven insights. Join the future of business expansion today!'
        }
        icon="search-refraction"
        color={'purple'}
      />
    </div>
  );
};

export default OnboardingIntoSection;
