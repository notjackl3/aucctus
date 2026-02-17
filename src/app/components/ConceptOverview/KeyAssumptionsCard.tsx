import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AssumptionCategory } from '@libs/api/types/concept/assumptions';
import type { RiskLevel } from './config';
import ProgressBar from './ProgressBar';
import { AlertTriangle } from 'lucide-react';
import { DynamicIcon } from '@libs/utils/iconMap';

// Import CategoryMetric from assumptions API
interface CategoryMetric {
  category: AssumptionCategory;
  count: number;
  cumulativeCertainty: number;
  cumulativeImportance: number;
  averageRisk: number;
  validationStatus:
    | 'validated'
    | 'unvalidated'
    | 'partially_validated'
    | 'invalidated'
    | 'untested';
  validationPercentage: number;
}

interface KeyAssumptionsCardProps {
  currentCardIndex: number;
  progress: number;
  totalCards: number;
  onCardClick: (index: number) => void;
  conceptId?: string; // For navigation routing and API calls (root identifier)
  conceptUuid?: string; // For fetching concept overview data
  // Centralized data props
  categoryMetrics?: Record<AssumptionCategory, CategoryMetric>;
  isLoadingAssumptions?: boolean;
  executiveSummary?: string;
}

interface RiskColors {
  bg: string;
  border: string;
  text: string;
  icon: string;
}

const KeyAssumptionsCard: React.FC<KeyAssumptionsCardProps> = ({
  currentCardIndex,
  progress,
  totalCards,
  onCardClick,
  conceptId,
  categoryMetrics,
  isLoadingAssumptions = false,
  executiveSummary,
}) => {
  const navigate = useNavigate();

  // Convert averageRisk (0-1) to risk level
  const getRiskLevelFromValue = useCallback(
    (averageRisk: number): { level: RiskLevel; text: string } => {
      if (averageRisk >= 0.7) {
        return { level: 'high', text: 'High' };
      } else if (averageRisk >= 0.4) {
        return { level: 'medium', text: 'Medium' };
      } else {
        return { level: 'low', text: 'Low' };
      }
    },
    [],
  );

  // Transform categoryMetrics to risk categories
  const transformedRiskCategories = useMemo(() => {
    if (!categoryMetrics) {
      return [];
    }

    // Map categories to display format
    const categoryMap: Record<
      AssumptionCategory,
      { name: string; iconVariant: string }
    > = {
      desirability: { name: 'Desirability', iconVariant: 'heart' },
      viability: { name: 'Viability', iconVariant: 'currency-dollar' },
      feasibility: { name: 'Feasibility', iconVariant: 'gear' },
      adaptability: { name: 'Adaptability', iconVariant: 'refresh' },
    };

    return Object.entries(categoryMetrics).map(([category, metrics], index) => {
      const categoryKey = category as AssumptionCategory;
      const riskInfo = getRiskLevelFromValue(metrics.averageRisk);
      const riskPercentage = Math.round(metrics.averageRisk * 100);

      return {
        id: (index + 1).toString(),
        name: categoryMap[categoryKey].name,
        category: categoryKey.toLowerCase(),
        risk: riskInfo.text,
        riskLevel: riskInfo.level,
        riskValue: riskPercentage,
        iconVariant: categoryMap[categoryKey].iconVariant,
      };
    });
  }, [categoryMetrics, getRiskLevelFromValue]);

  // Get real summary data (no mock fallback)
  const assumptionsSummary = executiveSummary;

  // Transform risk level colors to Aucctus theme classes
  const getRiskColor = useCallback((riskLevel: RiskLevel): RiskColors => {
    switch (riskLevel) {
      case 'high':
        return {
          bg: 'aucctus-bg-error-subtle',
          border: 'aucctus-border-error-extra-subtle',
          text: 'aucctus-text-error-primary',
          icon: 'aucctus-stroke-error-primary',
        };
      case 'medium':
        return {
          bg: 'aucctus-bg-warning-subtle',
          border: 'aucctus-border-warning-extra-subtle',
          text: 'aucctus-text-warning-primary',
          icon: 'aucctus-stroke-warning-primary',
        };
      case 'low':
        return {
          bg: 'aucctus-bg-success-subtle',
          border: 'aucctus-border-success-extra-subtle',
          text: 'aucctus-text-success-primary',
          icon: 'aucctus-stroke-success-primary',
        };
      default:
        return {
          bg: 'aucctus-bg-secondary',
          border: 'aucctus-border-secondary',
          text: 'aucctus-text-secondary',
          icon: 'aucctus-stroke-secondary',
        };
    }
  }, []);

  const handleDetailsClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      navigate(`/concept/${conceptId}/assumptions`);
    },
    [navigate, conceptId],
  );

  // Memoize risk categories with colors
  const riskCategoriesWithColors = useMemo(
    () =>
      transformedRiskCategories.map((category) => ({
        ...category,
        colors: getRiskColor(category.riskLevel),
      })),
    [transformedRiskCategories, getRiskColor],
  );

  return (
    <div className='aucctus-bg-primary aucctus-border-secondary h-full min-h-[350px] cursor-pointer rounded-lg border transition-all duration-200 hover:shadow-lg'>
      <div className='flex h-full flex-col p-6'>
        {/* Progress Bar Navigation - Isolated component for performance */}
        <ProgressBar
          currentCardIndex={currentCardIndex}
          progress={progress}
          totalCards={totalCards}
          onCardClick={onCardClick}
        />

        <div className='mb-6 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <AlertTriangle className='aucctus-stroke-tertiary h-4 w-4' />
            <h3 className='aucctus-text-sm-semibold aucctus-text-tertiary'>
              Key Assumptions
            </h3>
          </div>
          <button
            onClick={handleDetailsClick}
            className='aucctus-bg-primary-hover aucctus-text-sm-medium aucctus-text-secondary-hover rounded-lg px-3 py-1.5'
          >
            Details
          </button>
        </div>

        {assumptionsSummary ? (
          // Two-column layout: Summary + Risk Category Cards
          <div className='grid flex-1 grid-cols-1 gap-4 md:grid-cols-2'>
            {/* Left - Biggest Risk Summary */}
            <div className='flex flex-col justify-start px-2'>
              {isLoadingAssumptions ? (
                <div className='aucctus-text-lg aucctus-text-secondary'>
                  Loading assumptions...
                </div>
              ) : (
                <p className='aucctus-text-md-semibold aucctus-text-primary'>
                  {assumptionsSummary}
                </p>
              )}
            </div>

            {/* Right - Risk Category Cards */}
            <div className='grid min-h-0 grid-cols-2 content-center gap-3'>
              {riskCategoriesWithColors.length > 0 ? (
                riskCategoriesWithColors.map((category) => (
                  <div
                    key={category.id}
                    className={`border ${category.colors.border} ${category.colors.bg} flex min-h-[90px] flex-col justify-center rounded-lg p-3`}
                  >
                    <div className='flex h-full flex-col items-center justify-center text-center'>
                      <DynamicIcon
                        variant={category.iconVariant as any}
                        className={`h-5 w-5 ${category.colors.icon} mb-2`}
                      />
                      <p className='aucctus-text-sm-semibold aucctus-text-primary leading-tight'>
                        {category.name}
                      </p>
                      <span
                        className={`aucctus-text-xs-semibold mt-2 rounded-full px-2 py-1 ${category.colors.text} ${category.colors.bg}`}
                      >
                        {category.risk} Risk
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className='col-span-2 flex items-center justify-center'>
                  <div className='aucctus-text-sm aucctus-text-secondary'>
                    No assumptions data available
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Single-column layout: Risk Category Cards only (expanded)
          <div className='flex flex-1 items-start justify-center px-4 pb-2 pt-0'>
            {isLoadingAssumptions ? (
              <div className='aucctus-text-lg aucctus-text-secondary'>
                Loading assumptions...
              </div>
            ) : riskCategoriesWithColors.length > 0 ? (
              <div className='grid w-full max-w-[380px] grid-cols-2 gap-3'>
                {riskCategoriesWithColors.map((category) => (
                  <div
                    key={category.id}
                    className={`border ${category.colors.border} ${category.colors.bg} flex min-h-[85px] flex-col justify-center rounded-lg p-3`}
                  >
                    <div className='flex h-full flex-col items-center justify-center text-center'>
                      <DynamicIcon
                        variant={category.iconVariant as any}
                        className={`h-5 w-5 ${category.colors.icon} mb-1`}
                      />
                      <p className='aucctus-text-sm-semibold aucctus-text-primary leading-tight'>
                        {category.name}
                      </p>
                      <span
                        className={`aucctus-text-xs-semibold mt-1 rounded-full px-2 py-1 ${category.colors.text} ${category.colors.bg}`}
                      >
                        {category.risk} Risk
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='aucctus-text-sm aucctus-text-secondary'>
                No assumptions data available
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default KeyAssumptionsCard;
