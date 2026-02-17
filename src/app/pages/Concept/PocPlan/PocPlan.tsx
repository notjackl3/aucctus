import { FunctionComponent, useMemo, useState, useCallback } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Loading, toast } from '@components';
import { useConcept } from '@hooks/query/concepts.hook';
import { usePocPlan } from '@hooks/query/pocPlan.hook';
import { cn } from '@libs/utils/react';

// Section Components
import MilestonesSection from './components/MilestonesSection';
import ResourcesSection from './components/ResourcesSection';
import RisksSection from './components/RisksSection';
import SuccessMetricsSection from './components/SuccessMetricsSection';
import TimelineSection from './components/TimelineSection';
import PocPlanHeader from './components/PocPlanHeader';
import ExecutiveBrief from './components/ExecutiveBrief';
import FinancialProjectionsSection from './components/FinancialProjectionsSection';
import { AlertCircle } from 'lucide-react';
import { DynamicIcon } from '@libs/utils/iconMap';

// 5 focused tabs for executive clarity
type PocTab = 'dashboard' | 'execution' | 'metrics' | 'resources' | 'risks';

interface ITabConfig {
  id: PocTab;
  label: string;
  icon: string;
  description: string;
}

const TABS: ITabConfig[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'presentation-chart',
    description: 'Executive summary & decision criteria',
  },
  {
    id: 'execution',
    label: 'Execution',
    icon: 'calendar',
    description: 'Timeline & milestones',
  },
  {
    id: 'metrics',
    label: 'Metrics',
    icon: 'barchart',
    description: 'Success criteria',
  },
  {
    id: 'resources',
    label: 'Resources',
    icon: 'currency-dollar',
    description: 'Budget & team',
  },
  {
    id: 'risks',
    label: 'Risks',
    icon: 'alert-triangle',
    description: 'Risk assessment',
  },
];

const PocPlan: FunctionComponent = () => {
  const { id: conceptIdentifier } = useParams();
  const { concept, isLoading: isConceptLoading } =
    useConcept(conceptIdentifier);
  const {
    pocPlan,
    hasPocPlan,
    isLoading: isPocPlanLoading,
  } = usePocPlan(concept?.uuid);
  const [activeTab, setActiveTab] = useState<PocTab>('dashboard');

  const isLoading = isConceptLoading || isPocPlanLoading;

  // Export to PDF handler (simple print-based export)
  const handleExportPDF = useCallback(() => {
    toast.info('Preparing PDF export...');
    setTimeout(() => {
      window.print();
      toast.success(
        "PDF export initiated. Use your browser's print dialog to save as PDF.",
      );
    }, 500);
  }, []);

  // Redirect to concept report if concept is not in POC status
  // Only redirect AFTER loading is complete to avoid race conditions
  const shouldRedirect = useMemo(() => {
    // Don't redirect while data is still loading
    if (isLoading) return false;
    return concept && concept.status !== 'proofOfConcept' && !hasPocPlan;
  }, [concept, hasPocPlan, isLoading]);

  // Show loading state first, before any redirect logic
  if (isLoading) {
    return (
      <div className='flex h-full min-h-[60vh] w-full items-center justify-center'>
        <Loading />
      </div>
    );
  }

  if (shouldRedirect && conceptIdentifier) {
    return <Navigate to={`/concept/${conceptIdentifier}/`} replace />;
  }

  if (!concept || !pocPlan) {
    return (
      <div className='flex h-full min-h-[60vh] w-full flex-col items-center justify-center gap-4'>
        <AlertCircle className='aucctus-stroke-tertiary h-12 w-12' />
        <p className='aucctus-text-secondary aucctus-text-lg'>
          POC Plan not found
        </p>
      </div>
    );
  }

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        // Dashboard: Executive Brief only (true one-pager for 30-second executive scan)
        return (
          <ExecutiveBrief pocPlan={pocPlan} onExportPDF={handleExportPDF} />
        );
      case 'execution':
        // Execution: Timeline + Milestones
        return (
          <div className='flex flex-col gap-6'>
            <TimelineSection
              phases={pocPlan.timelinePhases ?? []}
              milestones={pocPlan.milestones ?? []}
              totalWeeks={pocPlan.totalWeeks ?? 0}
            />
            <MilestonesSection milestones={pocPlan.milestones ?? []} />
          </div>
        );
      case 'metrics':
        // Metrics: Success metrics
        return <SuccessMetricsSection metrics={pocPlan.successMetrics ?? []} />;
      case 'resources':
        // Resources: Budget and team
        return (
          <div className='flex flex-col gap-6'>
            <ResourcesSection resources={pocPlan.resources ?? []} />
            <FinancialProjectionsSection pocPlan={pocPlan} />
          </div>
        );
      case 'risks':
        // Risks: Risk assessment
        return <RisksSection risks={pocPlan.risks ?? []} />;
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        'flex min-h-full w-full flex-col gap-6 p-8',
        'animate-fade-in',
      )}
    >
      {/* Header */}
      <PocPlanHeader concept={concept} pocPlan={pocPlan} />

      {/* Tab Navigation with Status Badges */}
      <div className='aucctus-bg-secondary flex items-center gap-1 rounded-lg p-1.5'>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;

          // Calculate informational badges for each tab (no tracking data)
          const getTabBadge = () => {
            switch (tab.id) {
              case 'dashboard':
                // No badge for dashboard - it's the summary view
                return null;
              case 'execution': {
                // Show total milestones count (informational, not progress)
                const total = pocPlan.milestones?.length ?? 0;
                return (
                  <span className='aucctus-bg-tertiary aucctus-text-secondary ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold'>
                    {total}
                  </span>
                );
              }
              case 'metrics': {
                // Go/No-Go metrics count (informational)
                const goNoGoCount =
                  pocPlan.successMetrics?.filter((m) => m.isGoNoGoCriteria)
                    .length ?? 0;
                return (
                  <span className='ml-1 rounded-full bg-primary-100 px-1.5 py-0.5 text-[10px] font-semibold text-primary-700 dark:bg-primary-900 dark:text-primary-300'>
                    {goNoGoCount}
                  </span>
                );
              }
              case 'resources': {
                // Total investment (informational)
                const totalInvestment =
                  pocPlan.resources?.reduce(
                    (sum, r) => sum + (r.estimatedCost || 0),
                    0,
                  ) ?? 0;
                const formatted =
                  totalInvestment >= 1000000
                    ? `$${(totalInvestment / 1000000).toFixed(1)}M`
                    : totalInvestment >= 1000
                      ? `$${(totalInvestment / 1000).toFixed(0)}K`
                      : `$${totalInvestment}`;
                return (
                  <span className='ml-1 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'>
                    {formatted}
                  </span>
                );
              }
              case 'risks': {
                // Critical/High risk count (informational)
                const riskCount =
                  pocPlan.risks?.filter(
                    (r) => r.severity === 'critical' || r.severity === 'high',
                  ).length ?? 0;
                if (riskCount === 0) return null;
                return (
                  <span className='ml-1 rounded-full bg-error-100 px-1.5 py-0.5 text-[10px] font-semibold text-error-700 dark:bg-error-900 dark:text-error-300'>
                    {riskCount}
                  </span>
                );
              }
              default:
                return null;
            }
          };

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5',
                'transition-all duration-200',
                'aucctus-text-sm-medium',
                isActive
                  ? 'aucctus-bg-primary aucctus-text-brand-primary shadow-sm'
                  : 'aucctus-text-secondary hover:aucctus-text-primary hover:aucctus-bg-tertiary',
              )}
            >
              <DynamicIcon
                variant={tab.icon}
                className={cn(
                  'h-4 w-4',
                  isActive
                    ? 'aucctus-stroke-brand-primary'
                    : 'aucctus-stroke-tertiary',
                )}
              />
              {tab.label}
              {getTabBadge()}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className='flex-1 animate-fade-in' key={activeTab}>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default PocPlan;
