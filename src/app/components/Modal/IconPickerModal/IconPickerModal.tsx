import { cn } from '@libs/utils/react';
import React, { useState, useMemo } from 'react';
import { Check, Search, X } from 'lucide-react';
import { DynamicIcon } from '@libs/utils/iconMap';

// All available icon variants from icons.d.ts (filtered)
// Excludes: 'circle', 'linkedin'
const ALL_ICONS: string[] = [
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

interface IIconPickerModalProps {
  currentIcon?: string;
  onSelect: (icon: string) => void;
  onCancel: () => void;
}

const IconPickerModal: React.FC<IIconPickerModalProps> = ({
  currentIcon,
  onSelect,
  onCancel,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<string | undefined>(
    currentIcon,
  );

  // Filter icons based on search query
  const filteredIcons = useMemo(() => {
    if (!searchQuery.trim()) return ALL_ICONS;

    const query = searchQuery.toLowerCase();
    return ALL_ICONS.filter((icon) => icon.toLowerCase().includes(query));
  }, [searchQuery]);

  const handleSelect = (icon?: string) => {
    const iconToSelect = icon || selectedIcon;
    if (iconToSelect) {
      onSelect(iconToSelect);
    }
  };

  return (
    <div className='aucctus-bg-primary flex w-full max-w-md flex-col rounded-md shadow-xl'>
      {/* Header */}
      <div className='aucctus-border-secondary flex items-center justify-between border-b px-6 py-4'>
        <h2 className='aucctus-text-lg-semibold aucctus-text-primary'>
          Select Icon
        </h2>
        <button
          onClick={onCancel}
          className='aucctus-bg-secondary-hover rounded-full p-2 transition-colors'
        >
          <X className='aucctus-stroke-secondary h-5 w-5' />
        </button>
      </div>

      {/* Content */}
      <div className='px-6 py-4'>
        {/* Search */}
        <div className='mb-4'>
          <div className='relative'>
            <Search className='aucctus-stroke-tertiary absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2' />
            <input
              type='text'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Search icons...'
              className='aucctus-bg-secondary aucctus-border-secondary aucctus-text-primary focus:aucctus-border-brand w-full rounded-lg border py-2 pl-10 pr-4 text-sm focus:outline-none'
              autoFocus
            />
          </div>
          <p className='aucctus-text-xs aucctus-text-quaternary mt-2'>
            {filteredIcons.length} icon{filteredIcons.length !== 1 ? 's' : ''}{' '}
            available
          </p>
        </div>

        {/* Icon Dropdown List */}
        <div className='max-h-[400px] overflow-y-auto'>
          {filteredIcons.length > 0 ? (
            <div className='space-y-1'>
              {filteredIcons.map((icon) => (
                <button
                  key={icon}
                  onClick={() => {
                    setSelectedIcon(icon);
                    handleSelect(icon);
                  }}
                  className={cn(
                    'aucctus-bg-primary-hover flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all',
                    selectedIcon === icon
                      ? 'aucctus-bg-brand-primary aucctus-border-brand'
                      : '',
                  )}
                >
                  <div
                    className={cn(
                      'aucctus-bg-secondary aucctus-border-secondary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded border',
                      selectedIcon === icon && 'aucctus-bg-brand-secondary',
                    )}
                  >
                    <DynamicIcon
                      variant={icon as string}
                      className={cn(
                        'h-5 w-5',
                        selectedIcon === icon
                          ? 'aucctus-stroke-brand-primary'
                          : 'aucctus-stroke-tertiary',
                      )}
                    />
                  </div>
                  <span
                    className={cn(
                      'aucctus-text-sm flex-1',
                      selectedIcon === icon
                        ? 'aucctus-text-brand-primary font-medium'
                        : 'aucctus-text-secondary',
                    )}
                  >
                    {icon}
                  </span>
                  {selectedIcon === icon && (
                    <Check className='aucctus-stroke-brand-primary h-5 w-5' />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className='aucctus-text-quaternary flex flex-col items-center justify-center py-12'>
              <Search className='aucctus-stroke-quaternary mb-3 h-12 w-12' />
              <p className='aucctus-text-sm'>
                No icons found matching &quot;{searchQuery}&quot;
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className='aucctus-border-secondary flex items-center justify-end gap-3 border-t px-6 py-4'>
        <button onClick={onCancel} className='btn btn-secondary'>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default IconPickerModal;
