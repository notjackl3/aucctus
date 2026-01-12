import NavLogo from '@assets/aucctus_logo.png';
import NavWord from '@assets/aucctus_nav_word.png';
import { Avatar } from '@components';
import { useClerk } from '@clerk/clerk-react';
import { cn } from '@libs/utils/react';
import { AppPath } from '@routes/routes';
import useStore, { resetAllStoreData } from '@stores/store';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import NavButton from './NavButton';

interface NavDrawerProps {
  onExpandCollapse: (isCollapsed: boolean) => void;
}

const NavDrawer = ({ onExpandCollapse }: NavDrawerProps) => {
  const { user, account } = useStore((state) => state.auth);
  const { lastActiveSeedUuid } = useStore((state) => state.ideaPlayground);
  const { signOut } = useClerk();
  const [collapsed, setCollapsed] = useState(true);

  const navigate = useNavigate();

  // Build playground path with cached seed if available
  const playgroundPath = useMemo(() => {
    if (lastActiveSeedUuid) {
      return `${AppPath.IdeaPlayground}?seed=${lastActiveSeedUuid}`;
    }
    return AppPath.IdeaPlayground;
  }, [lastActiveSeedUuid]);

  const handleMouseEnter = () => {
    onExpandCollapse(false);
    setCollapsed(false);
  };

  const handleMouseLeave = () => {
    onExpandCollapse(true);
    setCollapsed(true);
  };
  return (
    <div
      className={cn(
        'aucctus-bg-primary aucctus-border-primary fixed z-[1] flex h-screen flex-col gap-4 border-r pt-9 transition-all duration-300',
        {
          'w-[var(--nav-drawer-collapsed-width)]': collapsed,
          'w-[var(--nav-drawer-expanded-width)]': !collapsed,
        },
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={cn(
          'ml-6 flex cursor-pointer gap-2 pb-4 transition-all duration-300',
          {
            'pointer-events-none': collapsed,
          },
        )}
        onClick={() => {
          navigate(AppPath.Home);
        }}
      >
        <img alt='Aucctus' className='h-12 w-12' src={NavLogo} />
        <img
          alt='Aucctus'
          style={{
            clipPath: collapsed ? 'inset(0 100% 0 0)' : 'inset(0 0 0 0)',
          }}
          className='mt-1 h-10 w-[145px] min-w-[145px] overflow-hidden transition-all duration-300'
          src={NavWord}
        />
      </div>
      <div className='mt-2 flex flex-1 flex-col gap-6 px-4'>
        <NavButton
          to={AppPath.Home}
          title='Dashboard'
          icon='home'
          collapsed={collapsed}
        />

        <NavButton
          to={
            account?.hasConcepts || account?.hasSeeds
              ? AppPath.ConceptBank
              : AppPath.IncubateConcept
          }
          title='Concepts'
          icon='lightbulb'
          collapsed={collapsed}
        />
        <NavButton
          to={AppPath.InnovationPipeline}
          title='Pipeline'
          icon='dataflow-04'
          collapsed={collapsed}
        />
        <NavButton
          to={AppPath.PortfolioPrioritization}
          title='Portfolio'
          icon='barchart'
          collapsed={collapsed}
        />
        <NavButton
          to={AppPath.Nucleus}
          title='Nucleus'
          icon='compass-03'
          collapsed={collapsed}
        />
        <NavButton
          to={AppPath.SignalScanning}
          title='Signal Scanning'
          icon='signal-02'
          collapsed={collapsed}
        />
        {/* Uncomment this when we have the playground ready */}
        <NavButton
          to={playgroundPath}
          title='Playground'
          icon='route'
          collapsed={collapsed}
        />
        <NavButton
          to={AppPath.IdeaSubmissionsAdmin}
          title='Submissions'
          icon='inbox-02'
          collapsed={collapsed}
        />
      </div>
      <div className='flex flex-col gap-6 px-4'>
        <NavButton
          to={AppPath.SettingsAbout}
          title='Settings'
          icon='file'
          collapsed={collapsed}
        />
        <NavButton
          title='Logout'
          icon='logout'
          onClick={async (e) => {
            e.preventDefault();
            await signOut();
            resetAllStoreData();
          }}
          collapsed={collapsed}
        />
      </div>
      <div className='aucctus-border-primary flex gap-3 border-t py-6 pl-4'>
        <Avatar
          firstName={user?.firstName || ''}
          lastName={user?.lastName || ''}
          src={user?.profileImage}
          hideImage={!!user?.profileImage}
          className={cn('flex-shrink-0', {
            'ml-3': collapsed,
          })}
        />
        <div
          className={cn(
            'flex flex-col overflow-hidden transition-all duration-300',
            {
              'w-0 opacity-0': collapsed,
              'w-40 opacity-100': !collapsed,
            },
          )}
        >
          <span className='aucctus-text-md-medium aucctus-text-brand-secondary truncate'>
            {user?.firstName || ''}
          </span>
          <span className='aucctus-text-xs aucctus-text-tertiary truncate'>
            {user?.email || ''}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NavDrawer;
