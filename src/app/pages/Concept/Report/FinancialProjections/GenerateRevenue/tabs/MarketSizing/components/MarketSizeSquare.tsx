import React from 'react';
import { formatCurrency } from '../assumptionsUtils';
import { ComponentTooltip } from '@components';
import { ExpandCollapse } from '@hooks/animation/animation.hook';
import { cn } from '@libs/utils/react';
import {
  marketSizeSquareConfig,
  type MarketSizeType,
} from '../styles/marketSizeStyles';
import { HelpCircle } from 'lucide-react';

interface MarketSizeSquareProps {
  type: MarketSizeType;
  value: number;
  activeFilter?: MarketSizeType;
  handleFilterToggle: (filter: MarketSizeType) => void;
  percentage?: number;
  parentType?: string;
  tooltipContent?: React.ReactNode;
}

const MarketSizeSquare: React.FC<MarketSizeSquareProps> = ({
  type,
  value,
  activeFilter,
  handleFilterToggle,
  percentage,
  parentType,
  tooltipContent,
}) => {
  const config = marketSizeSquareConfig[type];

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleFilterToggle(type);
  };

  const isFilterExpanded = activeFilter === type || activeFilter === null;

  const renderSquareContent = () => (
    <div className={`absolute left-4 top-4 ${config.textColor}`}>
      <div className={`${config.fontSize} flex items-center gap-1 font-bold`}>
        {formatCurrency(value)}
        {tooltipContent ? (
          <ComponentTooltip tip={tooltipContent}>
            <HelpCircle className={`h-4 w-4 ${config.iconColor} cursor-help`} />
          </ComponentTooltip>
        ) : (
          <HelpCircle className={`h-4 w-4 ${config.iconColor}`} />
        )}
      </div>
      <div
        className={cn('aucctus-text-xs mt-1 uppercase', config.subtextColor)}
      >
        {type}
      </div>
      {percentage !== undefined && parentType && (
        <div className={cn('aucctus-text-xs mt-0.5', config.subtextColor)}>
          {percentage < 1 && percentage > 0 ? '<1' : percentage.toFixed(1)}% of{' '}
          {parentType}
        </div>
      )}
      <ExpandCollapse isExpanded={isFilterExpanded} duration={0.2} withOpacity>
        <div
          className={cn(
            `aucctus-text-xs mt-2 w-fit rounded-full px-2 py-0.5`,
            config.filterBgClass,
          )}
        >
          {activeFilter === type ? 'Click to show all' : 'Filter'}
        </div>
      </ExpandCollapse>
    </div>
  );

  // Create the actual className combining positioning with bg color from the base styles
  const squareClassName = cn(
    config.className,
    config.bgClass,
    activeFilter === type ? config.activeClassName : '',
  );

  return (
    <div
      className={squareClassName}
      style={{
        boxShadow:
          type !== 'tam'
            ? '5px 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -0px rgba(0, 0, 0, 0.2)'
            : 'none',
      }}
      onClick={handleClick}
    >
      {renderSquareContent()}
    </div>
  );
};

export default MarketSizeSquare;
