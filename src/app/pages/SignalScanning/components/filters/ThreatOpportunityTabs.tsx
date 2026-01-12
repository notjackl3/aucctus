import { FunctionComponent } from 'react';
import { cn } from '@libs/utils/react';
import { AlertTriangle, Sparkles, Eye } from 'lucide-react';
import type { InsightClassification } from '@libs/api/types/strategicForesight';

interface ThreatOpportunityTabsProps {
  selected: InsightClassification | 'all';
  onSelect: (classification: InsightClassification | 'all') => void;
  counts: {
    threats: number;
    opportunities: number;
    watch: number;
  };
  className?: string;
}

const tabs: Array<{
  id: InsightClassification | 'all';
  label: string;
  icon: typeof AlertTriangle;
  bgClass: string;
  activeBgClass: string;
  textClass: string;
  activeTextClass: string;
  borderClass: string;
  countKey: 'threats' | 'opportunities' | 'watch' | null;
}> = [
  {
    id: 'all',
    label: 'All',
    icon: Eye,
    bgClass: 'aucctus-bg-secondary',
    activeBgClass: 'aucctus-bg-brand-primary',
    textClass: 'aucctus-text-secondary',
    activeTextClass: 'aucctus-text-brand-tertiary',
    borderClass: 'aucctus-border-brand-subtle',
    countKey: null,
  },
  {
    id: 'threat',
    label: 'Threats',
    icon: AlertTriangle,
    bgClass: 'aucctus-bg-error-primary',
    activeBgClass: 'aucctus-bg-error-secondary',
    textClass: 'aucctus-text-error-primary',
    activeTextClass: 'aucctus-text-error-primary',
    borderClass: 'aucctus-border-error-subtle',
    countKey: 'threats',
  },
  {
    id: 'opportunity',
    label: 'Opportunities',
    icon: Sparkles,
    bgClass: 'aucctus-bg-success-primary',
    activeBgClass: 'aucctus-bg-success-secondary',
    textClass: 'aucctus-text-success-primary',
    activeTextClass: 'aucctus-text-success-primary',
    borderClass: 'aucctus-border-success-subtle',
    countKey: 'opportunities',
  },
  {
    id: 'watch',
    label: 'Watch',
    icon: Eye,
    bgClass: 'aucctus-bg-warning-primary',
    activeBgClass: 'aucctus-bg-warning-secondary',
    textClass: 'aucctus-text-warning-primary',
    activeTextClass: 'aucctus-text-warning-primary',
    borderClass: 'aucctus-border-warning-subtle',
    countKey: 'watch',
  },
];

const ThreatOpportunityTabs: FunctionComponent<ThreatOpportunityTabsProps> = ({
  selected,
  onSelect,
  counts,
  className,
}) => {
  const totalCount = counts.threats + counts.opportunities + counts.watch;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {tabs.map((tab) => {
        const isActive = selected === tab.id;
        const count = tab.countKey === null ? totalCount : counts[tab.countKey];
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            className={cn(
              'flex items-center gap-2 rounded-lg border px-4 py-2 transition-all',
              isActive
                ? cn(tab.activeBgClass, tab.activeTextClass, tab.borderClass)
                : cn(tab.bgClass, tab.textClass, 'border-transparent'),
            )}
          >
            <Icon className='h-4 w-4' />
            <span className='aucctus-text-sm-medium'>{tab.label}</span>
            <span
              className={cn(
                'aucctus-text-xs-semibold rounded-full px-2 py-0.5',
                isActive ? 'aucctus-bg-primary' : 'aucctus-bg-secondary',
              )}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default ThreatOpportunityTabs;
