import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useQueryClient } from 'react-query';
import {
  useNucleusReportLatestProgress,
  useNucleusReportEmailWhenReady,
} from '@hooks/query/nucleus.hook';
import { useSocketEvent } from '@hooks/sockets/aucctus';
import type { INucleusReportProgressMessage } from '@libs/api/types/socketMessages/inbound';
import { AucctusQueryKeys } from '@hooks/query/query-keys';
import useStore from '@stores/store';
import telemetry from '@libs/telemetry';

const SECTION_TO_CATEGORY_MAP = {
  basicProfile: {
    id: 'company-identity',
    name: 'Company Identity & Value Proposition',
    shortName: 'Identity',
  },
  geographic: {
    id: 'geographic-footprint',
    name: 'Geographic Footprint & Market Presence',
    shortName: 'Geography',
  },
  strategic: {
    id: 'corporate-strategy',
    name: 'Corporate Strategy & Strategic Priorities',
    shortName: 'Strategy',
  },
  productsServices: {
    id: 'offerings',
    name: 'Offerings & Business Units',
    shortName: 'Offering',
  },
  ecosystem: {
    id: 'ecosystem',
    name: 'Ecosystem & Partnerships',
    shortName: 'Ecosystem',
  },
  technology: {
    id: 'innovation',
    name: 'Innovation Capability & Risk Profile',
    shortName: 'Innovation',
  },
  organizational: {
    id: 'customers',
    name: 'Customers & Market Insights',
    shortName: 'Customer',
  },
  brandCommunications: {
    id: 'brand',
    name: 'Brand & Reputation',
    shortName: 'Brand',
  },
  talentCulture: {
    id: 'operating-model',
    name: 'Operating Model & Core Capabilities',
    shortName: 'Operations',
  },
  financial: {
    id: 'financial',
    name: 'Financial Performance & Resource Allocation',
    shortName: 'Financials',
  },
} as const;

export interface CategoryProgress {
  id: string;
  name: string;
  shortName: string;
  progress: number;
}

interface LiveAnswer {
  id: string;
  content: string;
  source: string;
}

interface NucleusSectionProgress {
  totalQuestions: number;
  questionsWithAnswers: number;
  questionsValidated: number;
  progressPercent: number;
  currentPhase: string;
  phase1Complete: boolean;
  phase2Complete: boolean;
  phase3Complete: boolean;
  estimatedTotalSeconds: number;
}

type SectionProgressEntries = [string, NucleusSectionProgress][];

interface UseNucleusLoadingStateReturn {
  companyName: string;
  remainingSeconds: number;
  liveAnswers: LiveAnswer[];
  categoryProgress: CategoryProgress[];
  centerCard: number;
  previousCenterCard: number | null;
  leftCards: number[];
  rightCards: number[];
  nextDirection: 'left' | 'right';
  exitDirection: 'left' | 'right';
  isNotified: boolean;
  isEmailLoading: boolean;
  handleEmailNotification: () => void;
  nucleusReportProgress: any;
}

export const useNucleusLoadingState = (): UseNucleusLoadingStateReturn => {
  const queryClient = useQueryClient();

  // Get initial data from REST API (no polling - websockets will update)
  const { nucleusReportProgress: initialProgress } =
    useNucleusReportLatestProgress();

  // Local state to hold the latest progress (updated via websockets)
  const [nucleusReportProgress, setNucleusReportProgress] =
    useState<any>(initialProgress);

  const {
    emailWhenReady,
    isLoading: isEmailLoading,
    isSuccess: isEmailSuccess,
  } = useNucleusReportEmailWhenReady();
  const account = useStore((state) => state.auth.account);
  const companyName = account?.name || 'Your Company';

  // Track if we've received websocket data to prevent API data from overwriting it
  const hasReceivedWebsocketData = useRef(false);

  // Update local state when initial data loads, but ONLY if we haven't received websocket data yet
  // This ensures API data is used on mount, but websocket data takes precedence after that
  useEffect(() => {
    if (initialProgress && !hasReceivedWebsocketData.current) {
      telemetry.debug(
        'useNucleusLoadingState',
        '📡 Using API data (no websocket data yet)',
        {
          reportUuid: initialProgress.reportUuid,
          sections: Object.keys(initialProgress.sections || {}),
          recentAnswersCount: initialProgress.recentAnswers?.length || 0,
          overallProgress: initialProgress.overallProgressPercent,
        },
      );
      setNucleusReportProgress(initialProgress);
    } else if (initialProgress && hasReceivedWebsocketData.current) {
      telemetry.debug(
        'useNucleusLoadingState',
        '⏭️  Ignoring API data (websocket data takes precedence)',
      );
    }
  }, [initialProgress]);

  // Update local state when email notification is successfully enabled
  useEffect(() => {
    if (isEmailSuccess) {
      setNucleusReportProgress((prev: any) => ({
        ...prev,
        emailWhenReadyEnabled: true,
      }));
    }
  }, [isEmailSuccess]);

  // Listen for websocket progress updates and use the payload directly
  useSocketEvent<
    'nucleus_report.progress.account',
    INucleusReportProgressMessage
  >('nucleus_report.progress.account', (message) => {
    telemetry.debug('useNucleusLoadingState', '🚀 WEBSOCKET EVENT RECEIVED!', {
      eventType: 'nucleus_report.progress.account',
      reportUuid: message.nucleusReportUuid,
      accountUuid: message.accountUuid,
      overallProgress: message.overallProgressPercent,
      totalSections: message.totalSections,
      phase1Complete: message.sectionsPhase1Complete,
      phase2Complete: message.sectionsPhase2Complete,
      phase3Complete: message.sectionsPhase3Complete,
      recentAnswersCount: message.recentAnswers?.length || 0,
      sectionsInMessage: Object.keys(message.sections || {}),
      hasVideoUrl: !!message.headquartersVideoUrl,
      emailEnabled: message.emailWhenReadyEnabled,
    });

    // Mark that we've received websocket data - this prevents API data from overwriting it
    hasReceivedWebsocketData.current = true;

    // Transform websocket message to match the expected format
    const progressData = {
      reportUuid: message.nucleusReportUuid,
      emailWhenReadyEnabled:
        message.emailWhenReadyEnabled ??
        nucleusReportProgress?.emailWhenReadyEnabled ??
        false,
      totalSections: message.totalSections,
      sectionsPhase1Complete: message.sectionsPhase1Complete,
      sectionsPhase2Complete: message.sectionsPhase2Complete,
      sectionsPhase3Complete: message.sectionsPhase3Complete,
      overallProgressPercent: message.overallProgressPercent,
      totalQuestions: message.totalQuestions,
      totalQuestionsWithAnswers: message.totalQuestionsWithAnswers,
      totalQuestionsValidated: message.totalQuestionsValidated,
      estimatedTotalSeconds: message.estimatedTotalSeconds,
      startTime: message.startTime,
      sections: message.sections,
      recentAnswers: message.recentAnswers || [],
      headquartersVideoUrl: message.headquartersVideoUrl,
    };

    telemetry.debug(
      'useNucleusLoadingState',
      '✅ Updating component state with websocket data',
      {
        sectionsCount: Object.keys(progressData.sections || {}).length,
        answersCount: progressData.recentAnswers.length,
      },
    );

    // Update local state to trigger component re-render with new data
    // From this point forward, ALL component data (CategoryProgress, liveAnswers, etc.)
    // comes from websocket events, not API refetches
    setNucleusReportProgress(progressData);

    // Check if all sections are at 100% - if so, invalidate nucleus report to refetch
    // This will cause processingStatus to update from 'processing' to 'completed'
    // which switches the view from NucleusLoadingState to regular NucleusPage
    const sections = progressData.sections || {};
    const sectionEntries: SectionProgressEntries = Object.entries(sections);

    telemetry.debug(
      'useNucleusLoadingState',
      '🔍 Checking section completion status',
      {
        totalSections: sectionEntries.length,
        sections: sectionEntries.map(([key, section]) => ({
          sectionType: key,
          progressPercent: section.progressPercent,
          phase1Complete: section.phase1Complete,
          phase2Complete: section.phase2Complete,
          phase3Complete: section.phase3Complete,
        })),
        overallProgress: progressData.overallProgressPercent,
      },
    );

    // Check that we have sections and all of them are at 100%
    // Destructure the tuple [sectionKey, sectionData] and check progressPercent
    const allSectionsComplete =
      sectionEntries.length > 0 &&
      sectionEntries.every(([, section]) => section.progressPercent >= 100);

    telemetry.debug(
      'useNucleusLoadingState',
      '✔️ All sections complete check',
      {
        allSectionsComplete,
        sectionCount: sectionEntries.length,
      },
    );

    if (allSectionsComplete) {
      telemetry.log(
        'useNucleusLoadingState',
        '🎉 ALL SECTIONS COMPLETE! Invalidating nucleus report queries',
        {
          overallProgress: progressData.overallProgressPercent,
          phase3Complete: progressData.sectionsPhase3Complete,
          totalSections: progressData.totalSections,
        },
      );

      // Invalidate all nucleus report queries to trigger refetch
      // This will get the updated processingStatus === 'completed' and switch views
      queryClient.invalidateQueries([AucctusQueryKeys.nucleusReportLatest]);
      queryClient.invalidateQueries([AucctusQueryKeys.nucleusReportsList]);

      telemetry.debug(
        'useNucleusLoadingState',
        '🔄 Nucleus report queries invalidated',
      );

      // Also manually refetch the queries to ensure they update immediately
      // This forces an active refetch even if the query is considered fresh
      queryClient
        .refetchQueries([AucctusQueryKeys.nucleusReportLatest])
        .then(() => {
          telemetry.debug(
            'useNucleusLoadingState',
            '✅ Manual refetch completed',
          );

          // Log the current state of the query cache
          const cachedData = queryClient.getQueryData([
            AucctusQueryKeys.nucleusReportLatest,
          ]);
          telemetry.log(
            'useNucleusLoadingState',
            '📦 Cached nucleus report after refetch',
            {
              processingStatus: (cachedData as any)?.processingStatus,
              uuid: (cachedData as any)?.uuid,
              hasData: !!cachedData,
            },
          );
        })
        .catch((error) => {
          telemetry.error('useNucleusLoadingState', '❌ Refetch failed', error);
        });
    }
  });

  // Countdown timer state
  const [remainingSeconds, setRemainingSeconds] = useState(() => {
    if (
      !nucleusReportProgress?.startTime ||
      !nucleusReportProgress?.estimatedTotalSeconds
    ) {
      return 80 * 60; // Default 80 minutes
    }
    const currentTime = Date.now() / 1000;
    const elapsedSeconds = Math.max(
      0,
      currentTime - nucleusReportProgress.startTime,
    );
    const remaining = Math.max(
      0,
      nucleusReportProgress.estimatedTotalSeconds - elapsedSeconds,
    );
    return Math.ceil(remaining);
  });

  // Initialize/reset countdown when estimatedTotalSeconds or startTime changes
  useEffect(() => {
    if (
      !nucleusReportProgress?.startTime ||
      !nucleusReportProgress?.estimatedTotalSeconds
    ) {
      setRemainingSeconds(80 * 60);
      return;
    }
    const currentTime = Date.now() / 1000;
    const elapsedSeconds = Math.max(
      0,
      currentTime - nucleusReportProgress.startTime,
    );
    const remaining = Math.max(
      0,
      nucleusReportProgress.estimatedTotalSeconds - elapsedSeconds,
    );
    setRemainingSeconds(Math.ceil(remaining));
  }, [
    nucleusReportProgress?.estimatedTotalSeconds,
    nucleusReportProgress?.startTime,
  ]);

  const liveAnswers = useMemo(() => {
    if (!nucleusReportProgress?.recentAnswers?.length) {
      telemetry.log(
        'useNucleusLoadingState',
        '📋 liveAnswers: No recent answers available',
      );
      return [];
    }

    const answers = nucleusReportProgress?.recentAnswers?.map((answer: any) => {
      // Convert snake_case to camelCase for map lookup
      const sectionKey = answer.sectionType
        .split('_')
        .reduce((acc: string, word: string, index: number) => {
          if (index === 0) return word;
          return acc + word.charAt(0).toUpperCase() + word.slice(1);
        }, '');

      return {
        id: answer.questionUuid,
        content: answer.answerText ?? '',
        source:
          SECTION_TO_CATEGORY_MAP[
            sectionKey as keyof typeof SECTION_TO_CATEGORY_MAP
          ]?.shortName ?? '',
      };
    });

    telemetry.log('useNucleusLoadingState', '📋 liveAnswers RECALCULATED', {
      count: answers.length,
      sources: answers.map((a: LiveAnswer) => a.source).filter(Boolean),
    });

    return answers;
  }, [nucleusReportProgress]);

  // Countdown effect - decrement every second
  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const categoryProgress = useMemo(() => {
    if (!nucleusReportProgress?.sections) {
      telemetry.log(
        'useNucleusLoadingState',
        '📊 categoryProgress: No sections available',
      );
      return [];
    }

    const categories = Object.entries(nucleusReportProgress.sections).map(
      ([sectionKey, sectionData]: [string, any]) => {
        const categoryInfo =
          SECTION_TO_CATEGORY_MAP[
            sectionKey as keyof typeof SECTION_TO_CATEGORY_MAP
          ];

        return {
          ...categoryInfo,
          progress: Math.max(
            0,
            Math.min(100, sectionData?.progressPercent ?? 0),
          ),
        };
      },
    ) as CategoryProgress[];

    telemetry.log(
      'useNucleusLoadingState',
      '📊 categoryProgress RECALCULATED',
      {
        count: categories.length,
        categories: categories.map((c: CategoryProgress) => ({
          name: c.shortName,
          progress: c.progress,
        })),
      },
    );

    return categories;
  }, [nucleusReportProgress?.sections]);

  // Card animation state - track cards at each position (2 cards per side)
  const [centerCard, setCenterCard] = useState(0);
  const [previousCenterCard, setPreviousCenterCard] = useState<number | null>(
    null,
  );
  const [leftCards, setLeftCards] = useState<number[]>([]);
  const [rightCards, setRightCards] = useState<number[]>([]);
  const [nextDirection, setNextDirection] = useState<'left' | 'right'>('left');
  const [exitDirection, setExitDirection] = useState<'left' | 'right'>('left');

  // Initialize cards when liveAnswers loads
  useEffect(() => {
    if (!liveAnswers || liveAnswers.length === 0) {
      setCenterCard(0);
      setLeftCards([]);
      setRightCards([]);
      return;
    }

    // Initialize with proper indices if we have answers
    if (liveAnswers.length >= 2) {
      setLeftCards([(liveAnswers.length - 1) % liveAnswers.length]);
      setRightCards([1 % liveAnswers.length]);
    } else if (liveAnswers.length === 1) {
      setLeftCards([]);
      setRightCards([]);
    }
  }, [liveAnswers]);

  // Card shuffle effect - cycle through cards every 3 seconds, alternating direction
  useEffect(() => {
    if (!liveAnswers || liveAnswers.length === 0) {
      return;
    }

    const interval = setInterval(() => {
      setCenterCard((prev) => {
        const next = (prev + 1) % liveAnswers.length;

        // Set the previous card for exit animation
        setPreviousCenterCard(prev);
        setExitDirection(nextDirection);

        // Move current center card to left or right stack (after a delay to let animation complete)
        setTimeout(() => {
          if (nextDirection === 'left') {
            setLeftCards((prevCards) => {
              const newCards = [prev, ...prevCards];
              return newCards.slice(0, 2);
            });
          } else {
            setRightCards((prevCards) => {
              const newCards = [prev, ...prevCards];
              return newCards.slice(0, 2);
            });
          }
          setPreviousCenterCard(null);
        }, 400); // Match the exit animation duration

        // Toggle direction for next shuffle
        setNextDirection(nextDirection === 'left' ? 'right' : 'left');

        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [nextDirection, liveAnswers]);

  const isNotified = nucleusReportProgress?.emailWhenReadyEnabled ?? false;

  const handleEmailNotification = useCallback(() => {
    // Only enable notification if not already enabled
    if (!isNotified && nucleusReportProgress?.reportUuid) {
      emailWhenReady(nucleusReportProgress.reportUuid);
    }
  }, [isNotified, nucleusReportProgress?.reportUuid, emailWhenReady]);

  return {
    companyName,
    remainingSeconds,
    liveAnswers,
    categoryProgress,
    centerCard,
    previousCenterCard,
    leftCards,
    rightCards,
    nextDirection,
    exitDirection,
    isNotified,
    isEmailLoading,
    handleEmailNotification,
    nucleusReportProgress,
  };
};
