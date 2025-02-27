import { Button } from '@components';
import { FunctionComponent } from 'react';
import Icon from '../../Icon/Icon/Icon';
import NestedLink, { NestedLinkProps } from '../NestedLink/NestedLink';
import styles from './drawer.module.scss';
import { cn } from '@libs/utils/react';

const defaultIconProps = {
  stroke: '#7586A9',
  width: 24,
  height: 24,
};

interface NavLinkButtonProps {
  title: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement> | undefined;
  icon: IconVariant;
  locked?: boolean;
  isOpen?: boolean;
  nestedRoutes?: NestedLinkProps[];
  collapsed?: boolean;
}

const NavLink: FunctionComponent<NavLinkButtonProps> = ({
  title,
  onClick,
  icon,
  isOpen,
  locked = false,
  nestedRoutes,
  collapsed = false,
}) => {
  return (
    <div className={`${styles.navLinkWrapper} ${locked ? styles.locked : ''}`}>
      <a
        onClick={onClick}
        className={`${styles.navLink} ${isOpen ? styles.active : ''}`}
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
      </a>

      {nestedRoutes ? (
        <Button.Collapsible width={'100%'} toggle={!!isOpen}>
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
