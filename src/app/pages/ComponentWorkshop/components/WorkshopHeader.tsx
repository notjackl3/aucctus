/**
 * WorkshopHeader Component
 *
 * Header component for the ComponentWorkshop page.
 * Includes branding, service health indicator, and navigation tabs.
 */

import React from 'react';
import { Icon } from '@components';
import { cn } from '@libs/utils/react';

type ViewMode = 'generate' | 'preview' | 'library';

interface IWorkshopHeaderProps {
  /** Current active view mode */
  viewMode: ViewMode;
  /** Callback when view mode changes */
  onViewModeChange: (mode: ViewMode) => void;
  /** Whether the service is healthy */
  isHealthy: boolean;
  /** Whether the service health is being checked */
  isChecking: boolean;
}

const VIEW_MODES: ViewMode[] = ['generate', 'preview', 'library'];

/**
 * ServiceHealthBadge - Shows the current service status
 */
const ServiceHealthBadge: React.FC<{
  isHealthy: boolean;
  isChecking: boolean;
}> = ({ isHealthy, isChecking }) => {
  const getStatusText = () => {
    if (isChecking) return 'Checking...';
    return isHealthy ? 'Service Online' : 'Service Offline';
  };

  return (
    <div
      className={cn('flex items-center gap-2 rounded-full px-3 py-1.5', {
        'aucctus-bg-success-subtle': isHealthy,
        'aucctus-bg-error-subtle': !isHealthy && !isChecking,
        'aucctus-bg-secondary': isChecking,
      })}
      role='status'
      aria-live='polite'
    >
      <div
        className={cn('h-2 w-2 rounded-full', {
          'aucctus-bg-success-solid animate-pulse': isHealthy,
          'aucctus-bg-error-solid': !isHealthy && !isChecking,
          'aucctus-bg-tertiary': isChecking,
        })}
      />
      <span
        className={cn('aucctus-text-xs-medium', {
          'aucctus-text-success-primary': isHealthy,
          'aucctus-text-error-primary': !isHealthy && !isChecking,
          'aucctus-text-tertiary': isChecking,
        })}
      >
        {getStatusText()}
      </span>
    </div>
  );
};

/**
 * NavigationTabs - Tab navigation for different views
 */
const NavigationTabs: React.FC<{
  activeMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}> = ({ activeMode, onModeChange }) => {
  return (
    <nav className='flex gap-1' role='tablist' aria-label='Workshop views'>
      {VIEW_MODES.map((mode) => (
        <button
          key={mode}
          onClick={() => onModeChange(mode)}
          role='tab'
          aria-selected={activeMode === mode}
          aria-controls={`${mode}-panel`}
          className={cn(
            'aucctus-text-sm-medium relative px-4 py-3 transition-colors',
            {
              'aucctus-text-brand-primary': activeMode === mode,
              'aucctus-text-tertiary hover:aucctus-text-secondary':
                activeMode !== mode,
            },
          )}
        >
          {mode.charAt(0).toUpperCase() + mode.slice(1)}
          {activeMode === mode && (
            <div className='aucctus-bg-brand-solid absolute inset-x-0 bottom-0 h-0.5 rounded-full' />
          )}
        </button>
      ))}
    </nav>
  );
};

/**
 * WorkshopHeader - Main header component
 */
const WorkshopHeader: React.FC<IWorkshopHeaderProps> = ({
  viewMode,
  onViewModeChange,
  isHealthy,
  isChecking,
}) => {
  return (
    <header className='aucctus-bg-primary aucctus-border-secondary sticky top-0 z-10 border-b'>
      <div className='mx-auto flex max-w-7xl items-center justify-between px-6 py-4'>
        {/* Branding */}
        <div className='flex items-center gap-3'>
          <div className='aucctus-bg-brand-solid flex h-10 w-10 items-center justify-center rounded-lg'>
            <Icon variant='sparkles' className='aucctus-stroke-white h-5 w-5' />
          </div>
          <div>
            <h1 className='aucctus-text-xl-semibold aucctus-text-primary'>
              Component Workshop
            </h1>
            <p className='aucctus-text-sm aucctus-text-tertiary'>
              AI-powered component generation
            </p>
          </div>
        </div>

        {/* Service Health */}
        <div className='flex items-center gap-4'>
          <ServiceHealthBadge isHealthy={isHealthy} isChecking={isChecking} />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className='mx-auto max-w-7xl px-6'>
        <NavigationTabs activeMode={viewMode} onModeChange={onViewModeChange} />
      </div>
    </header>
  );
};

export default WorkshopHeader;
