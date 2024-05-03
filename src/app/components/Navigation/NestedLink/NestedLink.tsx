import { FunctionComponent } from 'react';
import { Link, useMatch, To } from 'react-router-dom';
import styles from './nested-link.module.scss';
import Icon from '../../Icons/Icon/Icon';

const defaultIconProps = {
  stroke: '#7586A9',
  width: 24,
  height: 24,
};
export interface NestedLinkProps {
  to: To;
  onClick?: () => void;
  icon?: IconVariant;
  title: string;
  locked?: boolean;
}

const NestedLink: FunctionComponent<NestedLinkProps> = ({ to, title, icon, onClick, locked = false }) => {
  const searchParams = typeof to === 'string' ? '' : `${to.search}`;
  const path = typeof to === 'string' ? to : `${to.pathname}${searchParams}`;
  const match = useMatch(path);

  const isActive = `${match?.pathname}${searchParams}` === path;

  return (
    <Link
      to={!locked ? to : '#!'}
      onClick={onClick}
      className={`${styles.nestedLink} ${isActive ? styles.active : ''} ${locked ? styles.locked : ''}`}
      aria-disabled={locked}
    >
      {icon ? <Icon variant='chevronright' {...defaultIconProps} /> : null}
      <span>{title}</span>
      {locked ? <Icon variant='lock' {...defaultIconProps} /> : null}
    </Link>
  );
};

export default NestedLink;
