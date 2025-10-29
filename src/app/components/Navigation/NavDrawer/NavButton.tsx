import { Button } from '@components';
import { FunctionComponent, useMemo } from 'react';
import { To, useLocation, useMatch, useNavigate } from 'react-router-dom';
import Icon from '../../Icon/Icon/Icon';
import NestedLink, { NestedLinkProps } from '../NestedLink/NestedLink';
import { cn } from '@libs/utils/react';

const defaultIconProps = {
  width: 24,
  height: 24,
};

interface NavButtonProps {
  title: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement> | undefined;
  to?: To;
  icon: IconVariant;
  locked?: boolean;
  openBasePath?: string;
  nestedRoutes?: NestedLinkProps[];
  collapsed?: boolean;
}

const NavButton: FunctionComponent<NavButtonProps> = ({
  title,
  onClick,
  to,
  icon,
  locked = false,
  openBasePath,
  nestedRoutes,
  collapsed = false,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const toPath = useMemo(() => {
    if (!to) return '';
    if (typeof to === 'string') return to;
    return (to as { pathname?: string }).pathname || '';
  }, [to]);

  const match = useMatch(toPath || '');
  const isOpen = useMemo(() => {
    if (!openBasePath || !nestedRoutes) return false;
    return location.pathname.substring(0, openBasePath.length) === openBasePath;
  }, [location, openBasePath, nestedRoutes]);

  const isActive = match?.pathname === location.pathname || isOpen;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (locked) {
      e.preventDefault();
      return;
    }

    // If there's a custom onClick, use it
    if (onClick) {
      onClick(e);
      return;
    }

    // Otherwise, navigate to the route
    if (to && toPath && location.pathname !== toPath) {
      e.preventDefault();
      navigate(to);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={cn(
          'mx-3 flex h-10 gap-3 rounded-md py-2 pl-2 transition-all duration-300',
          {
            'aucctus-bg-secondary': isActive,
            'aucctus-bg-primary-hover': !isActive,
            'pointer-events-none cursor-not-allowed': locked,
          },
        )}
      >
        <span>
          <Icon
            variant={icon}
            className='fill-none stroke-gray-light-700'
            {...defaultIconProps}
          />
        </span>
        <span
          className={cn(
            'overflow-hidden text-left text-base font-bold transition-all duration-300',
            {
              'aucctus-text-tertiary': !isActive,
              'aucctus-text-primary': isActive,
              'w-0': collapsed,
              'ml-4 w-[100px]': !collapsed,
            },
          )}
        >
          {title}
        </span>
        {locked && (
          <Icon
            variant='lock'
            className='ml-1 fill-none stroke-gray-light-700'
            {...defaultIconProps}
          />
        )}
        {isOpen && (
          <Icon
            variant='chevronup'
            className='ml-1 fill-none stroke-gray-light-700'
            {...defaultIconProps}
          />
        )}
      </button>

      {nestedRoutes && (
        <Button.Collapsible width={'100%'} toggle={!!isOpen}>
          {nestedRoutes.map((route, i) => (
            <NestedLink key={`di-${route.title}-${i}`} {...route} />
          ))}
        </Button.Collapsible>
      )}
    </>
  );
};

export default NavButton;
