/**
 * PersonaSidebarItem - Compact avatar for persona sidebar
 *
 * Displays a single persona in the sidebar:
 * - Rounded-lg avatar image or colored initials fallback
 * - Tooltip showing persona name and segment when sidebar is collapsed
 * - When expanded: shows segment name + representative name beside avatar
 * - Subtle hover background, relies on parent sliding indicator for selection
 */

import React, { useMemo } from 'react';
import { ComponentTooltip } from '@components';
import { cn } from '@libs/utils/react';

/** Props for the PersonaSidebarItem component */
export interface PersonaSidebarItemProps {
  /** Unique identifier for the persona */
  uuid: string;
  /** Representative name (e.g., "Joy & Kevin") */
  name: string;
  /** Persona segment name (e.g., "Digital Multiculturals") */
  segment: string;
  /** Optional avatar image URL */
  avatar?: string;
  /** Theme color in HSL format (e.g., "220 70% 50%") */
  themeColor?: string;
  /** Whether this persona is currently selected */
  isSelected?: boolean;
  /** Whether the sidebar is expanded */
  isExpanded?: boolean;
  /** Click handler */
  onClick?: () => void;
}

/**
 * Generates initials from a name
 */
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * PersonaSidebarItem Component
 *
 * Renders a persona as a compact avatar with tooltip (collapsed)
 * or avatar + text (expanded).
 */
const PersonaSidebarItem: React.FC<PersonaSidebarItemProps> = ({
  name,
  segment,
  avatar,
  themeColor,
  isSelected = false,
  isExpanded = false,
  onClick,
}) => {
  // Compute background color from theme for initials fallback
  const avatarStyle = useMemo(
    () => ({
      backgroundColor: themeColor ? `hsl(${themeColor})` : '#6366F1',
    }),
    [themeColor],
  );

  const avatarElement = avatar ? (
    <div className='aucctus-border-secondary h-11 w-11 shrink-0 overflow-hidden rounded-lg border'>
      <img
        src={avatar}
        alt={segment}
        className='h-full w-full rounded-lg object-cover'
      />
    </div>
  ) : (
    <div
      className='aucctus-text-xs-bold flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white'
      style={avatarStyle}
    >
      {getInitials(segment)}
    </div>
  );

  const button = (
    <div
      onClick={onClick}
      className={cn(
        'flex cursor-pointer items-center rounded-lg transition-colors',
        isSelected
          ? 'aucctus-text-brand-primary'
          : 'aucctus-text-tertiary aucctus-bg-secondary-hover hover:aucctus-text-secondary',
      )}
      style={{
        padding: isExpanded ? '6px 8px' : '6px',
        justifyContent: isExpanded ? 'flex-start' : 'center',
        gap: isExpanded ? '10px' : '0',
      }}
    >
      {avatarElement}
      <div
        className='flex min-w-0 flex-1 flex-col'
        style={{
          opacity: isExpanded ? 1 : 0,
          width: isExpanded ? 'auto' : 0,
          overflow: 'hidden',
          transition: 'opacity 150ms ease-out',
        }}
      >
        <span className='aucctus-text-sm-bold aucctus-text-primary truncate whitespace-nowrap'>
          {segment}
        </span>
        <span className='aucctus-text-xs aucctus-text-tertiary truncate whitespace-nowrap'>
          {name}
        </span>
      </div>
    </div>
  );

  if (!isExpanded) {
    return <ComponentTooltip tip={segment}>{button}</ComponentTooltip>;
  }

  return <React.Fragment>{button}</React.Fragment>;
};

export default PersonaSidebarItem;
