import { Icon } from '@components';
import { IconVariant } from '@components/Icon/Icon/icons';
import { cn } from '@libs/utils/react';
import * as Popover from '@radix-ui/react-popover';
import React, { useState, useMemo } from 'react';

// All available icon variants
const ALL_ICONS: IconVariant[] = [
  'activity',
  'ai-conclusion',
  'alert',
  'alert-circle',
  'alert-exclamation',
  'alert-octagon',
  'alert-triangle',
  'align-right-01',
  'annotation-dots',
  'announcement',
  'arrowdown',
  'arrowleft',
  'arrowright',
  'arrowup',
  'arrowupright',
  'bank',
  'barchart',
  'beaker',
  'board',
  'book-open',
  'briefcase',
  'building',
  'building-02',
  'building-03',
  'calendar',
  'check',
  'check-circle-broken',
  'chevron-right',
  'chevrondown',
  'chevronleft',
  'chevronright',
  'chevronup',
  'clipboard',
  'clock',
  'clock-fast-forward',
  'clock-rewind',
  'clock-stopwatch',
  'closeX',
  'columns',
  'compass-03',
  'cube',
  'currency-dollar',
  'currencydollar',
  'dataflow-04',
  'decreasing',
  'dots-vertical',
  'download',
  'download-cloud',
  'economic',
  'edit',
  'environmental',
  'expand-06',
  'eye',
  'eye-off',
  'file',
  'file-2',
  'file-attachment',
  'filecode',
  'filter-lines',
  'future',
  'gear',
  'globe',
  'handshake',
  'heart',
  'help',
  'help-circle',
  'home',
  'inbox-02',
  'increasing',
  'key',
  'legal',
  'lifebuoy',
  'lightbulb',
  'line-chart-up',
  'line-chart-up-02',
  'link',
  'link-01',
  'link-03',
  'link-external',
  'link-source',
  'list',
  'loading-02',
  'lock',
  'logout',
  'mail',
  'map',
  'map-01',
  'map-02',
  'map-pin',
  'market-resonance',
  'message-circle',
  'minus',
  'paper-airplane',
  'pie-chart',
  'piggy-bank',
  'play-square',
  'plus',
  'political',
  'presentation-chart',
  'product-blueprint',
  'refresh',
  'repeat-02',
  'rocket',
  'route',
  'save',
  'search-md',
  'search-refraction',
  'shield-dollar',
  'signal-02',
  'social',
  'sparkles',
  'stagnating',
  'star-01',
  'survey',
  'switch-vertical-01',
  'swords',
  'target',
  'technological',
  'telescope',
  'test-drive',
  'thermometer',
  'threeStars',
  'trash',
  'trending-down',
  'trending-up',
  'trendup',
  'umbrella',
  'upload',
  'user-group',
  'user-square',
  'users-02',
  'users-03',
  'users-edit',
  'warning',
  'waves',
  'wizard-of-oz',
  'zap',
];

interface IIconPickerDropdownProps {
  currentIcon?: string;
  onSelect: (icon: string) => void;
  trigger?: React.ReactNode;
}

/**
 * Icon picker dropdown component
 * Displays a searchable grid of icons in a popover
 */
const IconPickerDropdown: React.FC<IIconPickerDropdownProps> = ({
  currentIcon,
  onSelect,
  trigger,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter icons based on search query
  const filteredIcons = useMemo(() => {
    if (!searchQuery.trim()) return ALL_ICONS;

    const query = searchQuery.toLowerCase();
    return ALL_ICONS.filter((icon) => icon.toLowerCase().includes(query));
  }, [searchQuery]);

  const handleSelect = (icon: string) => {
    onSelect(icon);
    setIsOpen(false);
    setSearchQuery(''); // Reset search on close
  };

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <Popover.Trigger asChild>
        {trigger || (
          <button className='aucctus-bg-secondary-hover hover:aucctus-bg-tertiary flex items-center justify-center rounded p-0.5 transition-colors'>
            <Icon
              variant={(currentIcon as IconVariant) || 'file'}
              className='aucctus-stroke-tertiary h-4 w-4'
            />
          </button>
        )}
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className='aucctus-bg-primary aucctus-border-secondary z-[10000] w-[400px] rounded-lg border shadow-lg'
          align='start'
          sideOffset={5}
          data-aucctus-portal-target='true'
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          onPointerDownOutside={(e) => {
            // Prevent closing the parent modal when clicking outside
            e.preventDefault();
            setIsOpen(false);
          }}
        >
          <div className='flex flex-col'>
            {/* Header with search and clear button */}
            <div className='aucctus-border-secondary flex items-center gap-2 border-b p-3'>
              <div className='relative flex-1'>
                <Icon
                  variant='search-md'
                  className='aucctus-stroke-tertiary absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2'
                />
                <input
                  type='text'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder='Filter...'
                  className='aucctus-bg-primary aucctus-border-secondary aucctus-text-primary focus:aucctus-border-brand w-full rounded border py-2 pl-10 pr-3 text-sm focus:outline-none'
                  autoFocus
                />
              </div>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setIsOpen(false);
                }}
                className='aucctus-bg-secondary-hover rounded p-2 transition-colors'
              >
                <Icon
                  variant='closeX'
                  className='aucctus-stroke-secondary h-4 w-4'
                />
              </button>
            </div>

            {/* Recent section (if there's a current icon) */}
            {currentIcon && !searchQuery && (
              <div className='aucctus-border-secondary border-b p-3'>
                <div className='aucctus-text-xs aucctus-text-tertiary mb-2 font-medium'>
                  Recent
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelect(currentIcon);
                  }}
                  className={cn(
                    'aucctus-bg-secondary-hover flex h-10 w-10 items-center justify-center rounded transition-colors',
                    currentIcon === currentIcon && 'aucctus-bg-secondary',
                  )}
                >
                  <Icon
                    variant={currentIcon as IconVariant}
                    className='aucctus-stroke-secondary h-5 w-5'
                  />
                </button>
              </div>
            )}

            {/* Icons grid */}
            <div className='p-3'>
              <div className='aucctus-text-xs aucctus-text-tertiary mb-2 font-medium'>
                Icons
              </div>
              <div className='no-scrollbar grid max-h-[300px] grid-cols-8 gap-1 overflow-y-auto'>
                {filteredIcons.map((icon) => (
                  <button
                    key={icon}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSelect(icon);
                    }}
                    className={cn(
                      'aucctus-bg-secondary-hover flex h-10 w-10 items-center justify-center rounded transition-colors',
                      currentIcon === icon && 'aucctus-bg-secondary',
                    )}
                    title={icon}
                  >
                    <Icon
                      variant={icon}
                      className='aucctus-stroke-secondary h-5 w-5'
                    />
                  </button>
                ))}
              </div>

              {/* Empty state */}
              {filteredIcons.length === 0 && (
                <div className='aucctus-text-tertiary flex h-32 items-center justify-center text-sm'>
                  No icons found
                </div>
              )}
            </div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default IconPickerDropdown;
