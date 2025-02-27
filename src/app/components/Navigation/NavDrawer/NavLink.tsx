import { FunctionComponent, useMemo } from 'react';
import { Link, To, useLocation, useMatch } from 'react-router-dom';
import styles from './drawer.module.scss';

import { Button } from '@components';
import Icon from '../../Icon/Icon/Icon';
import NestedLink, { NestedLinkProps } from '../NestedLink/NestedLink';
import { cn } from '@libs/utils/react';

const defaultIconProps = {
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
  collapsed?: boolean;
}

const NavLink: FunctionComponent<NavLinkProps> = ({
  title,
  icon,
  to,
  locked = false,
  openBasePath,
  nestedRoutes,
  collapsed = false,
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
    <div
      className={cn(styles.navLinkWrapper, {
        [styles.locked]: locked,
      })}
    >
      <Link
        to={!locked ? to : '#!'}
        className={cn(styles.navLink, {
          [styles.active]: isActive,
        })}
      >
        <div className={styles.label}>
          <Icon variant={icon} {...defaultIconProps} />
          <span
            className={cn(
              'flex items-center justify-center overflow-hidden rounded-full border border-transparent transition-all duration-300',
              {
                'w-[0px]': collapsed,
                'w-[100px]': !collapsed,
              },
            )}
          >
            {title}
          </span>
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
