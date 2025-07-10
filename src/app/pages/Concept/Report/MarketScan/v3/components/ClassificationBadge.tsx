import React from 'react';
import { Badge } from '@components';
import { cn } from '@libs/utils/react';

interface ClassificationBadgeProps {
  classification: string;
  size?: 'small' | 'medium';
}

// Classification display mapping
const getClassificationDisplay = (classification: string): string => {
  const normalizedClassification = classification
    .toLowerCase()
    .replace(/[_-]/g, ' ');

  switch (normalizedClassification) {
    case 'secondary research':
      return 'Secondary Research';
    case 'primary research':
      return 'Primary Research';
    case 'peer reviewed':
      return 'Peer Reviewed';
    case 'industry opinion':
      return 'Industry Opinion';
    case 'news':
    case 'article':
      return 'News Article';
    case 'government report':
      return 'Government Report';
    case 'academic study':
      return 'Academic Study';
    case 'market report':
      return 'Market Report';
    case 'white paper':
      return 'White Paper';
    case 'case study':
      return 'Case Study';
    case 'survey':
      return 'Survey';
    case 'interview':
      return 'Interview';
    case 'gp1':
      return 'GP1';
    case 'gp2':
      return 'GP2';
    case 'gp3':
      return 'GP3';
    default:
      // Capitalize first letter of each word for unknown classifications
      return classification
        .split(/[_-\s]+/)
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(' ');
  }
};

// Classification color mapping
const getClassificationStyle = (classification: string) => {
  const normalizedClassification = classification
    .toLowerCase()
    .replace(/[_-]/g, ' ');

  switch (normalizedClassification) {
    case 'peer reviewed':
    case 'academic study':
      return {
        bg: 'aucctus-bg-success-secondary',
        text: 'aucctus-text-success-primary',
        border: 'aucctus-border-success-subtle',
      };
    case 'industry opinion':
    case 'market report':
    case 'white paper':
      return {
        bg: 'aucctus-bg-warning-secondary',
        text: 'aucctus-text-warning-primary',
        border: 'aucctus-border-warning',
      };
    case 'news':
    case 'article':
      return {
        bg: 'aucctus-bg-brand-secondary',
        text: 'aucctus-text-brand-primary',
        border: 'aucctus-border-brand-subtle',
      };
    case 'secondary research':
    case 'primary research':
    case 'government report':
      return {
        bg: 'aucctus-bg-tertiary',
        text: 'aucctus-text-primary',
        border: 'aucctus-border-tertiary',
      };
    default:
      return {
        bg: 'aucctus-bg-secondary',
        text: 'aucctus-text-secondary',
        border: 'aucctus-border-secondary',
      };
  }
};

const ClassificationBadge: React.FC<ClassificationBadgeProps> = ({
  classification,
  size = 'small',
}) => {
  const styles = getClassificationStyle(classification);
  const displayText = getClassificationDisplay(classification);
  const sizeClasses = size === 'small' ? 'aucctus-text-xs' : 'aucctus-text-sm';

  return (
    <Badge.Default
      value={displayText}
      classNameBadge={cn(
        'border rounded-md items-center justify-center',
        styles.bg,
        styles.border,
      )}
      classNameLabel={cn(
        'whitespace-nowrap font-medium',
        styles.text,
        sizeClasses,
      )}
    />
  );
};

export default ClassificationBadge;
