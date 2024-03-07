import { FunctionComponent, useMemo } from 'react';
import styles from '../../assets/styles/components/drawer.module.scss';
import { AppPath } from '../../../routes/routes';
import { Link, useLocation } from 'react-router-dom';
import Collapsible from '../Collapsible';
import NestedLink, { NestedLinkProps } from './NestedLink';
import Icon, { IconVariant } from '../Icon';

const defaultIconProps = {
  stroke: '#7586A9',
  width: 24,
  height: 24,
};

interface NavLinkProps {
  title: string;
  to: AppPath;
  icon: keyof typeof IconVariant;
  locked?: boolean;
  openBasePath?: string;
  nestedRoutes?: NestedLinkProps[];
}

const NavLink: FunctionComponent<NavLinkProps> = ({ title, icon, to, locked = false, openBasePath, nestedRoutes }) => {
  const location = useLocation();
  const isOpen = useMemo(() => {
    if (!openBasePath) return false;
    return location.pathname.substring(0, openBasePath.length) === openBasePath;
  }, [location, openBasePath]);
  const isParentPathMatch = location?.pathname?.includes(to) && to !== AppPath.Home;

  return (
    <div className={`${styles.navLinkWrapper} ${locked ? styles.locked : ''}`}>
      <Link to={!locked ? to : '#!'} className={`${styles.navLink} ${isParentPathMatch ? styles.active : ''}`}>
        <div className={styles.label}>
          <Icon variant={icon} {...defaultIconProps} />
          <span>{title}</span>
        </div>

        {locked ? <Icon variant="lock" {...defaultIconProps} /> : null}
        {isOpen ? <Icon variant="chevronUp" {...defaultIconProps} /> : null}
      </Link>

      {nestedRoutes ? (
        <Collapsible width={'100%'} toggle={isOpen}>
          {nestedRoutes && nestedRoutes.map((route, i) => <NestedLink key={`di-${route.title}-${i}`} {...route} />)}
        </Collapsible>
      ) : null}
    </div>
  );
};

export default NavLink;
