import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@components';
import { useSocketEvent } from '../aucctus';
import { AppPath } from '@routes/routes';
import { useQueryClient } from 'react-query';
import { AucctusQueryKeys } from '../../query/query-keys';
import useStore from '@stores/store';
import telemetry from '@libs/telemetry';
import type { ProgressToastPayload } from '@components/Notification/toast';
import {
  createStageMessage,
  getFallbackEstimateForAgent,
  stageKeyFromMessage,
  CONCEPT_REPORT_STAGE_ORDER,
  type ConceptReportStageKey,
} from '../../../utils/conceptReportHelpers';
import type {
  IConcept,
  IConceptWorkflowMessage,
  ConceptReportStatusBySection,
  ConceptReportStatus,
} from '@libs/api/types';
import { normalizeReportSectionKey } from '@libs/utils/concepts';
import {
  getToastRecordForKeys,
  getToastKeysFromMessage,
  registerToastRecordKeys,
  clearToastRecord,
} from './toast-utils';

const normalizeStatusMap = (
  statusMap?: ConceptReportStatusBySection,
): ConceptReportStatusBySection | undefined => {
  if (!statusMap) return undefined;
  const normalized: Record<string, ConceptReportStatusBySection[string]> = {};

  Object.entries(statusMap).forEach(([sectionKey, sectionStatus]) => {
    const normalizedKey = normalizeReportSectionKey(sectionKey);
    if (!normalizedKey) return;
    normalized[normalizedKey] = sectionStatus;
  });

  return normalized as ConceptReportStatusBySection;
};

const mergeReportStatusBySection = (
  existing?: ConceptReportStatusBySection,
  incoming?: ConceptReportStatusBySection,
): ConceptReportStatusBySection | undefined => {
  if (!incoming) return existing;
  return {
    ...(existing || {}),
    ...incoming,
  };
};

export const useConceptWorkflowHandler = (
  preventDuplicate: (key: string) => boolean,
) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addPendingSections = useStore(
    (state) => state.conceptReport.addPendingSections,
  );
  const clearPendingSections = useStore(
    (state) => state.conceptReport.clearPendingSections,
  );
  const activeConceptUuid = useStore(
    (state) => state.conceptReport.conceptUuid,
  );

  const resolveStageKey = (
    message: IConceptWorkflowMessage,
  ): ConceptReportStageKey | undefined => {
    const reportStatusBySection =
      message.reportStatusBySection ||
      (message as any).report_status_by_section;

    if (message.eventType === 'workflow_completed') return 'overview';

    if (message.agentName) {
      const agentToStage: Record<string, ConceptReportStageKey> = {
        MarketScanPipeline: 'marketScan',
        MarketScanEcosystemPipeline: 'ecosystem',
        TrendsPipeline: 'trends',
        ConceptOverviewPipeline: 'overview',
        CustomerProfilePipeline: 'customerProfiles',
        FinancialProjectionPipeline: 'financialProjection',
        TestGenerationPipeline: 'assumptions',
      };

      let mappedStage = agentToStage[message.agentName];

      if (
        ['MarketScanEcosystemPipeline', 'TrendsPipeline'].includes(
          message.agentName,
        ) &&
        reportStatusBySection?.marketScan?.status === 'pending'
      ) {
        mappedStage = 'marketScan';
      }

      if (mappedStage) return mappedStage;
    }

    if (reportStatusBySection) {
      const pendingStage = CONCEPT_REPORT_STAGE_ORDER.find(
        (stage: (typeof CONCEPT_REPORT_STAGE_ORDER)[number]) =>
          reportStatusBySection?.[stage.key]?.status === 'pending',
      );
      if (pendingStage) return pendingStage.key;

      const activeStage = CONCEPT_REPORT_STAGE_ORDER.find(
        (stage: (typeof CONCEPT_REPORT_STAGE_ORDER)[number]) => {
          const status = reportStatusBySection?.[stage.key]?.status;
          return status === 'error' || status === 'pending';
        },
      );
      if (activeStage) return activeStage.key;
    }

    const derived = stageKeyFromMessage(message.message);
    if (derived) return derived;

    if (message.eventType === 'workflow_error') {
      const activeStage = CONCEPT_REPORT_STAGE_ORDER.find(
        (stage: (typeof CONCEPT_REPORT_STAGE_ORDER)[number]) =>
          message.reportStatusBySection?.[stage.key]?.status === 'error',
      );
      return activeStage?.key;
    }

    return undefined;
  };

  const upsertConceptWorkflowToast = React.useCallback(
    (message: IConceptWorkflowMessage) => {
      const toastKeys = getToastKeysFromMessage(message);
      if (toastKeys.length === 0) return;

      const existing = getToastRecordForKeys(toastKeys, true);
      const startTime = existing?.data.startTime ?? Date.now();

      const aggregatePending =
        message.aggregateStatus === 'pending' ||
        message.aggregateStatus === 'notStarted';

      const pendingSectionCount = message.reportStatusBySection
        ? Object.values(message.reportStatusBySection).filter((section) => {
            const status =
              typeof section === 'string' ? section : section?.status;
            return status === 'pending';
          }).length
        : 0;

      let stageKey = resolveStageKey(message);
      let stageMessage =
        createStageMessage(stageKey, message.eventType) ||
        message.message ||
        undefined;

      const isNewWorkflowStart =
        !existing && aggregatePending && pendingSectionCount > 1;

      if (isNewWorkflowStart) {
        stageKey = undefined;
        stageMessage = 'Generating report';
      }

      const conceptUuid = message.conceptUuid || existing?.data.conceptUuid;
      const conceptTitle = message.conceptTitle || existing?.data.conceptTitle;
      const conceptIdentifier =
        message.conceptRootIdentifier || existing?.data.conceptIdentifier;

      telemetry.debug('concept_workflow.toast.upsert.raw_message', {
        messageConceptUuid: message.conceptUuid,
        messageConceptTitle: message.conceptTitle,
        messageConceptRootIdentifier: message.conceptRootIdentifier,
        messageAgentName: message.agentName,
        messageEventType: message.eventType,
        existingConceptUuid: existing?.data.conceptUuid,
        resolvedConceptUuid: conceptUuid,
        pendingSectionCount,
      });

      let agentName: string;
      if (isNewWorkflowStart) {
        agentName = 'ConceptReportPipeline';
      } else if (existing?.data.agentName) {
        agentName = existing.data.agentName;
      } else {
        agentName = message.agentName || 'ConceptReportPipeline';
      }

      telemetry.debug('concept_workflow.toast.upsert', {
        toastKeys,
        stageKey,
        stageMessage,
        hasExisting: Boolean(existing),
        conceptTitle,
        conceptIdentifier,
        agentName,
        messageAgentName: message.agentName,
        isNewWorkflowStart,
        pendingSectionCount,
        messageEstimatedTime: message.estimatedTime,
      });

      const shouldUseBackendEstimate = !isNewWorkflowStart && !existing;

      const payload: ProgressToastPayload = {
        title: stageMessage || message.message || 'Generating Concept Report',
        conceptTitle,
        agentName,
        conceptUuid,
        conceptIdentifier,
        message: stageMessage,
        startTime,
        overrideEstimatedSeconds: shouldUseBackendEstimate
          ? (message.estimatedTime ?? undefined)
          : (existing?.data.overrideEstimatedSeconds ?? undefined),
        fallbackEstimatedSeconds:
          existing?.data.fallbackEstimatedSeconds ??
          getFallbackEstimateForAgent(agentName),
      };

      if (!existing) {
        const toastId = toast.progress(payload);
        const record = {
          toastId,
          data: payload,
          keys: new Set<string>(),
        };
        registerToastRecordKeys(record, toastKeys);
      } else {
        const mergedData = {
          ...existing.data,
          ...payload,
          startTime,
        } as ProgressToastPayload;

        if (existing.data.progress === undefined) {
          delete (mergedData as any).progress;
        }

        toast.updateProgress(existing.toastId, mergedData);
        existing.data = mergedData;
        registerToastRecordKeys(existing, toastKeys);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const finalizeConceptWorkflowToast = React.useCallback(
    (message: IConceptWorkflowMessage, dismissDelayMs = 2000) => {
      const toastKeys = getToastKeysFromMessage(message);
      if (toastKeys.length === 0) return;

      const existing = getToastRecordForKeys(toastKeys, true);
      if (!existing) return;

      const stageKey = resolveStageKey(message);

      if (message.eventType === 'workflow_error') {
        toast.dismiss(existing.toastId);
        clearToastRecord(existing);
        return;
      }

      const payload: ProgressToastPayload = {
        ...existing.data,
        progress: 100,
        message:
          createStageMessage(stageKey, message.eventType) ||
          message.message ||
          existing.data.message,
      };

      toast.updateProgress(existing.toastId, payload);
      existing.data = payload;

      telemetry.debug('concept_workflow.toast.finalize', {
        toastKeys,
        stageKey,
        dismissDelayMs,
        eventType: message.eventType,
      });

      setTimeout(() => {
        toast.dismiss(existing.toastId);
        clearToastRecord(existing);
      }, dismissDelayMs);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const syncPendingOverridesFromServer = React.useCallback(
    (
      identifier: string | undefined,
      reportStatusBySection?: ConceptReportStatusBySection,
    ) => {
      if (!identifier || !reportStatusBySection) return;

      const existingOverrides =
        useStore.getState().conceptReport.pendingSectionOverrides?.[
          identifier
        ] || {};

      const sectionsToAdd: Record<string, string> = {};
      const sectionsToClear: string[] = [];

      Object.entries(reportStatusBySection).forEach(([sectionKey, status]) => {
        if (!status) return;

        const sectionStatus =
          typeof status === 'string' ? status : status.status;

        if (sectionStatus === 'pending') {
          const dateStarted =
            typeof status === 'string' ? undefined : status.dateStarted;
          if (dateStarted) {
            sectionsToAdd[sectionKey] = dateStarted;
          } else {
            const override = existingOverrides[sectionKey];
            if (override) {
              sectionsToClear.push(sectionKey);
            }
          }
          return;
        }

        const override = existingOverrides[sectionKey];
        if (!override) return;

        const dateCompleted =
          typeof status === 'string' ? undefined : status.dateCompleted;
        const dateStarted =
          typeof status === 'string' ? undefined : status.dateStarted;

        if (
          dateCompleted &&
          override.appliedAt &&
          dateCompleted >= override.appliedAt
        ) {
          sectionsToClear.push(sectionKey);
          return;
        }

        if (
          !dateCompleted &&
          dateStarted &&
          override.appliedAt &&
          dateStarted > override.appliedAt
        ) {
          sectionsToClear.push(sectionKey);
        }
      });

      if (Object.keys(sectionsToAdd).length > 0) {
        addPendingSections(identifier, sectionsToAdd);
      }

      if (sectionsToClear.length > 0) {
        clearPendingSections(identifier, sectionsToClear);
      }
    },
    [addPendingSections, clearPendingSections],
  );

  useSocketEvent<'concept.workflow.update.account', IConceptWorkflowMessage>(
    'concept.workflow.update.account',
    (message) => {
      if (
        message.eventType === 'section_started' ||
        message.eventType === 'section_completed' ||
        message.eventType === 'workflow_completed' ||
        message.eventType === 'workflow_error'
      ) {
        upsertConceptWorkflowToast(message);
      }

      if (message.eventType === 'workflow_completed') {
        finalizeConceptWorkflowToast(message);

        const messageKey = `${message.eventType}-${message.conceptRootIdentifier || 'unknown'}`;
        if (preventDuplicate(messageKey)) return;

        const completedSections =
          typeof message.completedSections === 'number'
            ? message.completedSections
            : Array.isArray(message.completedSections)
              ? message.completedSections.length
              : 0;
        const totalSections = message.totalSections ?? 0;
        const isPartialRegeneration =
          totalSections > 0 && completedSections < totalSections;

        if (isPartialRegeneration) return;

        queryClient.invalidateQueries({
          queryKey: [AucctusQueryKeys.concept, message.conceptUuid],
        });
        if (
          message.conceptRootIdentifier &&
          message.conceptRootIdentifier !== message.conceptUuid
        ) {
          queryClient.invalidateQueries({
            queryKey: [AucctusQueryKeys.concept, message.conceptRootIdentifier],
          });
        }

        if (message.reportStatusBySection?.assumptions?.status === 'complete') {
          queryClient.invalidateQueries({
            queryKey: [AucctusQueryKeys.testDetails, message.conceptUuid],
          });
        }

        const currentActiveConceptUuid =
          useStore.getState().conceptReport.conceptUuid;
        const matchesActive =
          message.conceptUuid === currentActiveConceptUuid ||
          message.conceptRootIdentifier === currentActiveConceptUuid;

        if (matchesActive || !currentActiveConceptUuid) {
          toast.deferred.completed(
            'Concept Report Ready',
            message.conceptTitle,
            undefined,
            () => {
              const conceptUrl = AppPath.ConceptOverview.replace(
                ':id',
                message.conceptRootIdentifier ?? '',
              );
              navigate(conceptUrl);
            },
          );
        }
      } else if (message.eventType === 'section_completed') {
        if (message.reportStatusBySection && message.conceptUuid) {
          const normalizedStatus = normalizeStatusMap(
            message.reportStatusBySection,
          );
          const aggregateStatus = message.aggregateStatus as
            | ConceptReportStatus
            | undefined;

          queryClient.setQueryData<IConcept | undefined>(
            [AucctusQueryKeys.concept, message.conceptUuid],
            (existing) => {
              if (!existing) return existing;
              const mergedSections = mergeReportStatusBySection(
                existing.reportStatusBySection,
                normalizedStatus,
              );
              return {
                ...existing,
                ...(mergedSections && {
                  reportStatusBySection: mergedSections,
                }),
                ...(aggregateStatus && {
                  reportStatusAggregate: aggregateStatus,
                }),
              };
            },
          );

          if (
            message.conceptRootIdentifier &&
            message.conceptRootIdentifier !== message.conceptUuid
          ) {
            queryClient.setQueryData<IConcept | undefined>(
              [AucctusQueryKeys.concept, message.conceptRootIdentifier],
              (existing) => {
                if (!existing) return existing;
                const mergedSections = mergeReportStatusBySection(
                  existing.reportStatusBySection,
                  normalizedStatus,
                );
                return {
                  ...existing,
                  ...(mergedSections && {
                    reportStatusBySection: mergedSections,
                  }),
                  ...(aggregateStatus && {
                    reportStatusAggregate: aggregateStatus,
                  }),
                };
              },
            );
          }

          // Mark concept queries stale for featureVersions, but don't refetch immediately.
          // The optimistic update above already provides instant UI feedback.
          // Queries auto-refetch when next consumed (e.g., navigating to the concept page).
          queryClient.invalidateQueries({
            queryKey: [AucctusQueryKeys.concept, message.conceptUuid],
            refetchActive: false,
            refetchInactive: false,
          });
          if (message.conceptRootIdentifier) {
            queryClient.invalidateQueries({
              queryKey: [
                AucctusQueryKeys.concept,
                message.conceptRootIdentifier,
              ],
              refetchActive: false,
              refetchInactive: false,
            });
          }

          // When customer profiles section completes during upgrade, actively refetch
          // the concept so the new version UUID propagates to the store. Needed because
          // workflow_completed returns early for partial regeneration.
          if (normalizedStatus?.customerProfiles?.status === 'complete') {
            if (message.conceptRootIdentifier) {
              queryClient.invalidateQueries({
                queryKey: [
                  AucctusQueryKeys.concept,
                  message.conceptRootIdentifier,
                ],
                refetchActive: true,
                refetchInactive: false,
              });
            }
          }

          const overrideIdentifier =
            message.conceptRootIdentifier || message.conceptUuid;
          syncPendingOverridesFromServer(overrideIdentifier, normalizedStatus);

          const toastKeys = getToastKeysFromMessage(message);
          const hasActiveProgressToast =
            getToastRecordForKeys(toastKeys, true) !== undefined;
          const matchesActiveConcept =
            activeConceptUuid && message.conceptUuid === activeConceptUuid;

          if (matchesActiveConcept && !hasActiveProgressToast) {
            toast.deferred.success(
              `Section updated successfully!`,
              message.message || 'Your changes have been applied.',
              5000,
            );
          }
        }
      } else if (message.eventType === 'workflow_error') {
        finalizeConceptWorkflowToast(message, 4000);

        const messageKey = `${message.eventType}-${message.message || 'unknown'}`;
        if (preventDuplicate(messageKey)) return;

        const currentActiveConceptUuid =
          useStore.getState().conceptReport.conceptUuid;
        const matchesActive =
          message.conceptUuid === currentActiveConceptUuid ||
          message.conceptRootIdentifier === currentActiveConceptUuid;

        if (matchesActive || !currentActiveConceptUuid) {
          toast.deferred.error(
            'Concept Generation Failed',
            message.message ||
              'An error occurred while generating your concept report',
          );
        }
      }
    },
  );
};
