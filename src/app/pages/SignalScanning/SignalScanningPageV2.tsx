/**
 * Strategic Signal Radar - Executive View (V2)
 *
 * CEO Vision Implementation:
 * - Early warning system for executives, not analyst dashboard
 * - Threat/Opportunity/Watch classification tabs
 * - Constellation radar visualization
 * - Insight-centric detail panel with "What changed? Why it matters? Impact?"
 * - Connected to pipeline (Aucctus concepts)
 * - Reviewable in minutes by senior leaders
 */

import {
  FunctionComponent,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Hooks
import {
  useStrategicForesightDashboard,
  useStrategicInsight,
  useToggleInsightTracking,
} from '@hooks/query/strategicForesight.hook';
import useStore from '@stores/store';
import { useModal } from '@context/ModalContextProvider';
import AiEditing from '@components/Modal/AiEditingModal/AiEditingModal';

// Routes
import { AppPath } from '@routes/routes';

// Components
import {
  ThreatOpportunityTabs,
  ExecutiveBrief,
  ConstellationRadar,
  ActiveInsightsList,
  InsightDetailPanel,
} from './components';
import { Badge, ComponentTooltip, Header, Icon } from '@components';

// Types
import type {
  InsightClassification,
  IRadarBlip,
  IStrategicInsight,
} from '@libs/api/types/strategicForesight';

// Styles
import styles from './signal-scanning.module.scss';

// ============================================
// Header Component
// ============================================
interface PageHeaderProps {
  lastUpdated?: string;
}

const PageHeader: FunctionComponent<PageHeaderProps> = ({ lastUpdated }) => {
  const formatLastUpdated = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60),
    );
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className='mb-6'>
      <div className='flex items-center gap-3'>
        <div className='flex items-center gap-2'>
          <Icon
            variant='signal-02'
            height={28}
            width={28}
            className='aucctus-stroke-brand-primary'
          />
          <Header.One text='Strategic Signal Radar' />
        </div>
        <ComponentTooltip
          tip={
            <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border px-3 py-2 shadow-lg'>
              <p className='aucctus-text-primary aucctus-text-xs max-w-[200px]'>
                This is an early feature and may make mistakes.
              </p>
            </div>
          }
        >
          <Badge.Beta size='sm' />
        </ComponentTooltip>
        <span className='aucctus-text-tertiary aucctus-text-xs ml-2'>
          Last scan: {formatLastUpdated(lastUpdated)}
        </span>
      </div>
      <p className='aucctus-text-md aucctus-text-secondary mt-1'>
        Monitor{' '}
        <span className='aucctus-text-brand-primary font-semibold'>
          threats
        </span>
        ,{' '}
        <span className='aucctus-text-brand-primary font-semibold'>
          opportunities
        </span>
        , and{' '}
        <span className='aucctus-text-brand-primary font-semibold'>
          market signals
        </span>{' '}
        across your strategic landscape.
      </p>
    </div>
  );
};

// ============================================
// Main Page Component
// ============================================
const SignalScanningPageV2: FunctionComponent = () => {
  const navigate = useNavigate();
  const { openModal } = useModal();

  // Store access for prepopulating anchor thought
  const setPrepopulatedAnchorThought = useStore(
    (state) => state.ideaPlayground.setPrepopulatedAnchorThought,
  );
  const setPrepopulatedEditMessage = useStore(
    (state) => state.aiEditing.setPrepopulatedEditMessage,
  );

  // State
  const [selectedClassification, setSelectedClassification] = useState<
    InsightClassification | 'all'
  >('all');
  const [selectedInsightUuid, setSelectedInsightUuid] = useState<string | null>(
    null,
  );
  const [showInactiveSignals, setShowInactiveSignals] = useState(false);

  // Queries
  const {
    executiveBrief,
    insights,
    radarBlips,
    lastRefreshedAt,
    isLoading: isDashboardLoading,
  } = useStrategicForesightDashboard();

  const { insight: selectedInsight, isLoading: isInsightLoading } =
    useStrategicInsight(selectedInsightUuid);

  // Mutations
  const { toggleTracking, isUpdating: isUpdatingTracking } =
    useToggleInsightTracking();

  // Helper to check if an insight is active (needs attention)
  const isActiveInsight = (insight: IStrategicInsight) =>
    insight.status === 'active';
  const isActiveBlip = (blip: IRadarBlip, allInsights: IStrategicInsight[]) => {
    const insight = allInsights.find((i) => i.uuid === blip.insightUuid);
    return insight ? insight.status === 'active' : true;
  };

  // Filtered data based on classification
  const classificationFilteredInsights = useMemo(() => {
    if (selectedClassification === 'all') return insights;
    return insights.filter(
      (i: IStrategicInsight) => i.classification === selectedClassification,
    );
  }, [insights, selectedClassification]);

  const classificationFilteredBlips = useMemo(() => {
    if (selectedClassification === 'all') return radarBlips;
    return radarBlips.filter(
      (b: IRadarBlip) => b.classification === selectedClassification,
    );
  }, [radarBlips, selectedClassification]);

  // Split into active and inactive
  const activeInsights = useMemo(
    () => classificationFilteredInsights.filter(isActiveInsight),
    [classificationFilteredInsights],
  );

  const inactiveInsights = useMemo(
    () => classificationFilteredInsights.filter((i) => !isActiveInsight(i)),
    [classificationFilteredInsights],
  );

  const activeBlips = useMemo(
    () => classificationFilteredBlips.filter((b) => isActiveBlip(b, insights)),
    [classificationFilteredBlips, insights],
  );

  const inactiveBlips = useMemo(
    () => classificationFilteredBlips.filter((b) => !isActiveBlip(b, insights)),
    [classificationFilteredBlips, insights],
  );

  // Classification counts for tabs (count only active insights)
  const classificationCounts = useMemo(() => {
    const activeOnly = insights.filter(isActiveInsight);
    return {
      threats: activeOnly.filter(
        (i: IStrategicInsight) => i.classification === 'threat',
      ).length,
      opportunities: activeOnly.filter(
        (i: IStrategicInsight) => i.classification === 'opportunity',
      ).length,
      watch: activeOnly.filter(
        (i: IStrategicInsight) => i.classification === 'watch',
      ).length,
    };
  }, [insights]);

  // Auto-select first active insight when filter changes
  useEffect(() => {
    if (activeInsights.length > 0 && !selectedInsightUuid) {
      setSelectedInsightUuid(activeInsights[0].uuid);
    }
  }, [activeInsights, selectedInsightUuid]);

  // Handlers
  const handleBlipSelect = (blip: IRadarBlip) => {
    setSelectedInsightUuid(blip.insightUuid);
  };

  const handleInsightSelect = (uuid: string) => {
    setSelectedInsightUuid(uuid);
  };

  const handleBriefInsightClick = (uuid: string) => {
    setSelectedInsightUuid(uuid);
    // Find the insight classification and switch to that tab
    const insight = insights.find((i: IStrategicInsight) => i.uuid === uuid);
    if (insight) {
      setSelectedClassification(insight.classification);
    }
  };

  const handleConceptClick = (conceptUuid: string) => {
    navigate(`/concept/${conceptUuid}`);
  };

  const handleToggleInactiveSignals = () => {
    setShowInactiveSignals(!showInactiveSignals);
  };

  const handleToggleTracking = (insightUuid: string, isTracked: boolean) => {
    toggleTracking({ insightUuid, isTracked });
  };

  // Handle net_new action - navigate to playground with prepopulated anchor thought
  const handleNetNewAction = useCallback(
    (actionDetails: string) => {
      // Set the prepopulated anchor thought in the store
      setPrepopulatedAnchorThought(actionDetails);
      // Navigate to the playground
      navigate(AppPath.IdeaPlayground);
    },
    [setPrepopulatedAnchorThought, navigate],
  );

  // Handle modify action - navigate to concept and open AI editing modal
  const handleModifyAction = useCallback(
    (conceptIdentifier: string, actionDetails: string) => {
      // Pre-fill the AI editing message (will be consumed by AiEditingCard on mount)
      setPrepopulatedEditMessage(actionDetails);
      // Navigate to the concept page
      navigate(`/concept/${conceptIdentifier}`);
      // Open the AI editing modal after a short delay to allow navigation to complete
      setTimeout(() => {
        openModal(
          AiEditing,
          {},
          {
            position: 'right',
            modalClassName: 'max-h-[90vh]',
            hideBodyScroll: true,
            shouldCloseOnOverlayClick: true,
            shouldCloseOnEscape: true,
          },
        );
      }, 300);
    },
    [setPrepopulatedEditMessage, navigate, openModal],
  );

  return (
    <div className={styles.signalScanningPage}>
      {/* Header */}
      <PageHeader lastUpdated={lastRefreshedAt} />

      <div className='space-y-5'>
        {/* Executive Brief - Top priority for executives */}
        <ExecutiveBrief
          brief={executiveBrief}
          isLoading={isDashboardLoading}
          onInsightClick={handleBriefInsightClick}
        />

        {/* Classification Tabs - Below the brief */}
        <ThreatOpportunityTabs
          selected={selectedClassification}
          onSelect={setSelectedClassification}
          counts={classificationCounts}
        />

        {/* Main Content: Radar + Detail Panel */}
        <div className='grid gap-5 lg:grid-cols-5'>
          {/* Left: Radar + Active Signals */}
          <div className='space-y-4 lg:col-span-2'>
            {/* Constellation Radar */}
            <div className='aucctus-bg-primary aucctus-border-primary overflow-hidden rounded-xl border'>
              {isDashboardLoading ? (
                <div className='flex h-[420px] items-center justify-center'>
                  <Loader2 className='aucctus-text-brand-primary h-8 w-8 animate-spin' />
                </div>
              ) : activeBlips.length === 0 &&
                (!showInactiveSignals || inactiveBlips.length === 0) ? (
                <div className='flex h-[420px] flex-col items-center justify-center p-6 text-center'>
                  <Icon
                    variant='signal-02'
                    className='aucctus-stroke-tertiary mb-3 h-12 w-12 opacity-40'
                  />
                  <p className='aucctus-text-tertiary text-sm'>
                    No signals match the current filter
                  </p>
                </div>
              ) : (
                <div className='p-4'>
                  <ConstellationRadar
                    blips={activeBlips}
                    inactiveBlips={showInactiveSignals ? inactiveBlips : []}
                    selectedBlipUuid={
                      selectedInsightUuid
                        ? `blip-insight-${selectedInsightUuid}`
                        : null
                    }
                    onBlipSelect={handleBlipSelect}
                    filterClassification={selectedClassification}
                  />
                </div>
              )}
            </div>

            {/* Active Signals List - Grouped by priority for corporate innovation workflow */}
            <ActiveInsightsList
              insights={activeInsights}
              selectedInsightUuid={selectedInsightUuid}
              onInsightSelect={handleInsightSelect}
              filterClassification={selectedClassification}
              maxItems={20}
              collapsible
              defaultExpanded
              groupByPriority
              // Toggle for inactive signals
              showInactiveToggle={inactiveInsights.length > 0}
              showInactiveSignals={showInactiveSignals}
              onToggleInactiveSignals={handleToggleInactiveSignals}
              inactiveCount={inactiveInsights.length}
            />

            {/* Older/Inactive Signals List */}
            {showInactiveSignals && inactiveInsights.length > 0 && (
              <ActiveInsightsList
                insights={inactiveInsights}
                selectedInsightUuid={selectedInsightUuid}
                onInsightSelect={handleInsightSelect}
                filterClassification={selectedClassification}
                maxItems={10}
                collapsible
                defaultExpanded={false}
                title='Older Signals'
                isInactiveList
              />
            )}
          </div>

          {/* Right: Insight Detail Panel */}
          <div className='lg:col-span-3'>
            <InsightDetailPanel
              insight={selectedInsight}
              isLoading={isInsightLoading}
              onToggleTracking={handleToggleTracking}
              onConceptClick={handleConceptClick}
              onNetNewAction={handleNetNewAction}
              onModifyAction={handleModifyAction}
              isUpdatingTracking={isUpdatingTracking}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignalScanningPageV2;
