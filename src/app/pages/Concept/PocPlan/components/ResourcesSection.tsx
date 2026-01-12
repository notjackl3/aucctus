import { FunctionComponent, useMemo } from 'react';
import { Icon, ComponentTooltip } from '@components';
import { IPocResource } from '@libs/api/types';
import { cn } from '@libs/utils/react';

interface IResourcesSectionProps {
  resources: IPocResource[];
}

const CATEGORY_CONFIG: Record<
  IPocResource['category'],
  { label: string; icon: IconVariant; gradient: string; bgGradient: string }
> = {
  personnel: {
    label: 'Personnel',
    icon: 'users-02',
    gradient: 'from-blue-500 to-blue-600',
    bgGradient: 'from-blue-500/10 to-blue-600/5',
  },
  technology: {
    label: 'Technology',
    icon: 'cube',
    gradient: 'from-purple-500 to-purple-600',
    bgGradient: 'from-purple-500/10 to-purple-600/5',
  },
  budget: {
    label: 'Budget',
    icon: 'currency-dollar',
    gradient: 'from-emerald-500 to-emerald-600',
    bgGradient: 'from-emerald-500/10 to-emerald-600/5',
  },
  external: {
    label: 'External',
    icon: 'building-02',
    gradient: 'from-orange-500 to-orange-600',
    bgGradient: 'from-orange-500/10 to-orange-600/5',
  },
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatCompactCurrency = (amount: number): string => {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount.toFixed(0)}`;
};

// Tooltip content for category details
const CategoryTooltipContent: FunctionComponent<{
  category: IPocResource['category'];
  resources: IPocResource[];
}> = ({ category, resources }) => {
  const config = CATEGORY_CONFIG[category];

  return (
    <div
      className={cn(
        'aucctus-bg-primary rounded-lg shadow-xl',
        'aucctus-border-secondary border',
        'w-[320px] overflow-hidden',
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-3',
          'bg-gradient-to-r',
          config.gradient,
        )}
      >
        <Icon variant={config.icon} className='h-5 w-5 stroke-white' />
        <span className='font-semibold text-white'>
          {config.label} Resources
        </span>
      </div>

      {/* Resource List */}
      <div className='flex max-h-[280px] flex-col gap-2 overflow-y-auto p-3'>
        {resources.map((resource) => (
          <div
            key={resource.uuid}
            className={cn(
              'flex items-center gap-3 rounded-lg p-2.5',
              'aucctus-bg-secondary',
            )}
          >
            <div className='flex min-w-0 flex-1 flex-col'>
              <span className='aucctus-text-primary aucctus-text-sm-medium truncate'>
                {resource.name}
              </span>
              <span className='aucctus-text-tertiary aucctus-text-xs line-clamp-1'>
                {resource.description}
              </span>
            </div>
            <div className='flex flex-shrink-0 flex-col items-end'>
              {resource.estimatedCost ? (
                <span className='aucctus-text-primary aucctus-text-sm-semibold'>
                  {formatCurrency(resource.estimatedCost)}
                </span>
              ) : (
                <span className='aucctus-text-tertiary aucctus-text-xs'>
                  TBD
                </span>
              )}
              {resource.quantity && resource.unit && (
                <span className='aucctus-text-tertiary aucctus-text-xs'>
                  {resource.quantity} {resource.unit}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Category card with tooltip
const CategoryCard: FunctionComponent<{
  category: IPocResource['category'];
  resources: IPocResource[];
  totalBudget: number;
}> = ({ category, resources, totalBudget }) => {
  const config = CATEGORY_CONFIG[category];
  const categoryTotal = resources.reduce(
    (sum, r) => sum + (r.estimatedCost || 0),
    0,
  );
  const percentage = totalBudget > 0 ? (categoryTotal / totalBudget) * 100 : 0;

  return (
    <ComponentTooltip
      tip={<CategoryTooltipContent category={category} resources={resources} />}
      preferredPosition='below'
      hideDelay={100}
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-lg',
          'transition-all duration-200',
          'cursor-pointer',
          'hover:scale-[1.02] hover:shadow-lg',
        )}
      >
        <div
          className={cn(
            'relative p-5',
            'bg-gradient-to-br',
            config.bgGradient,
            'border border-white/10 dark:border-white/5',
          )}
        >
          {/* Background decoration */}
          <div
            className={cn(
              'absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20',
              'bg-gradient-to-br',
              config.gradient,
            )}
          />
          <div
            className={cn(
              'absolute -bottom-2 -right-2 h-16 w-16 rounded-full opacity-10',
              'bg-gradient-to-br',
              config.gradient,
            )}
          />

          <div className='relative flex flex-col gap-4'>
            {/* Header */}
            <div className='flex items-start justify-between'>
              <div
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-lg',
                  'bg-gradient-to-br',
                  config.gradient,
                  'shadow-lg',
                )}
              >
                <Icon variant={config.icon} className='h-6 w-6 stroke-white' />
              </div>
              <div className='flex flex-col items-end'>
                <span className='aucctus-text-primary aucctus-header-md-semibold'>
                  {formatCompactCurrency(categoryTotal)}
                </span>
                <span className='aucctus-text-tertiary aucctus-text-xs'>
                  {percentage.toFixed(0)}% of total
                </span>
              </div>
            </div>

            {/* Label and count */}
            <div className='flex flex-col gap-1'>
              <span className='aucctus-text-primary aucctus-text-md-semibold'>
                {config.label}
              </span>
              <span className='aucctus-text-secondary aucctus-text-sm'>
                {resources.length}{' '}
                {resources.length === 1 ? 'resource' : 'resources'}
              </span>
            </div>

            {/* Progress bar */}
            <div className='flex items-center gap-2'>
              <div className='aucctus-bg-secondary h-2 flex-1 overflow-hidden rounded-full'>
                <div
                  className={cn(
                    'h-full rounded-full bg-gradient-to-r',
                    config.gradient,
                    'transition-all duration-500',
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ComponentTooltip>
  );
};

const ResourcesSection: FunctionComponent<IResourcesSectionProps> = ({
  resources,
}) => {
  // Group resources by category
  const groupedResources = useMemo(() => {
    return resources.reduce(
      (acc, resource) => {
        if (!acc[resource.category]) {
          acc[resource.category] = [];
        }
        acc[resource.category].push(resource);
        return acc;
      },
      {} as Record<IPocResource['category'], IPocResource[]>,
    );
  }, [resources]);

  // Calculate total cost
  const totalCost = useMemo(() => {
    return resources.reduce(
      (sum, resource) => sum + (resource.estimatedCost || 0),
      0,
    );
  }, [resources]);

  // Get categories with resources
  const categoriesWithResources = useMemo(() => {
    const categories: IPocResource['category'][] = [
      'personnel',
      'technology',
      'budget',
      'external',
    ];
    return categories.filter(
      (category) => groupedResources[category]?.length > 0,
    );
  }, [groupedResources]);

  return (
    <div
      className={cn(
        'flex flex-col gap-6 rounded-xl p-6',
        'aucctus-bg-primary',
        'aucctus-border-primary border',
        'shadow-sm',
      )}
    >
      {/* Section Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg',
              'bg-gradient-to-br from-emerald-500 to-teal-600',
            )}
          >
            <Icon variant='currency-dollar' className='h-5 w-5 stroke-white' />
          </div>
          <div className='flex flex-col'>
            <h2 className='aucctus-text-primary aucctus-header-md-semibold'>
              Resource Plan
            </h2>
            <span className='aucctus-text-tertiary aucctus-text-sm'>
              {resources.length} items across {categoriesWithResources.length}{' '}
              categories
            </span>
          </div>
        </div>

        {/* Total Budget Badge */}
        <div
          className={cn(
            'flex items-center gap-3 rounded-lg px-5 py-3',
            'bg-gradient-to-r from-emerald-500 to-teal-600',
          )}
        >
          <Icon variant='piggy-bank' className='h-5 w-5 stroke-white/80' />
          <div className='flex flex-col'>
            <span className='text-xs text-emerald-100'>Total Investment</span>
            <span className='text-lg font-bold text-white'>
              {formatCurrency(totalCost)}
            </span>
          </div>
        </div>
      </div>

      {/* Category Cards Grid */}
      <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
        {categoriesWithResources.map((category) => (
          <CategoryCard
            key={category}
            category={category}
            resources={groupedResources[category] || []}
            totalBudget={totalCost}
          />
        ))}
      </div>
    </div>
  );
};

export default ResourcesSection;
