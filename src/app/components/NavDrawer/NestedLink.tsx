import { FunctionComponent } from 'react';
import { Link, useMatch, To } from 'react-router-dom';
import styles from '../../assets/styles/components/nested-link.module.scss';
import Icon from '../Icon';

const defaultIconProps = {
  stroke: '#7586A9',
  width: 24,
  height: 24,
};
export interface NestedLinkProps {
  to: To;
  onClick?: () => void;
  title: string;
  locked?: boolean;
}

const NestedLink: FunctionComponent<NestedLinkProps> = ({ to, title, onClick, locked = false }) => {
  const path = typeof to === 'string' ? to : to.pathname || '';
  const match = useMatch(path);

  return (
    <Link
      to={!locked ? to : '#!'}
      onClick={onClick}
      className={`${styles.nestedLink} ${match ? styles.active : ''} ${locked ? styles.locked : ''}`}
      aria-disabled={locked}
    >
      <span>{title}</span>
      {locked ? <Icon variant="lock" {...defaultIconProps} /> : null}
    </Link>
  );
};

export default NestedLink;
