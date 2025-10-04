import { Icon } from '@components';
import { cn } from '@libs/utils/react';
import React from 'react';

interface InfoSectionCardProps {
  /** Icon variant to display in the header */
  iconVariant: string;
  /** Title text for the section */
  title: string;
  /** Content text for the section */
  content: string;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * InfoSectionCard - Reusable component for displaying information sections
 * with an icon, title, and content in a styled card format.
 *
 * Used in ExecutiveDashboard for "What is it?", "Value Proposition",
 * and "Problem Statement" sections.
 */
const InfoSectionCard: React.FC<InfoSectionCardProps> = ({
  iconVariant,
  title,
  content,
  className,
}) => {
  return (
    <div className={cn('aucctus-border-primary rounded-lg border', className)}>
      <div className='p-5'>
        <div className='mb-3 flex items-center gap-2'>
          <Icon
            variant={iconVariant as any}
            className='aucctus-stroke-tertiary h-3 w-3'
          />
          <span className='aucctus-text-xs-semibold aucctus-text-tertiary uppercase tracking-wide'>
            {title}
          </span>
        </div>
        <p className='aucctus-text-md aucctus-text-primary leading-snug'>
          {content}
        </p>
      </div>
    </div>
  );
};

export default React.memo(InfoSectionCard);
