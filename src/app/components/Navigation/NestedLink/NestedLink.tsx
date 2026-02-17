import { FunctionComponent } from 'react';
import { Link, To, useMatch } from 'react-router-dom';
import styles from './nested-link.module.scss';
import { ChevronRight, Lock } from 'lucide-react';

const defaultIconProps = {
  stroke: '#7586A9',
  width: 24,
  height: 24,
};
export interface NestedLinkProps {
  to: To;
  onClick?: () => void;
  icon?: string;
  title: string;
  locked?: boolean;
}

const NestedLink: FunctionComponent<NestedLinkProps> = ({
  to,
  title,
  icon,
  onClick,
  locked = false,
}) => {
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
      {icon ? <ChevronRight {...defaultIconProps} /> : null}
      <span>{title}</span>
      {locked ? <Lock {...defaultIconProps} /> : null}
    </Link>
  );
};

export default NestedLink;
