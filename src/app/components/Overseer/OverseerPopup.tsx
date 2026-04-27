import api from '@libs/api';
import {
  IAiEditingSuggestion,
  IConceptReportEdit,
  IJTBDNoteAddPayload,
} from '@libs/api/types';
import type { IJTBDConfigDetail, IJTBDConfigList } from '@libs/api/types/jtbd';
import { EDIT_KIND_HANDLERS, EditKindHandlerContext } from './editKindHandlers';
import { isAucctusAdmin } from '@libs/utils/account';
import { cn } from '@libs/utils/react';
import useStore from '@stores/store';
import {
  IOverseerState,
  MentionItem,
  OverseerFeature,
} from '@stores/overseer/types';
import { produce } from 'immer';
import {
  markConceptSectionsPending,
  useConceptAiEditing,
  useConcepts,
} from '@hooks/query/concepts.hook';
import {
  jtbdKeys,
  useAddJTBDRule,
  useCloneJTBDConfig,
  useDeleteJTBDConfig,
  useDeleteJTBDJob,
  useDeleteJTBDNoteByUuid,
  useDeleteJTBDRule,
  useDeleteJTBDScan,
  useIdeateFromJob,
  useJobEdit,
  useMergeJTBDJobs,
  useTriggerJTBDScan,
  useUpdateJTBDConfig,
  useUpdateJTBDNoteByUuid,
  useUpdateJTBDRule,
} from '@hooks/query/jtbd.hook';
import { useRimOrbStyles } from '@hooks/useRimOrbStyles';
import { usePersonas } from '@hooks/query/persona.hook';
import { useOverseerConversationsInfinite } from '@hooks/query/overseerHistory.hook';
import { AnimatePresence, motion } from 'framer-motion';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from 'react-query';
import { v4 as uuidv4 } from 'uuid';
import OverseerChat from './OverseerChat';
import OverseerInput from './OverseerInput';
import OverseerSocketWrapper from './OverseerSocketWrapper';
import OverseerSuggestedQuestions from './OverseerSuggestedQuestions';
import {
  ChevronLeft,
  History,
  Pause,
  Play,
  CornerDownRight,
  Loader2,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  X,
} from 'lucide-react';
import { DynamicIcon } from '@libs/utils/iconMap';
import { Badge, toast } from '@components';
import { clearHighlight } from './OverseerSelectionButton';

// Panel dimension constants
const DEFAULT_PANEL_WIDTH = 400;
const COMPACT_PANEL_HEIGHT = 500;
const EXPANDED_PANEL_HEIGHT = 500;
const MIN_PANEL_WIDTH = 320;
const MAX_PANEL_WIDTH = 900;
const MIN_PANEL_HEIGHT = 280;
const MAX_PANEL_HEIGHT = 1000;
// Docked-mode width bounds (width is the only docked dimension; height = 100vh)
const MIN_DOCKED_WIDTH = 320;
const MAX_DOCKED_WIDTH = 900;
const VIEWPORT_PADDING = 12;

type ResizeDirection = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w';

/**
 * Feature toggle button config
 */
const FEATURE_BUTTONS: {
  key: OverseerFeature;
  label: string;
  icon: string;
}[] = [
  { key: 'web', label: 'Web Search', icon: 'globe' },
  { key: 'nucleus', label: 'Nucleus', icon: 'compass-03' },
  { key: 'aiEdit', label: 'AI Edit', icon: 'edit' },
  { key: 'navigate', label: 'Navigate', icon: 'map-pin' },
];

const formatHistoryDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/**
 * Main Overseer popup component
 * Features dock/undock, feature toggles, chat history (full-panel takeover)
 */
const OverseerPopup: React.FC = () => {
  const isOpen = useStore((state) => state.overseer.isOpen);
  const position = useStore((state) => state.overseer.position);
  const isDocked = useStore((state) => state.overseer.isDocked);
  const dockedWidth = useStore((state) => state.overseer.dockedWidth);
  const setDockedWidth = useStore((state) => state.overseer.setDockedWidth);
  const selectedText = useStore((state) => state.overseer.selectedText);
  const messages = useStore((state) => state.overseer.messages);
  const suggestedQuestions = useStore(
    (state) => state.overseer.suggestedQuestions,
  );
  const editSuggestions = useStore((state) => state.overseer.editSuggestions);
  const user = useStore((state) => state.auth.user);
  const isAdmin = useMemo(() => isAucctusAdmin(user), [user]);
  const orbStyles = useRimOrbStyles();
  const navigateSuggestion = useStore(
    (state) => state.overseer.navigateSuggestion,
  );
  const currentMessage = useStore((state) => state.overseer.currentMessage);
  const prefillNonce = useStore((state) => state.overseer.prefillNonce);
  const isThinking = useStore((state) => state.overseer.isThinking);
  const hasError = useStore((state) => state.overseer.hasError);
  const conceptUuid = useStore((state) => state.overseer.conceptUuid);
  const sessionId = useStore((state) => state.overseer.sessionId);
  const activeFeatures = useStore((state) => state.overseer.activeFeatures);
  const mentions = useStore((state) => state.overseer.mentions);
  const showHistory = useStore((state) => state.overseer.showHistory);
  const historyItems = useStore((state) => state.overseer.historyItems);
  const toolActivitySteps = useStore(
    (state) => state.overseer.toolActivitySteps,
  );

  const messageQueue = useStore((state) => state.overseer.messageQueue);
  const isQueuePaused = useStore((state) => state.overseer.isQueuePaused);
  const cancelCurrentRun = useStore((state) => state.overseer.cancelCurrentRun);
  const clearMessageQueue = useStore(
    (state) => state.overseer.clearMessageQueue,
  );
  const toggleQueuePaused = useStore(
    (state) => state.overseer.toggleQueuePaused,
  );

  const close = useStore((state) => state.overseer.close);
  const setCurrentMessage = useStore(
    (state) => state.overseer.setCurrentMessage,
  );
  const sendMessage = useStore((state) => state.overseer.sendMessage);
  const setPosition = useStore((state) => state.overseer.setPosition);
  const clearEditSuggestions = useStore(
    (state) => state.overseer.clearEditSuggestions,
  );
  const setDocked = useStore((state) => state.overseer.setDocked);
  const toggleFeature = useStore((state) => state.overseer.toggleFeature);
  const setShowHistory = useStore((state) => state.overseer.setShowHistory);
  const loadConversation = useStore((state) => state.overseer.loadConversation);
  const addMention = useStore((state) => state.overseer.addMention);
  const removeMention = useStore((state) => state.overseer.removeMention);
  const pendingImages = useStore((state) => state.overseer.pendingImages);
  const addImage = useStore((state) => state.overseer.addImage);
  const removeImage = useStore((state) => state.overseer.removeImage);
  const clearSelectedText = useStore(
    (state) => state.overseer.clearSelectedText,
  );
  const clearConversation = useStore(
    (state) => state.overseer.clearConversation,
  );
  const setHighlightedSection = useStore(
    (state) => state.overseer.setHighlightedSection,
  );

  const queryClient = useQueryClient();
  const { id: conceptIdentifier } = useParams();

  const { mutate: aiEditConcept, isLoading: isApplyingConceptEdits } =
    useConceptAiEditing();

  // JTBD mutation hooks — used when confirming jtbd_rule / jtbd_scan suggestions.
  // All four hooks already invalidate the appropriate jtbdKeys on success, so
  // the canvas reflects the mutation automatically (no extra skeleton helper
  // needed for this phase).
  const { addRuleAsync, isAdding: isAddingJTBDRule } = useAddJTBDRule();
  const { updateRuleAsync, isUpdating: isUpdatingJTBDRule } =
    useUpdateJTBDRule();
  const { deleteRuleAsync, isDeleting: isDeletingJTBDRule } =
    useDeleteJTBDRule();
  const { triggerScanAsync, isTriggering: isTriggeringJTBDScan } =
    useTriggerJTBDScan();
  const { editJobAsync, isEditing: isEditingJTBDJob } = useJobEdit();
  const { mergeJobsAsync, isMerging: isMergingJTBDJobs } = useMergeJTBDJobs();
  const { ideateFromJobAsync, isIdeating: isIdeatingJTBDJob } =
    useIdeateFromJob();
  const { deleteScanAsync, isDeleting: isDeletingJTBDScan } =
    useDeleteJTBDScan();
  const { updateConfigAsync, isUpdating: isUpdatingJTBDConfig } =
    useUpdateJTBDConfig();
  const { cloneConfigAsync, isCloning: isCloningJTBDConfig } =
    useCloneJTBDConfig();
  const { deleteConfigAsync, isDeleting: isDeletingJTBDConfig } =
    useDeleteJTBDConfig();
  const { updateNoteAsync, isUpdating: isUpdatingJTBDNote } =
    useUpdateJTBDNoteByUuid();
  const { deleteNoteAsync, isDeleting: isDeletingJTBDNote } =
    useDeleteJTBDNoteByUuid();
  const { deleteJobAsync, isDeleting: isDeletingJTBDJob } = useDeleteJTBDJob();

  const navigate = useNavigate();

  // `useCreateJTBDNote` is job-scoped (requires a fixed jobUuid) but the
  // Overseer edit-suggestion carousel can target arbitrary jobs, so we drive
  // the note-add flow via `api.jtbd.createNote` directly + manual cache
  // invalidation here. Tracks its own in-flight flag so `isApplyingEdits`
  // disables the carousel Apply button while the POST is pending.
  const [isAddingJTBDNote, setIsAddingJTBDNote] = useState(false);

  const isApplyingEdits =
    isApplyingConceptEdits ||
    isAddingJTBDRule ||
    isUpdatingJTBDRule ||
    isDeletingJTBDRule ||
    isTriggeringJTBDScan ||
    isEditingJTBDJob ||
    isMergingJTBDJobs ||
    isAddingJTBDNote ||
    isIdeatingJTBDJob ||
    isDeletingJTBDScan ||
    isUpdatingJTBDConfig ||
    isCloningJTBDConfig ||
    isDeletingJTBDConfig ||
    isUpdatingJTBDNote ||
    isDeletingJTBDNote ||
    isDeletingJTBDJob;

  // Fetch global conversation history for the current user (infinite pagination)
  const {
    items: fetchedHistory,
    isLoading: historyLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useOverseerConversationsInfinite({ enabled: isOpen });

  // Merge React Query data with store placeholders (new conversations not yet in API)
  const mergedHistory = useMemo(() => {
    const apiItems = fetchedHistory;
    // Keep only placeholders that aren't already in the API response
    const newPlaceholders = historyItems.filter(
      (item) => !apiItems.some((api) => api.uuid === item.uuid),
    );
    return [...newPlaceholders, ...apiItems];
  }, [fetchedHistory, historyItems]);

  // Fetch all non-archived concepts for @mention menu (only when popup is open)
  const { data: conceptPage } = useConcepts({
    page: 1,
    pageSize: 199,
    enabled: isOpen,
    reportStatusAggregate: 'complete',
  });
  const conceptItems: MentionItem[] = useMemo(() => {
    if (!conceptPage?.results) return [];
    return conceptPage.results
      .filter((c) => c.uuid !== conceptUuid) // Exclude current concept
      .map((c) => ({
        id: c.uuid,
        name: c.title,
        type: 'concept' as const,
      }));
  }, [conceptPage?.results, conceptUuid]);

  // Fetch all active personas for @mention menu (only when popup is open)
  const { personas: personaList } = usePersonas();
  const personaItems: MentionItem[] = useMemo(() => {
    if (!personaList) return [];
    return personaList.map((p) => ({
      id: p.uuid,
      name: p.name,
      type: 'persona' as const,
      segment: p.segment,
      themeColor: p.themeColor,
      avatar: p.avatar,
    }));
  }, [personaList]);

  // Panel sizing state
  const [panelWidth, setPanelWidth] = useState(DEFAULT_PANEL_WIDTH);
  const [panelHeight, setPanelHeight] = useState(COMPACT_PANEL_HEIGHT);
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hasAutoExpanded, setHasAutoExpanded] = useState(false);
  const [contentExpanded, setContentExpanded] = useState(true);
  const [isTextExpanded, setIsTextExpanded] = useState(false);

  const popupRef = useRef<HTMLDivElement>(null);
  const resizeStartRef = useRef<{
    width: number;
    height: number;
    x: number;
    y: number;
    mouseX: number;
    mouseY: number;
    direction: ResizeDirection;
  } | null>(null);
  const dragStartRef = useRef<{
    x: number;
    y: number;
    mouseX: number;
    mouseY: number;
  } | null>(null);

  const prevSelectedTextRef = useRef(selectedText);

  // Reset panel when selected text changes
  useEffect(() => {
    if (prevSelectedTextRef.current !== selectedText) {
      setPanelWidth(DEFAULT_PANEL_WIDTH);
      setPanelHeight(COMPACT_PANEL_HEIGHT);
      setHasAutoExpanded(false);
      setContentExpanded(true);
      setIsTextExpanded(false);
      prevSelectedTextRef.current = selectedText;
    }
  }, [selectedText]);

  // Clamp position to viewport bounds (only in floating mode)
  useEffect(() => {
    if (!isOpen || isDocked) return;

    const clampToViewport = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const maxX = viewportWidth - panelWidth - VIEWPORT_PADDING;
      const maxY = viewportHeight - panelHeight - VIEWPORT_PADDING;

      const clampedX = Math.max(VIEWPORT_PADDING, Math.min(position.x, maxX));
      const clampedY = Math.max(VIEWPORT_PADDING, Math.min(position.y, maxY));

      if (clampedX !== position.x || clampedY !== position.y) {
        setPosition({ x: clampedX, y: clampedY });
      }
    };

    clampToViewport();
    window.addEventListener('resize', clampToViewport);
    return () => window.removeEventListener('resize', clampToViewport);
  }, [
    isOpen,
    isDocked,
    position.x,
    position.y,
    panelWidth,
    panelHeight,
    setPosition,
  ]);

  // Auto-expand panel when first AI response arrives
  useEffect(() => {
    if (messages.length > 0 && !hasAutoExpanded && !isResizing && !isDocked) {
      const viewportHeight = window.innerHeight;
      const newHeight = EXPANDED_PANEL_HEIGHT;

      const newY = Math.min(
        position.y,
        viewportHeight - newHeight - VIEWPORT_PADDING,
      );

      if (newY !== position.y) {
        setPosition({ x: position.x, y: Math.max(VIEWPORT_PADDING, newY) });
      }

      setPanelHeight(newHeight);
      setHasAutoExpanded(true);
    }
  }, [
    messages.length,
    hasAutoExpanded,
    isResizing,
    isDocked,
    position.x,
    position.y,
    setPosition,
  ]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        clearHighlight();
        close();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown, true);
    };
  }, [isOpen, close]);

  // Wrap close to also clean up persistent highlight
  const handleClose = useCallback(() => {
    clearHighlight();
    close();
  }, [close]);

  // Clean up highlight on unmount
  useEffect(() => {
    return () => {
      clearHighlight();
    };
  }, []);

  // Handle suggested question click
  const handleQuestionClick = useCallback(
    (question: string) => {
      setCurrentMessage(question);
      setTimeout(() => sendMessage(), 50);
    },
    [setCurrentMessage, sendMessage],
  );

  /**
   * Apply a JTBD note-add suggestion — posts a user-authored note widget onto
   * the targeted job via the REST endpoint. Caches are invalidated so the
   * canvas / expanded card picks up the new note. Invoked through the
   * registry context (notes are job-scoped and don't have a popup-level
   * mutation hook).
   */
  const applyJTBDNoteAdd = useCallback(
    async (payload: IJTBDNoteAddPayload): Promise<void> => {
      if (!payload.jobUuid || !payload.body?.trim()) return;
      await api.jtbd.createNote(payload.jobUuid, {
        body: payload.body.trim(),
      });
      queryClient.invalidateQueries({
        queryKey: jtbdKeys.job(payload.jobUuid),
      });
      queryClient.invalidateQueries({
        queryKey: [...jtbdKeys.all, 'jobs'],
      });
      queryClient.invalidateQueries({
        queryKey: [...jtbdKeys.all, 'currentScan'],
      });
    },
    [queryClient],
  );

  /**
   * Apply the concept-edit suggestions via the legacy AI editing route.
   * Preserves the original behavior: session-scoped, marks sections pending
   * for skeletons, and surfaces an assistant confirmation message.
   */
  const applyConceptEdits = useCallback(
    (conceptEdits: IAiEditingSuggestion[]) => {
      if (!editSuggestions || !conceptUuid || !sessionId) return;

      const payload: IConceptReportEdit = {
        ...editSuggestions,
        edits: conceptEdits,
        uuid: editSuggestions.uuid || uuidv4(),
      } as IConceptReportEdit;

      aiEditConcept(
        {
          concept_uuid: conceptUuid,
          session_id: sessionId,
          edit: payload,
        },
        {
          onSuccess: () => {
            if (conceptIdentifier) {
              const sectionKeys = conceptEdits.map((e) => e.section);
              markConceptSectionsPending(
                queryClient,
                conceptIdentifier,
                sectionKeys,
              );
            }

            setHighlightedSection(null);
            clearEditSuggestions();
            useStore.getState().overseer.addAssistantMessage({
              uuid: uuidv4(),
              role: 'assistant',
              content:
                'Great! I have started applying those edits for you. You will see the changes reflected in the report shortly.',
              name: 'assistant',
              timestamp: new Date().toISOString(),
            });
          },
        },
      );
    },
    [
      editSuggestions,
      conceptUuid,
      sessionId,
      aiEditConcept,
      queryClient,
      conceptIdentifier,
      clearEditSuggestions,
      setHighlightedSection,
    ],
  );

  const editResolutionsRef = useRef<Record<number, 'accepted' | 'rejected'>>(
    {},
  );

  const handleConfirmEdits = useCallback(
    (selectedEdits: IAiEditingSuggestion[]) => {
      if (!editSuggestions || isApplyingEdits || selectedEdits.length === 0)
        return;

      // Split concept edits out — they're batch-applied via the legacy
      // AI-editing route (a single call with shared session_id + concept_uuid)
      // so they bypass the per-suggestion registry dispatch.
      const conceptEdits: IAiEditingSuggestion[] = [];
      const jtbdEdits: IAiEditingSuggestion[] = [];

      for (const edit of selectedEdits) {
        const kind = edit.kind ?? 'concept';
        if (kind === 'concept') conceptEdits.push(edit);
        else jtbdEdits.push(edit);
      }

      const hasNoteAdd = jtbdEdits.some((e) => e.kind === 'jtbd_note_add');
      const msgUuid = editSuggestions.uuid;

      // Build the handler-context bundle once per dispatch — registry
      // handlers receive it and stay pure with respect to React state.
      const ctx: EditKindHandlerContext = {
        queryClient,
        addJTBDRule: (params) => addRuleAsync(params),
        updateJTBDRule: (params) => updateRuleAsync(params),
        deleteJTBDRule: (params) => deleteRuleAsync(params),
        triggerJTBDScan: (configUuid) => triggerScanAsync(configUuid),
        editJTBDJob: (params) => editJobAsync(params),
        mergeJTBDJobs: (primaryJobUuid, body) =>
          mergeJobsAsync({ primaryJobUuid, body }),
        addJTBDNote: (payload) => applyJTBDNoteAdd(payload),
        ideateFromJTBDJob: (params) => ideateFromJobAsync(params),
        deleteJTBDScan: (params) => deleteScanAsync(params),
        updateJTBDConfig: (params) =>
          updateConfigAsync({
            configUuid: params.configUuid,
            data: params.data,
          }),
        cloneJTBDConfig: (params) =>
          cloneConfigAsync({
            configUuid: params.configUuid,
            newName: params.newName ?? undefined,
          }),
        deleteJTBDConfig: (configUuid) => deleteConfigAsync(configUuid),
        updateJTBDNote: (params) => updateNoteAsync(params),
        deleteJTBDNote: (params) => deleteNoteAsync(params),
        deleteJTBDJob: (jobUuid) => deleteJobAsync(jobUuid),
        resolveConfigPersonaUuids: (configUuid) => {
          // Prefer the single-config detail (most specific / freshest), fall
          // back to the list view, return null when neither is cached so the
          // handler can decide whether to send a diff-less payload.
          const detail = queryClient.getQueryData<IJTBDConfigDetail>(
            jtbdKeys.config(configUuid),
          );
          if (detail?.personaUuids) return detail.personaUuids;
          const list = queryClient.getQueryData<IJTBDConfigList[]>(
            jtbdKeys.configs(),
          );
          const match = list?.find((c) => c.uuid === configUuid);
          return match?.personaUuids ?? null;
        },
        applyConceptEdits,
        navigateTo: (path) => navigate(path),
        closeOverseer: () => close(),
      };

      // Single point where we persist resolution='applied' to the server
      // after all dispatches for this batch have settled. Uses the
      // accumulator populated by per-edit accept/reject clicks so the
      // backend gets the full per-edit resolution map in one PATCH.
      const finalizeAppliedResolution = () => {
        if (!msgUuid) {
          editResolutionsRef.current = {};
          return;
        }
        const perEditResolutions = { ...editResolutionsRef.current };
        api.overseer
          .setMessageResolution(
            msgUuid,
            'applied',
            Object.keys(perEditResolutions).length > 0
              ? perEditResolutions
              : undefined,
          )
          .catch(() => {
            toast.error(
              'Applied your edits, but failed to save resolution state. Reloading this chat may show them as pending.',
            );
          });
        editResolutionsRef.current = {};
      };

      // Dispatch JTBD suggestions in parallel via the handler registry. Each
      // handler targets disjoint resources so concurrent runs are safe.
      if (jtbdEdits.length > 0) {
        // Note-add path bypasses a hook with its own loading flag, so track
        // pending state locally to keep the carousel Apply button disabled.
        if (hasNoteAdd) setIsAddingJTBDNote(true);

        const promises = jtbdEdits.map((edit) => {
          const kind = edit.kind ?? 'concept';
          const handler = EDIT_KIND_HANDLERS[kind];
          if (!handler) return Promise.resolve();
          return handler(edit, ctx).catch(() => {
            // Individual mutation errors are already surfaced via their hooks'
            // `onError` toasts; swallow here so `Promise.allSettled` completes.
          });
        });

        Promise.allSettled(promises).then(() => {
          if (hasNoteAdd) setIsAddingJTBDNote(false);

          // Each JTBD mutation hook invalidates its own jtbdKeys on success;
          // additionally invalidate the configs list to cover the case where
          // multiple configs were touched in one batch.
          queryClient.invalidateQueries({ queryKey: jtbdKeys.configs() });

          setHighlightedSection(null);
          finalizeAppliedResolution();
          clearEditSuggestions();
          useStore.getState().overseer.addAssistantMessage({
            uuid: uuidv4(),
            role: 'assistant',
            content:
              'Done! Those JTBD changes have been applied. The canvas will reflect the updates shortly.',
            name: 'assistant',
            timestamp: new Date().toISOString(),
          });
        });
      }

      // Concept edits still require conceptUuid + sessionId. If they are
      // absent (e.g. the Overseer is scoped to an account page with only
      // JTBD edits), we silently skip — this matches the pre-existing guard.
      if (conceptEdits.length > 0) {
        applyConceptEdits(conceptEdits);
        // Concept edits are dispatched fire-and-forget via the legacy
        // `aiEditConcept` mutation; there's no awaitable join point for
        // them here. If this path runs without JTBD edits, persist the
        // applied resolution immediately so the server record matches
        // the user's Apply click.
        if (jtbdEdits.length === 0) {
          finalizeAppliedResolution();
        }
      }
    },
    [
      editSuggestions,
      isApplyingEdits,
      queryClient,
      addRuleAsync,
      updateRuleAsync,
      deleteRuleAsync,
      triggerScanAsync,
      editJobAsync,
      mergeJobsAsync,
      applyJTBDNoteAdd,
      ideateFromJobAsync,
      deleteScanAsync,
      updateConfigAsync,
      cloneConfigAsync,
      deleteConfigAsync,
      updateNoteAsync,
      deleteNoteAsync,
      deleteJobAsync,
      applyConceptEdits,
      navigate,
      close,
      clearEditSuggestions,
      setHighlightedSection,
    ],
  );

  const handleActiveEditChange = useCallback(
    (edit: IAiEditingSuggestion) => {
      setHighlightedSection(edit.section);
    },
    [setHighlightedSection],
  );

  const handleCancelEdits = useCallback(
    (editStatuses?: Record<number, string>) => {
      setHighlightedSection(null);
      if (editSuggestions && editSuggestions.edits.length > 0) {
        const msgUuid = editSuggestions.uuid || uuidv4();
        // Merge the accumulator (populated by per-edit clicks during this
        // turn) with the carousel's snapshot argument. The carousel is the
        // source of truth at cancel time, so its values win on conflict.
        const merged: Record<number, 'accepted' | 'rejected'> = {
          ...editResolutionsRef.current,
        };
        if (editStatuses) {
          for (const [k, v] of Object.entries(editStatuses)) {
            if (v === 'accepted' || v === 'rejected') {
              merged[Number(k)] = v;
            }
          }
        }
        const perEditResolutions =
          Object.keys(merged).length > 0 ? merged : undefined;
        useStore.setState(
          produce((state: { overseer: IOverseerState }) => {
            state.overseer.messages.push({
              uuid: msgUuid,
              role: 'edit_suggestion' as const,
              editSuggestions: { ...editSuggestions },
              timestamp: new Date().toISOString(),
              resolution: 'declined' as const,
            });
          }),
        );
        api.overseer
          .setMessageResolution(msgUuid, 'declined', perEditResolutions)
          .catch(() => {
            toast.error(
              'Dismissed the edits, but failed to save resolution state. Reloading this chat may show them as pending.',
            );
          });
        editResolutionsRef.current = {};
      }
      clearEditSuggestions();
    },
    [clearEditSuggestions, setHighlightedSection, editSuggestions],
  );

  // Per-edit accept/reject clicks accumulate into `editResolutionsRef`. We
  // intentionally DO NOT PATCH the server here — that would prematurely mark
  // the message as declined before the user has confirmed the batch. The
  // accumulator is flushed once, with the correct `applied`/`declined`
  // resolution, from `handleConfirmEdits` or `handleCancelEdits`.
  const handleEditStatusChange = useCallback(
    (index: number, status: string) => {
      if (status === 'accepted' || status === 'rejected') {
        editResolutionsRef.current[index] = status;
      }
    },
    [],
  );

  const handleSubmitMessage = useCallback(() => {
    editResolutionsRef.current = {};
    sendMessage();
  }, [sendMessage]);

  const hasEditSuggestions = (editSuggestions?.edits?.length ?? 0) > 0;

  // Drag handlers
  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      if (isDocked) return;
      e.preventDefault();
      setIsDragging(true);
      dragStartRef.current = {
        x: position.x,
        y: position.y,
        mouseX: e.clientX,
        mouseY: e.clientY,
      };
    },
    [isDocked, position.x, position.y],
  );

  useEffect(() => {
    if (!isDragging || !dragStartRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStartRef.current) return;
      const { x, y, mouseX, mouseY } = dragStartRef.current;
      const deltaX = e.clientX - mouseX;
      const deltaY = e.clientY - mouseY;

      let newX = x + deltaX;
      let newY = y + deltaY;

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const maxX = viewportWidth - panelWidth - VIEWPORT_PADDING;
      const maxY = viewportHeight - panelHeight - VIEWPORT_PADDING;

      newX = Math.max(VIEWPORT_PADDING, Math.min(newX, maxX));
      newY = Math.max(VIEWPORT_PADDING, Math.min(newY, maxY));

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragStartRef.current = null;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, setPosition, panelWidth, panelHeight]);

  // Resize handlers — floating mode uses all 8 directions; docked mode uses 'w' only
  const handleResizeStart = useCallback(
    (e: React.MouseEvent, direction: ResizeDirection) => {
      // In docked mode, only the left edge ('w') is resizable (panel is anchored to the right)
      if (isDocked && direction !== 'w') return;
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      resizeStartRef.current = {
        width: isDocked ? dockedWidth : panelWidth,
        height: panelHeight,
        x: position.x,
        y: position.y,
        mouseX: e.clientX,
        mouseY: e.clientY,
        direction,
      };
    },
    [isDocked, panelWidth, dockedWidth, panelHeight, position.x, position.y],
  );

  useEffect(() => {
    if (!isResizing || !resizeStartRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeStartRef.current) return;

      const { direction, width, height, x, y, mouseX, mouseY } =
        resizeStartRef.current;
      const deltaX = e.clientX - mouseX;
      const deltaY = e.clientY - mouseY;

      // Docked mode: only width changes, anchored to the right edge.
      // Dragging left (negative deltaX) increases width.
      if (isDocked) {
        const maxDockedForViewport = Math.max(
          MIN_DOCKED_WIDTH,
          window.innerWidth - VIEWPORT_PADDING * 2,
        );
        const newDockedWidth = Math.min(
          Math.max(width - deltaX, MIN_DOCKED_WIDTH),
          Math.min(MAX_DOCKED_WIDTH, maxDockedForViewport),
        );
        setDockedWidth(newDockedWidth);
        return;
      }

      let newWidth = width;
      let newHeight = height;
      let newX = x;
      let newY = y;

      if (direction.includes('e')) {
        newWidth = Math.min(
          Math.max(width + deltaX, MIN_PANEL_WIDTH),
          MAX_PANEL_WIDTH,
        );
      } else if (direction.includes('w')) {
        const widthDelta =
          Math.min(Math.max(width - deltaX, MIN_PANEL_WIDTH), MAX_PANEL_WIDTH) -
          width;
        newWidth = width + widthDelta;
        newX = x - widthDelta;
      }

      if (direction.includes('s')) {
        newHeight = Math.min(
          Math.max(height + deltaY, MIN_PANEL_HEIGHT),
          MAX_PANEL_HEIGHT,
        );
      } else if (direction.includes('n')) {
        const heightDelta =
          Math.min(
            Math.max(height - deltaY, MIN_PANEL_HEIGHT),
            MAX_PANEL_HEIGHT,
          ) - height;
        newHeight = height + heightDelta;
        newY = y - heightDelta;
      }

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      newX = Math.max(VIEWPORT_PADDING, newX);
      newY = Math.max(VIEWPORT_PADDING, newY);

      if (newX + newWidth > viewportWidth - VIEWPORT_PADDING) {
        newWidth = viewportWidth - newX - VIEWPORT_PADDING;
        newWidth = Math.max(newWidth, MIN_PANEL_WIDTH);
      }

      if (newY + newHeight > viewportHeight - VIEWPORT_PADDING) {
        newHeight = viewportHeight - newY - VIEWPORT_PADDING;
        newHeight = Math.max(newHeight, MIN_PANEL_HEIGHT);
      }

      setPanelWidth(newWidth);
      setPanelHeight(newHeight);
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      resizeStartRef.current = null;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, setPosition, isDocked, setDockedWidth]);

  // Clamp to viewport helper for undock repositioning
  const clampToViewport = useCallback(
    (x: number, y: number) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      return {
        x: Math.max(
          VIEWPORT_PADDING,
          Math.min(x, vw - panelWidth - VIEWPORT_PADDING),
        ),
        y: Math.max(
          VIEWPORT_PADDING,
          Math.min(y, vh - panelHeight - VIEWPORT_PADDING),
        ),
      };
    },
    [panelWidth, panelHeight],
  );

  // Group history items by date
  const groupedHistory = useMemo(() => {
    const grouped: Record<
      string,
      { uuid: string; name: string | null; createdAt: string }[]
    > = {};
    for (const item of mergedHistory) {
      const label = formatHistoryDate(item.createdAt);
      if (!grouped[label]) grouped[label] = [];
      grouped[label].push(item);
    }
    return grouped;
  }, [mergedHistory]);

  if (!isOpen) return null;

  const popupContent = (
    <>
      <OverseerSocketWrapper />

      <AnimatePresence>
        <motion.div
          ref={popupRef}
          data-overseer-root='true'
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{
            duration: 0.2,
            ease: [0.22, 1, 0.36, 1],
          }}
          className={cn(
            'fixed z-[9999]',
            isDocked ? 'right-0 top-0 h-full rounded-none' : '',
          )}
          style={
            isDocked
              ? { width: dockedWidth }
              : {
                  left: position.x,
                  top: position.y,
                  width: panelWidth,
                  height: panelHeight,
                }
          }
        >
          {/* Docked mode: single west-edge resize handle (panel is anchored to the right) */}
          {isDocked && (
            <div
              onMouseDown={(e) => handleResizeStart(e, 'w')}
              className='absolute bottom-0 left-0 top-0 z-20 w-2 cursor-ew-resize transition-colors hover:bg-white/10'
            />
          )}

          {/* Resize handles (only when floating) — entire rim is resize */}
          {!isDocked && (
            <>
              <div
                onMouseDown={(e) => handleResizeStart(e, 'w')}
                className='absolute bottom-4 left-0 top-4 z-20 w-2 cursor-ew-resize transition-colors hover:bg-white/10'
              />
              <div
                onMouseDown={(e) => handleResizeStart(e, 'e')}
                className='absolute bottom-4 right-0 top-4 z-20 w-2 cursor-ew-resize transition-colors hover:bg-white/10'
              />
              <div
                onMouseDown={(e) => handleResizeStart(e, 'n')}
                className='absolute left-4 right-4 top-0 z-20 h-2 cursor-ns-resize transition-colors hover:bg-white/10'
              />
              <div
                onMouseDown={(e) => handleResizeStart(e, 's')}
                className='absolute bottom-0 left-4 right-4 z-20 h-2 cursor-ns-resize transition-colors hover:bg-white/10'
              />
              <div
                onMouseDown={(e) => handleResizeStart(e, 'nw')}
                className='absolute left-0 top-0 z-30 h-4 w-4 cursor-nwse-resize'
              />
              <div
                onMouseDown={(e) => handleResizeStart(e, 'ne')}
                className='absolute right-0 top-0 z-30 h-4 w-4 cursor-nesw-resize'
              />
              <div
                onMouseDown={(e) => handleResizeStart(e, 'sw')}
                className='absolute bottom-0 left-0 z-30 h-4 w-4 cursor-nesw-resize'
              />
              <div
                onMouseDown={(e) => handleResizeStart(e, 'se')}
                className='absolute bottom-0 right-0 z-30 h-4 w-4 cursor-nwse-resize'
              />
            </>
          )}

          {/* Glass Shell — drag is delegated to the header only */}
          <div
            className={cn(
              'liquid-glass-modal-shell h-full',
              isDocked && '!rounded-none',
            )}
          >
            {/* Animated Overseer Rim with floating gradient orbs */}
            <div
              className={cn(
                'liquid-glass-modal-rim liquid-glass-modal-rim-overseer',
                isDocked && 'rounded-none',
              )}
              aria-hidden='true'
              style={orbStyles}
            >
              <div className='rim-orb rim-orb-1' />
              <div className='rim-orb rim-orb-2' />
            </div>

            {/* Dark gradient surface — stop propagation so clicks inside don't trigger shell drag */}
            <div
              className={cn(
                'overseer-panel-surface h-full',
                isDocked && '!rounded-none',
              )}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className='relative z-10 flex h-full flex-col overflow-hidden'>
                {showHistory ? (
                  /* ======== History full-panel takeover (Lovable pattern) ======== */
                  <div
                    className='flex flex-1 flex-col overflow-hidden'
                    style={{ background: 'rgba(18,18,18,0.95)' }}
                  >
                    {/* History header — entire bar is drag zone; buttons stop propagation to take precedence */}
                    <div
                      className={cn(
                        'flex items-center justify-between border-b border-white/40 px-3 py-1.5',
                        !isDocked && 'cursor-grab active:cursor-grabbing',
                      )}
                      style={{ background: 'rgba(255,255,255,0.04)' }}
                      onMouseDown={handleDragStart}
                    >
                      <button
                        onClick={() => setShowHistory(false)}
                        onMouseDown={(e) => e.stopPropagation()}
                        className='rounded-lg p-1.5 text-white/30 transition-all hover:bg-white/10 hover:text-white'
                        title='Back to chat'
                      >
                        <ChevronLeft size={14} className='stroke-current' />
                      </button>
                      <div className='h-3 flex-1' />
                      <div className='flex items-center'>
                        {isDocked ? (
                          <button
                            onClick={() => {
                              setDocked(false);
                              const pos = clampToViewport(
                                window.innerWidth - DEFAULT_PANEL_WIDTH - 40,
                                40,
                              );
                              setPosition(pos);
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
                            className='rounded-lg p-1.5 text-white/30 transition-all hover:bg-white/10 hover:text-white'
                            title='Undock panel'
                          >
                            <PanelRightOpen
                              size={14}
                              className='stroke-current'
                            />
                          </button>
                        ) : (
                          <button
                            onClick={() => setDocked(true)}
                            onMouseDown={(e) => e.stopPropagation()}
                            className='rounded-lg p-1.5 text-white/30 transition-all hover:bg-white/10 hover:text-white'
                            title='Anchor to side panel'
                          >
                            <PanelRightClose
                              size={14}
                              className='stroke-current'
                            />
                          </button>
                        )}
                        <button
                          onClick={handleClose}
                          onMouseDown={(e) => e.stopPropagation()}
                          className='rounded-lg p-1.5 text-white/30 transition-all hover:bg-white/10 hover:text-white'
                          title='Close panel'
                        >
                          <X size={14} className='stroke-current' />
                        </button>
                      </div>
                    </div>

                    {/* History list */}
                    <div className='flex-1 overflow-y-auto px-2 py-2'>
                      {historyLoading && mergedHistory.length === 0 ? (
                        /* Loading skeleton */
                        <div className='space-y-2 px-3 py-2'>
                          {[1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className='h-5 animate-pulse rounded bg-white/[0.06]'
                            />
                          ))}
                        </div>
                      ) : Object.keys(groupedHistory).length === 0 ? (
                        <div className='px-3 py-6 text-center text-[11px] text-white/20'>
                          No conversations yet
                        </div>
                      ) : (
                        <>
                          {Object.entries(groupedHistory).map(
                            ([dateLabel, chats], groupIdx) => (
                              <div key={dateLabel}>
                                {groupIdx > 0 && (
                                  <div className='mx-2 my-2 border-t border-white/[0.06]' />
                                )}
                                <div className='mb-1 px-3 pt-1 text-[10px] font-medium uppercase tracking-widest text-white/20'>
                                  {dateLabel}
                                </div>
                                {chats.map((chat, chatIdx) => (
                                  <div key={chat.uuid}>
                                    {chatIdx > 0 && (
                                      <div className='mx-3 border-t border-white/[0.04]' />
                                    )}
                                    <button
                                      onClick={async () => {
                                        try {
                                          const detail =
                                            await api.overseer.getConversation(
                                              chat.uuid,
                                            );
                                          loadConversation(detail);
                                        } catch {
                                          setShowHistory(false);
                                        }
                                      }}
                                      className='w-full truncate px-3 py-2.5 text-left text-[12px] font-light text-white/50 transition-all duration-200 hover:bg-white/[0.05] hover:text-white/85'
                                    >
                                      {chat.name === null ? (
                                        <span className='inline-flex items-center gap-1 text-white/30'>
                                          <span className='inline-block h-1 w-1 animate-pulse rounded-full bg-white/40' />
                                          <span className='inline-block h-1 w-1 animate-pulse rounded-full bg-white/40 [animation-delay:0.2s]' />
                                          <span className='inline-block h-1 w-1 animate-pulse rounded-full bg-white/40 [animation-delay:0.4s]' />
                                        </span>
                                      ) : (
                                        chat.name
                                      )}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ),
                          )}
                          {hasNextPage && (
                            <div className='px-3 py-3'>
                              <button
                                onClick={() => fetchNextPage()}
                                disabled={isFetchingNextPage}
                                className='flex w-full items-center justify-center gap-2 rounded-lg py-2 text-[11px] font-medium text-white/30 transition-all hover:bg-white/[0.05] hover:text-white/60 disabled:pointer-events-none'
                              >
                                {isFetchingNextPage ? (
                                  <>
                                    <Loader2
                                      size={12}
                                      className='animate-spin stroke-current'
                                    />
                                    Loading…
                                  </>
                                ) : (
                                  'Load older conversations'
                                )}
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  /* ======== Main chat view ======== */
                  <>
                    {/* Header — entire bar is the drag zone; buttons stop propagation so clicks take precedence */}
                    <div
                      className={cn(
                        'flex items-center justify-between border-b border-white/40 px-3 py-1.5',
                        !isDocked && 'cursor-grab active:cursor-grabbing',
                      )}
                      onMouseDown={handleDragStart}
                    >
                      <div className='flex items-center'>
                        <button
                          onClick={() => setShowHistory(true)}
                          onMouseDown={(e) => e.stopPropagation()}
                          className='rounded-lg p-1.5 text-white/30 transition-all hover:bg-white/10 hover:text-white'
                          title='Chat history'
                        >
                          <History size={14} className='stroke-current' />
                        </button>
                        {messages.length > 0 && (
                          <button
                            onClick={clearConversation}
                            onMouseDown={(e) => e.stopPropagation()}
                            className='rounded-lg p-1.5 text-white/30 transition-all hover:bg-white/10 hover:text-white'
                            title='New chat'
                          >
                            <Plus size={14} className='stroke-current' />
                          </button>
                        )}
                        <Badge.Beta
                          size='xs'
                          className='border border-white/20 !bg-transparent !text-white/40'
                        />
                        {messages.length > 0 &&
                          (() => {
                            const lastMsg = messages[messages.length - 1];
                            const d = new Date(lastMsg.timestamp);
                            return (
                              <span className='ml-1.5 select-none text-[10px] font-light tabular-nums text-white/25'>
                                {d.toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })}{' '}
                                {d.toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true,
                                })}
                              </span>
                            );
                          })()}
                      </div>

                      {/* Flex spacer — header-wide drag handled by parent */}
                      <div className='h-3 flex-1' />

                      <div className='flex items-center'>
                        {isDocked ? (
                          <button
                            onClick={() => {
                              setDocked(false);
                              const pos = clampToViewport(
                                window.innerWidth - DEFAULT_PANEL_WIDTH - 40,
                                40,
                              );
                              setPosition(pos);
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
                            className='rounded-lg p-1.5 text-white/30 transition-all hover:bg-white/10 hover:text-white'
                            title='Undock panel'
                          >
                            <PanelRightOpen
                              size={14}
                              className='stroke-current'
                            />
                          </button>
                        ) : (
                          <button
                            onClick={() => setDocked(true)}
                            onMouseDown={(e) => e.stopPropagation()}
                            className='rounded-lg p-1.5 text-white/30 transition-all hover:bg-white/10 hover:text-white'
                            title='Anchor to side panel'
                          >
                            <PanelRightClose
                              size={14}
                              className='stroke-current'
                            />
                          </button>
                        )}
                        <button
                          onClick={handleClose}
                          onMouseDown={(e) => e.stopPropagation()}
                          className='rounded-lg p-1.5 text-white/30 transition-all hover:bg-white/10 hover:text-white'
                          title='Close panel'
                        >
                          <X size={14} className='stroke-current' />
                        </button>
                      </div>
                    </div>

                    {/* Messages */}
                    <OverseerChat
                      messages={messages}
                      className='min-h-[120px] flex-1'
                      editSuggestions={editSuggestions}
                      navigateSuggestion={navigateSuggestion}
                      onConfirmEdits={handleConfirmEdits}
                      onCancelEdits={handleCancelEdits}
                      isApplyingEdits={isApplyingEdits}
                      isThinking={isThinking}
                      toolActivitySteps={toolActivitySteps}
                      onActiveEditChange={handleActiveEditChange}
                      onEditStatusChange={handleEditStatusChange}
                    />

                    {/* Follow-up suggestions */}
                    <OverseerSuggestedQuestions
                      questions={suggestedQuestions}
                      onQuestionClick={handleQuestionClick}
                      disabled={isThinking && !hasEditSuggestions}
                    />

                    {/* Referenced text chip (above input) — Lovable blue style */}
                    {selectedText &&
                      selectedText.trim().length > 0 &&
                      contentExpanded && (
                        <div className='px-4 pt-2'>
                          <div className='flex items-center gap-2 rounded-lg border border-blue-400/25 bg-blue-500/10 px-2.5 py-2'>
                            <CornerDownRight
                              size={12}
                              className='shrink-0 stroke-white/60'
                            />
                            <p
                              className={cn(
                                'min-w-0 flex-1 cursor-pointer select-none text-[11px] text-white/70',
                                !isTextExpanded && 'truncate',
                              )}
                              onDoubleClick={() =>
                                setIsTextExpanded((prev) => !prev)
                              }
                              title='Double-click to expand/collapse'
                            >
                              {selectedText}
                            </p>
                            <button
                              onClick={() => {
                                clearHighlight();
                                setContentExpanded(false);
                                clearSelectedText();
                              }}
                              className='shrink-0 rounded p-0.5 text-white/30 transition-all hover:bg-white/10 hover:text-white'
                            >
                              <X size={12} className='stroke-current' />
                            </button>
                          </div>
                        </div>
                      )}

                    {/* Queue panel — shown above input when messages are queued */}
                    {messageQueue.length > 0 && (
                      <div className='mx-4 mt-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5'>
                        <div className='mb-1.5 flex items-center justify-between'>
                          <div className='flex items-center gap-2'>
                            <span className='text-[13px] font-medium text-white/60'>
                              Queue
                            </span>
                            <span className='flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-white/10 px-1 text-[10px] font-medium text-white/50'>
                              {messageQueue.length}
                            </span>
                          </div>
                          <div className='flex items-center gap-1'>
                            <button
                              onClick={toggleQueuePaused}
                              className={cn(
                                'rounded-full p-1 transition-colors',
                                isQueuePaused
                                  ? 'bg-white/15 text-white/70 hover:bg-white/20'
                                  : 'text-white/30 hover:bg-white/10 hover:text-white/60',
                              )}
                              aria-label={
                                isQueuePaused
                                  ? 'Resume processing queued messages'
                                  : 'Pause processing queued messages'
                              }
                              title={
                                isQueuePaused
                                  ? 'Resume processing queued messages'
                                  : 'Pause processing queued messages'
                              }
                            >
                              {isQueuePaused ? (
                                <Play size={12} className='fill-current' />
                              ) : (
                                <Pause size={12} className='fill-current' />
                              )}
                            </button>
                            <button
                              onClick={clearMessageQueue}
                              className='rounded p-0.5 text-white/30 transition-colors hover:bg-white/10 hover:text-white/60'
                              aria-label='Clear queue'
                            >
                              <X size={14} className='stroke-current' />
                            </button>
                          </div>
                        </div>
                        <div className='space-y-1'>
                          {messageQueue.map((item) => (
                            <div
                              key={item.uuid}
                              className='flex items-center gap-2 rounded-lg px-1 py-1'
                            >
                              <span className='truncate text-[13px] text-white/80'>
                                {item.content}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Input area with mention menu */}
                    <OverseerInput
                      value={currentMessage}
                      onChange={setCurrentMessage}
                      onSubmit={handleSubmitMessage}
                      disabled={hasEditSuggestions}
                      isThinking={isThinking}
                      onCancel={cancelCurrentRun}
                      prefillNonce={prefillNonce}
                      mentions={mentions}
                      onMentionSelect={addMention}
                      onMentionRemove={removeMention}
                      pendingImages={pendingImages}
                      onImageAdd={addImage}
                      onImageRemove={removeImage}
                      conceptItems={conceptItems}
                      personaItems={personaItems}
                      placeholder={
                        isThinking
                          ? messageQueue.length > 0
                            ? 'Type to queue another, or Enter to send queue now...'
                            : 'Type to queue a follow-up...'
                          : selectedText && selectedText.trim().length > 0
                            ? 'Ask anything about the selected content'
                            : 'Ask anything or type @ to tag'
                      }
                    />

                    {/* Feature toggle buttons (no border-t — matches Lovable) */}
                    <div className='flex items-center gap-1.5 px-4 py-2'>
                      {FEATURE_BUTTONS.filter(
                        (feat) => feat.key !== 'navigate' || isAdmin,
                      ).map((feat) => (
                        <button
                          key={feat.key}
                          onClick={() => toggleFeature(feat.key)}
                          className={cn(
                            'flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-medium transition-colors',
                            feat.key === 'navigate' &&
                              activeFeatures.has(feat.key)
                              ? 'border-red-400/40 bg-red-500/20 text-red-300'
                              : activeFeatures.has(feat.key)
                                ? 'border-blue-400/40 bg-blue-500/20 text-blue-300'
                                : 'border-white/10 text-white/40 hover:bg-white/[0.08] hover:text-white/80',
                          )}
                          title={feat.label}
                        >
                          <DynamicIcon
                            variant={feat.icon as 'globe'}
                            width={12}
                            height={12}
                            className='stroke-current'
                          />
                          <span>{feat.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Error display */}
                    {hasError && (
                      <div className='border-t border-red-500/30 bg-red-900/20 px-4 py-2'>
                        <p className='text-xs text-red-400'>
                          Something went wrong. Please try again.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );

  return createPortal(popupContent, document.body);
};

export default OverseerPopup;
