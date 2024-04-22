import { FunctionComponent } from 'react';
import styles from '../assets/styles/components/ignite-box.module.scss';
import { AppPath } from '../../routes/routes';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon/Icon';

const defaultIconProps = {
  height: 24,
  width: 24,
  stroke: '#2B3674',
};

interface IgniteBoxProps {
  title: string;
  subtitle: string;
  link: AppPath;
  icon: IconVariant;
}

const IgniteBox: FunctionComponent<IgniteBoxProps> = ({ title, subtitle, link, icon }) => {
  const navigate = useNavigate();

  return (
    <div className={styles.igniteBox}>
      <div className={styles.content}>
        <Icon variant={icon} {...defaultIconProps} />
        <span className={styles.title}>{title}</span>
        {subtitle}
      </div>

      <button className={`btn btn-primary`} onClick={() => navigate(link)}>
        Ignite
        <Icon variant="arrowright" width={24} height={24} stroke="#fff" />
      </button>
    </div>
  );
};

export default IgniteBox;
