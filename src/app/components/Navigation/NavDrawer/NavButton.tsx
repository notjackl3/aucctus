import { FunctionComponent } from 'react';
import styles from './drawer.module.scss';
import NestedLink, { NestedLinkProps } from '../NestedLink/NestedLink';
import Icon from '../../Icons/Icon/Icon';
import { Button } from '@components';

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
}

const NavLink: FunctionComponent<NavLinkButtonProps> = ({
  title,
  onClick,
  icon,
  isOpen,
  locked = false,
  nestedRoutes,
}) => {
  return (
    <div className={`${styles.navLinkWrapper} ${locked ? styles.locked : ''}`}>
      <a onClick={onClick} className={`${styles.navLink} ${isOpen ? styles.active : ''}`}>
        <div className={styles.label}>
          <Icon variant={icon} {...defaultIconProps} />
          <span>{title}</span>
        </div>

        {locked ? <Icon variant='lock' {...defaultIconProps} /> : null}
      </a>

      {nestedRoutes ? (
        <Button.Collapsible width={'100%'} toggle={!!isOpen}>
          {nestedRoutes && nestedRoutes.map((route, i) => <NestedLink key={`di-${route.title}-${i}`} {...route} />)}
        </Button.Collapsible>
      ) : null}
    </div>
  );
};

export default NavLink;
