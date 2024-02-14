import { FunctionComponent } from 'react';
import { Link, useMatch } from 'react-router-dom';
import styles from '../../assets/styles/components/nested-link.module.scss';
import Icon from '../Icon';

const defaultIconProps = {
  stroke: '#7586A9',
  width: 24,
  height: 24,
};
export interface NestedLinkProps {
  to: string;
  title: string;
  locked?: boolean;
}

const NestedLink: FunctionComponent<NestedLinkProps> = ({ to, title, locked = false }) => {
  const match = useMatch(to);

  return (
    <Link
      to={!locked ? to : '#!'}
      className={`${styles.nestedLink} ${match ? styles.active : ''} ${locked ? styles.locked : ''}`}
      aria-disabled={locked}
    >
      <span>{title}</span>
      {locked ? <Icon variant="lock" {...defaultIconProps} /> : null}
    </Link>
  );
};

export default NestedLink;
