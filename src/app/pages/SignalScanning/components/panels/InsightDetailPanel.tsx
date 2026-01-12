import { FunctionComponent, useState } from 'react';
import { cn } from '@libs/utils/react';
import {
  AlertTriangle,
  Sparkles,
  Eye,
  Clock,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  Loader2,
  Plus,
  Newspaper,
  FileText,
  Database,
  Linkedin,
  FileCheck,
  ChevronDown,
  ChevronRight,
  Layers,
  FileSearch,
  Lightbulb,
  Pencil,
  ArrowRight,
  Star,
} from 'lucide-react';
import { ComponentTooltip } from '@components';
import type {
  IStrategicInsight,
  InsightClassification,
  ISignalSourceV2,
  IPattern,
  TrendDirection,
  IRecommendedConceptAction,
} from '@libs/api/types/strategicForesight';

interface InsightDetailPanelProps {
  insight: IStrategicInsight | null;
  isLoading?: boolean;
  onToggleTracking?: (insightUuid: string, isTracked: boolean) => void;
  onConceptClick?: (conceptUuid: string) => void;
  onNetNewAction?: (actionDetails: string) => void;
  onModifyAction?: (conceptIdentifier: string, actionDetails: string) => void;
  isUpdatingTracking?: boolean;
  className?: string;
}

const ClassificationBadge: FunctionComponent<{
  classification: InsightClassification;
}> = ({ classification }) => {
  const config: Record<
    InsightClassification,
    { icon: typeof AlertTriangle; label: string; className: string }
  > = {
    threat: {
      icon: AlertTriangle,
      label: 'THREAT',
      className:
        'aucctus-bg-error-primary aucctus-text-error-primary aucctus-border-error-subtle',
    },
    opportunity: {
      icon: Sparkles,
      label: 'OPPORTUNITY',
      className:
        'aucctus-bg-success-primary aucctus-text-success-primary aucctus-border-success-subtle',
    },
    watch: {
      icon: Eye,
      label: 'WATCH',
      className:
        'aucctus-bg-warning-primary aucctus-text-warning-primary aucctus-border-warning-subtle',
    },
  };

  const { icon: Icon, label, className } = config[classification];

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide',
        className,
      )}
    >
      <Icon className='h-3.5 w-3.5' />
      {label}
    </div>
  );
};

const DetailSection: FunctionComponent<{
  title: string;
  icon?: typeof AlertTriangle;
  children: React.ReactNode;
  className?: string;
}> = ({ title, icon: Icon, children, className }) => (
  <div className={cn('space-y-2', className)}>
    <h4 className='aucctus-text-secondary flex items-center gap-2 text-xs font-semibold uppercase tracking-wide'>
      {Icon && <Icon className='h-3.5 w-3.5' />}
      {title}
    </h4>
    <div className='aucctus-text-primary text-sm leading-relaxed'>
      {children}
    </div>
  </div>
);

// Source type icons and colors
const SOURCE_TYPE_CONFIG: Record<
  ISignalSourceV2['sourceType'],
  { icon: typeof Newspaper; label: string; className: string }
> = {
  news_article: {
    icon: Newspaper,
    label: 'News',
    className: 'aucctus-bg-info-primary aucctus-text-info-primary',
  },
  press_release: {
    icon: FileText,
    label: 'Press Release',
    className: 'aucctus-bg-success-primary aucctus-text-success-primary',
  },
  crunchbase: {
    icon: Database,
    label: 'Crunchbase',
    className: 'aucctus-bg-warning-primary aucctus-text-warning-primary',
  },
  linkedin: {
    icon: Linkedin,
    label: 'LinkedIn',
    className: 'aucctus-bg-info-primary aucctus-text-info-primary',
  },
  sec_filing: {
    icon: FileCheck,
    label: 'SEC Filing',
    className: 'aucctus-bg-research-primary aucctus-text-research-primary',
  },
};

// Trend direction indicator
const TrendIndicator: FunctionComponent<{ direction: TrendDirection }> = ({
  direction,
}) => {
  const config: Record<
    TrendDirection,
    { icon: typeof TrendingUp; label: string; className: string }
  > = {
    accelerating: {
      icon: TrendingUp,
      label: 'Accelerating',
      className: 'aucctus-text-success-primary',
    },
    stable: {
      icon: Minus,
      label: 'Stable',
      className: 'aucctus-text-tertiary',
    },
    decelerating: {
      icon: TrendingDown,
      label: 'Decelerating',
      className: 'aucctus-text-warning-primary',
    },
  };

  const { icon: Icon, label, className } = config[direction];

  return (
    <ComponentTooltip tip={`Trend: ${label}`} preferredPosition='above'>
      <div className={cn('flex items-center gap-1', className)}>
        <Icon className='h-3.5 w-3.5' />
        <span className='text-xs'>{label}</span>
      </div>
    </ComponentTooltip>
  );
};

// Collapsible pattern card showing pattern details and its sources
const PatternCard: FunctionComponent<{
  pattern: IPattern;
  defaultExpanded?: boolean;
}> = ({ pattern, defaultExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className='aucctus-border-secondary aucctus-bg-secondary overflow-hidden rounded-lg border'>
      {/* Pattern Header - Clickable to expand/collapse */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className='aucctus-bg-secondary-hover flex w-full items-start gap-3 p-3 text-left transition-colors'
      >
        <div className='mt-0.5 flex-shrink-0'>
          {isExpanded ? (
            <ChevronDown className='aucctus-text-tertiary h-4 w-4' />
          ) : (
            <ChevronRight className='aucctus-text-tertiary h-4 w-4' />
          )}
        </div>
        <div className='min-w-0 flex-1'>
          <div className='mb-1 flex items-center gap-2'>
            <Layers className='aucctus-text-brand-primary h-3.5 w-3.5 flex-shrink-0' />
            <h5 className='aucctus-text-primary truncate text-sm font-medium'>
              {pattern.title}
            </h5>
          </div>
          <p className='aucctus-text-secondary line-clamp-2 text-xs'>
            {pattern.summary}
          </p>
          <div className='mt-2 flex items-center gap-4'>
            <TrendIndicator direction={pattern.trendDirection} />
            <span className='aucctus-text-tertiary text-xs'>
              {pattern.signalCount} signal{pattern.signalCount !== 1 ? 's' : ''}
            </span>
            {pattern.keyCompanies.length > 0 && (
              <span className='aucctus-text-tertiary truncate text-xs'>
                {pattern.keyCompanies.slice(0, 2).join(', ')}
                {pattern.keyCompanies.length > 2 &&
                  ` +${pattern.keyCompanies.length - 2}`}
              </span>
            )}
          </div>
        </div>
      </button>

      {/* Expanded Content - Sources */}
      {isExpanded && pattern.sources && pattern.sources.length > 0 && (
        <div className='aucctus-border-secondary aucctus-bg-primary border-t p-3'>
          <div className='mb-2 flex items-center gap-2'>
            <FileSearch className='aucctus-text-tertiary h-3.5 w-3.5' />
            <span className='aucctus-text-secondary text-xs font-medium uppercase tracking-wide'>
              Sources
            </span>
          </div>
          <div className='space-y-2'>
            {pattern.sources.map((source) => (
              <a
                key={source.uuid}
                href={source.url}
                target='_blank'
                rel='noopener noreferrer'
                className='aucctus-bg-secondary-hover group block rounded-md p-2 transition-colors'
                onClick={(e) => e.stopPropagation()}
              >
                <div className='flex items-start gap-2'>
                  {(() => {
                    const SourceIcon =
                      SOURCE_TYPE_CONFIG[source.sourceType].icon;
                    return (
                      <SourceIcon className='aucctus-text-tertiary mt-0.5 h-4 w-4 flex-shrink-0' />
                    );
                  })()}
                  <div className='min-w-0 flex-1'>
                    <div className='flex items-center gap-2'>
                      <span className='aucctus-text-primary group-hover:aucctus-text-brand-primary line-clamp-1 text-sm transition-colors'>
                        {source.title}
                      </span>
                      <ExternalLink className='aucctus-text-tertiary h-3 w-3 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100' />
                    </div>
                    {source.citation && (
                      <p className='aucctus-text-tertiary mt-1 line-clamp-2 text-xs italic'>
                        &ldquo;{source.citation}&rdquo;
                      </p>
                    )}
                    <div className='mt-1 flex items-center gap-2'>
                      <span className='aucctus-text-quaternary text-xs'>
                        {SOURCE_TYPE_CONFIG[source.sourceType].label}
                      </span>
                      {source.publishedAt && (
                        <>
                          <span className='aucctus-text-quaternary text-xs'>
                            •
                          </span>
                          <span className='aucctus-text-quaternary text-xs'>
                            {new Date(source.publishedAt).toLocaleDateString(
                              'en-US',
                              {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              },
                            )}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Recommended concept action card
const RecommendedActionCard: FunctionComponent<{
  action: IRecommendedConceptAction;
  onNetNewAction?: (actionDetails: string) => void;
  onModifyAction?: (conceptIdentifier: string, actionDetails: string) => void;
}> = ({ action, onNetNewAction, onModifyAction }) => {
  const isModify = action.actionType === 'modify';

  const handleActionClick = () => {
    if (isModify && action.affectedConceptIdentifier) {
      onModifyAction?.(action.affectedConceptIdentifier, action.actionDetails);
    } else if (!isModify) {
      onNetNewAction?.(action.actionDetails);
    }
  };

  return (
    <button
      onClick={handleActionClick}
      className='aucctus-border-secondary aucctus-bg-secondary aucctus-bg-secondary-hover flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors'
    >
      {/* Action type icon */}
      <div
        className={cn(
          'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full',
          isModify
            ? 'aucctus-bg-warning-primary aucctus-text-warning-primary'
            : 'aucctus-bg-success-primary aucctus-text-success-primary',
        )}
      >
        {isModify ? (
          <Pencil className='h-4 w-4' />
        ) : (
          <Plus className='h-4 w-4' />
        )}
      </div>

      {/* Action content */}
      <div className='min-w-0 flex-1'>
        <div className='mb-1 flex items-center gap-2'>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-medium',
              isModify
                ? 'aucctus-bg-warning-primary aucctus-text-warning-primary'
                : 'aucctus-bg-success-primary aucctus-text-success-primary',
            )}
          >
            {isModify ? 'Update Concept' : 'New Concept'}
          </span>
        </div>
        <p className='aucctus-text-primary text-sm leading-relaxed'>
          {action.actionTitle}
        </p>

        {/* Affected concept link (for modify actions) */}
        {isModify && action.affectedConceptIdentifier && (
          <div className='aucctus-text-brand-primary mt-2 flex items-center gap-1 text-xs font-medium'>
            <ArrowRight className='h-3 w-3' />
            {action.affectedConceptTitle || action.affectedConceptIdentifier}
          </div>
        )}
      </div>
    </button>
  );
};

const InsightDetailPanel: FunctionComponent<InsightDetailPanelProps> = ({
  insight,
  isLoading,
  onToggleTracking,
  onConceptClick: _onConceptClick,
  onNetNewAction,
  onModifyAction,
  isUpdatingTracking,
  className,
}) => {
  // Note: _onConceptClick is kept for potential future use (e.g., related concepts display)
  void _onConceptClick;
  if (isLoading) {
    return (
      <div
        className={cn(
          'aucctus-bg-primary aucctus-border-primary rounded-xl border p-6',
          className,
        )}
      >
        <div className='flex h-64 items-center justify-center'>
          <Loader2 className='aucctus-text-brand-primary h-8 w-8 animate-spin' />
        </div>
      </div>
    );
  }

  if (!insight) {
    return (
      <div
        className={cn(
          'aucctus-bg-primary aucctus-border-primary rounded-xl border p-6',
          className,
        )}
      >
        <div className='flex h-64 flex-col items-center justify-center text-center'>
          <Target className='aucctus-text-tertiary mb-3 h-12 w-12 opacity-40' />
          <h3 className='aucctus-text-secondary text-sm font-medium'>
            Select an insight
          </h3>
          <p className='aucctus-text-tertiary mt-1 text-xs'>
            Click on a signal in the radar or list to view details
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'aucctus-bg-primary aucctus-border-primary overflow-hidden rounded-xl border',
        className,
      )}
    >
      {/* Header */}
      <div className='aucctus-border-primary flex items-start justify-between border-b p-5'>
        <div className='min-w-0 flex-1'>
          <div className='mb-2 flex items-center gap-3'>
            <ClassificationBadge classification={insight.classification} />
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-xs font-medium',
                insight.confidence === 'high'
                  ? 'aucctus-bg-success-primary aucctus-text-success-primary'
                  : insight.confidence === 'medium'
                    ? 'aucctus-bg-warning-primary aucctus-text-warning-primary'
                    : 'aucctus-bg-tertiary aucctus-text-tertiary',
              )}
            >
              {insight.confidence.charAt(0).toUpperCase() +
                insight.confidence.slice(1)}{' '}
              Confidence
            </span>
            {insight.isTracked && (
              <ComponentTooltip tip='Tracked' preferredPosition='above'>
                <div className='aucctus-bg-warning-primary aucctus-text-warning-primary flex items-center gap-1 rounded-full px-2 py-0.5'>
                  <Star className='h-3 w-3 fill-current' />
                  <span className='text-xs font-medium'>Tracked</span>
                </div>
              </ComponentTooltip>
            )}
          </div>
          <h2 className='aucctus-text-primary text-lg font-semibold leading-tight'>
            {insight.headline}
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className='max-h-[calc(100vh-300px)] space-y-6 overflow-y-auto p-5'>
        {/* Recommended Action - Top priority for executives */}
        <div className='aucctus-bg-brand-primary aucctus-border-brand-subtle rounded-lg border p-4'>
          <h4 className='aucctus-text-brand-secondary mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide'>
            <Sparkles className='h-3.5 w-3.5' />
            Recommended Action
          </h4>
          <p className='aucctus-text-brand-primary text-sm leading-relaxed'>
            {insight.recommendedAction}
          </p>
        </div>

        {/* What Changed */}
        <DetailSection title='What Changed?' icon={TrendingUp}>
          {insight.whatChanged}
        </DetailSection>

        {/* Why It Matters */}
        <DetailSection title='Why It Matters' icon={Target}>
          {insight.whyItMatters}
        </DetailSection>

        {/* Likely Impact */}
        <DetailSection title='Likely Impact & Timeline' icon={Clock}>
          <p>{insight.likelyImpact}</p>
          <div className='aucctus-bg-brand-primary aucctus-text-brand-primary mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium'>
            <Clock className='h-3 w-3' />
            Time Horizon: {insight.timeHorizonLabel}
          </div>
        </DetailSection>

        {/* Recommended Concept Actions (AI-generated from signal analysis) */}
        {insight.recommendedConceptActions &&
          insight.recommendedConceptActions.length > 0 && (
            <DetailSection title='Recommended Concept Actions' icon={Lightbulb}>
              <div className='space-y-2'>
                {insight.recommendedConceptActions.map((action) => (
                  <RecommendedActionCard
                    key={action.uuid}
                    action={action}
                    onNetNewAction={onNetNewAction}
                    onModifyAction={onModifyAction}
                  />
                ))}
              </div>
              <p className='aucctus-text-tertiary mt-3 text-center text-[11px]'>
                AI-generated suggestions based on signal analysis
              </p>
            </DetailSection>
          )}

        {/* Evidence - Patterns and Sources */}
        {insight.patterns.length > 0 && (
          <DetailSection title='Evidence' icon={Layers}>
            <div className='space-y-3'>
              {insight.patterns.map((pattern, index) => (
                <PatternCard
                  key={pattern.uuid}
                  pattern={pattern}
                  defaultExpanded={index === 0}
                />
              ))}
            </div>
          </DetailSection>
        )}
      </div>

      {/* Actions */}
      <div className='aucctus-border-primary aucctus-bg-secondary flex items-center gap-3 border-t p-4'>
        <button
          onClick={() => onToggleTracking?.(insight.uuid, !insight.isTracked)}
          disabled={isUpdatingTracking}
          className={cn(
            'flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all',
            insight.isTracked
              ? 'aucctus-border-warning-subtle aucctus-bg-warning-primary aucctus-text-warning-primary'
              : 'aucctus-border-primary aucctus-text-primary aucctus-bg-secondary-hover',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          {isUpdatingTracking ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <Star
              className={cn('h-4 w-4', insight.isTracked && 'fill-current')}
            />
          )}
          {insight.isTracked ? 'Tracked' : 'Track'}
        </button>
      </div>
    </div>
  );
};

export default InsightDetailPanel;
