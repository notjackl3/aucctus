import { FunctionComponent, useMemo } from 'react';
import { Link, To, useLocation, useMatch } from 'react-router-dom';
import styles from './drawer.module.scss';

import { Button } from '@components';
import Icon from '../../Icon/Icon/Icon';
import NestedLink, { NestedLinkProps } from '../NestedLink/NestedLink';

const defaultIconProps = {
  stroke: '#7586A9',
  width: 24,
  height: 24,
};

interface NavLinkProps {
  title: string;
  to: To;
  icon: IconVariant;
  locked?: boolean;
  openBasePath?: string;
  nestedRoutes?: NestedLinkProps[];
}

const NavLink: FunctionComponent<NavLinkProps> = ({
  title,
  icon,
  to,
  locked = false,
  openBasePath,
  nestedRoutes,
}) => {
  const location = useLocation();
  const toPath = useMemo(
    () => (typeof to === 'string' ? to : to.pathname || ''),
    [to],
  );

  const match = useMatch(toPath);
  const isOpen = useMemo(() => {
    if (!openBasePath || !nestedRoutes) return false;
    return location.pathname.substring(0, openBasePath.length) === openBasePath;
  }, [location, openBasePath, nestedRoutes]);

  const isActive = match?.pathname === location.pathname || isOpen;

  return (
    <div className={`${styles.navLinkWrapper} ${locked ? styles.locked : ''}`}>
      <Link
        to={!locked ? to : '#!'}
        className={`${styles.navLink} ${isActive ? styles.active : ''}`}
      >
        <div className={styles.label}>
          <Icon variant={icon} {...defaultIconProps} />
          <span>{title}</span>
        </div>

        {locked ? <Icon variant='lock' {...defaultIconProps} /> : null}
        {isOpen ? <Icon variant='chevronup' {...defaultIconProps} /> : null}
      </Link>

      {nestedRoutes ? (
        <Button.Collapsible width={'100%'} toggle={isOpen}>
          {nestedRoutes &&
            nestedRoutes.map((route, i) => (
              <NestedLink key={`di-${route.title}-${i}`} {...route} />
            ))}
        </Button.Collapsible>
      ) : null}
    </div>
  );
};

export default NavLink;
