/**
 * Living Personas React Query Hooks
 *
 * Hooks for managing persona data with React Query.
 * Includes queries, mutations, and WebSocket event handling.
 */

import { AxiosError } from 'axios';
import { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import api from '@libs/api';
import { toast } from '@components';
import utils from '@libs/utils';
import { useSocketEvent } from '@hooks/sockets/aucctus';
import type {
  ILivingPersonasDocumentProcessingProgressMessage,
  ILivingPersonasEvidenceDiscoveredMessage,
  ILivingPersonasPersonaReadyMessage,
} from '@libs/api/types/socketMessages/inbound';
import type {
  IPersona,
  IPersonaListItem,
  ICreatePersonaPayload,
  IUpdatePersonaPayload,
  ICreateTagPayload,
  IUpdateDemographicsPayload,
  IReorderItemsPayload,
  ITrainingDocument,
  IEvidence,
  IChatSession,
  IChatSessionDetail,
  IStarterPromptsResponse,
  IMentionSearchResponse,
  IPersonaConversationSearchResponse,
  ICreateCustomWidgetPayload,
  IUpdateCustomWidgetPayload,
  ITaggedConcept,
} from '@libs/api/types/persona';

// ============================================
// Query Stale Times (ms)
// ============================================

const STALE_TIMES = {
  /** Default for persona list / detail data */
  standard: 1000 * 60 * 2, // 2 min
  /** Evidence and other rapidly-changing data */
  short: 1000 * 60 * 1, // 1 min
  /** Active chat session messages */
  realtime: 1000 * 30, // 30 sec
  /** Chat sessions list */
  medium: 1000 * 60 * 5, // 5 min
  /** Starter prompts and other rarely-changing data */
  long: 1000 * 60 * 10, // 10 min
} as const;

// ============================================
// Query Keys Factory
// ============================================

export const personaKeys = {
  all: ['personas'] as const,
  lists: () => [...personaKeys.all, 'list'] as const,
  list: () => [...personaKeys.lists()] as const,
  details: () => [...personaKeys.all, 'detail'] as const,
  detail: (uuid: string) => [...personaKeys.details(), uuid] as const,
  evidence: (uuid: string) => [...personaKeys.all, 'evidence', uuid] as const,
  trainingDocuments: (uuid: string) =>
    [...personaKeys.all, 'trainingDocuments', uuid] as const,
  chatSessions: (uuid: string) =>
    [...personaKeys.all, 'chatSessions', uuid] as const,
  chatSession: (personaUuid: string, sessionUuid: string) =>
    [...personaKeys.all, 'chatSession', personaUuid, sessionUuid] as const,
  starterPrompts: (uuid: string) =>
    [...personaKeys.all, 'starterPrompts', uuid] as const,
  conversationSearch: (uuid: string, message?: string, page?: number) =>
    [...personaKeys.all, 'conversationSearch', uuid, message, page] as const,
  taggedConcepts: (uuid: string) =>
    [...personaKeys.all, 'taggedConcepts', uuid] as const,
  mentionSearch: (query: string, type?: string, excludePersona?: string) =>
    ['mentionSearch', query, type, excludePersona] as const,
};

// ============================================
// Persona List Query
// ============================================

export const usePersonas = () => {
  const query = useQuery({
    queryKey: personaKeys.list(),
    queryFn: async (): Promise<IPersonaListItem[]> => {
      return await api.persona.getPersonas();
    },
    staleTime: STALE_TIMES.standard,
    cacheTime: 1000 * 60 * 5, // 5 minutes
    onError: (e: AxiosError) => {
      if (e.response?.status !== 404) {
        const message = utils.osiris.parseFormError(e);
        toast.error(
          'Failed to Load Personas',
          message || 'Unable to load personas. Please try again.',
        );
      }
    },
  });

  return {
    personas: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

// ============================================
// Persona Detail Query
// ============================================

export const usePersona = (personaUuid: string) => {
  const query = useQuery({
    queryKey: personaKeys.detail(personaUuid),
    queryFn: async (): Promise<IPersona> => {
      return await api.persona.getPersona(personaUuid);
    },
    enabled: !!personaUuid,
    staleTime: STALE_TIMES.standard,
    cacheTime: 1000 * 60 * 5, // 5 minutes
    onError: (e: AxiosError) => {
      if (e.response?.status !== 404) {
        const message = utils.osiris.parseFormError(e);
        toast.error(
          'Failed to Load Persona',
          message || 'Unable to load persona details. Please try again.',
        );
      }
    },
  });

  return {
    persona: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

// ============================================
// Tagged Concepts Query
// ============================================

export const useTaggedConcepts = (personaUuid: string) => {
  const query = useQuery({
    queryKey: personaKeys.taggedConcepts(personaUuid),
    queryFn: async (): Promise<ITaggedConcept[]> => {
      return await api.persona.getTaggedConcepts(personaUuid);
    },
    enabled: !!personaUuid,
    staleTime: STALE_TIMES.standard,
    cacheTime: 1000 * 60 * 5,
  });

  return {
    concepts: query.data ?? [],
    isLoading: query.isLoading,
  };
};

// ============================================
// Persona CRUD Mutations
// ============================================

export const useCreatePersona = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: ICreatePersonaPayload) => {
      return await api.persona.createPersona(data);
    },
    onSuccess: (newPersona) => {
      queryClient.invalidateQueries({ queryKey: personaKeys.lists() });
      toast.success(
        'Persona Created',
        `${newPersona.name} has been created successfully.`,
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Creation Failed',
        message || 'Unable to create persona. Please try again.',
      );
    },
  });

  return {
    createPersona: mutation.mutate,
    createPersonaAsync: mutation.mutateAsync,
    isCreating: mutation.isLoading,
  };
};

export const useUpdatePersona = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      personaUuid,
      data,
    }: {
      personaUuid: string;
      data: IUpdatePersonaPayload;
    }) => {
      return await api.persona.updatePersona(personaUuid, data);
    },
    onSuccess: (updatedPersona, { personaUuid }) => {
      queryClient.invalidateQueries({
        queryKey: personaKeys.detail(personaUuid),
      });
      queryClient.invalidateQueries({ queryKey: personaKeys.lists() });
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Update Failed',
        message || 'Unable to update persona. Please try again.',
      );
    },
  });

  return {
    updatePersona: mutation.mutate,
    updatePersonaAsync: mutation.mutateAsync,
    isUpdating: mutation.isLoading,
  };
};

export const useDeletePersona = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (personaUuid: string) => {
      return await api.persona.deletePersona(personaUuid);
    },
    onSuccess: (_, personaUuid) => {
      queryClient.invalidateQueries({ queryKey: personaKeys.lists() });
      queryClient.removeQueries({ queryKey: personaKeys.detail(personaUuid) });
      toast.success('Persona Deleted', 'The persona has been deleted.');
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Deletion Failed',
        message || 'Unable to delete persona. Please try again.',
      );
    },
  });

  return {
    deletePersona: mutation.mutate,
    deletePersonaAsync: mutation.mutateAsync,
    isDeleting: mutation.isLoading,
  };
};

// ============================================
// Tag Mutations
// ============================================

export const useAddTag = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      personaUuid,
      data,
    }: {
      personaUuid: string;
      data: ICreateTagPayload;
    }) => {
      return await api.persona.addTag(personaUuid, data);
    },
    onSuccess: (serverTags, { personaUuid }) => {
      // Replace all tags with the server response (backend returns full tag list)
      queryClient.setQueryData<IPersona | undefined>(
        personaKeys.detail(personaUuid),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            tags: serverTags,
          };
        },
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error('Failed to Add Tag', message || 'Unable to add tag.');
    },
  });

  return {
    addTag: mutation.mutate,
    addTagAsync: mutation.mutateAsync,
    isAdding: mutation.isLoading,
  };
};

export const useRemoveTag = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      personaUuid,
      tagUuid,
    }: {
      personaUuid: string;
      tagUuid: string;
    }) => {
      return await api.persona.removeTag(personaUuid, tagUuid);
    },
    onMutate: async ({ personaUuid, tagUuid }) => {
      await queryClient.cancelQueries({
        queryKey: personaKeys.detail(personaUuid),
      });
      const previous = queryClient.getQueryData<IPersona>(
        personaKeys.detail(personaUuid),
      );
      if (previous) {
        queryClient.setQueryData<IPersona>(personaKeys.detail(personaUuid), {
          ...previous,
          tags: previous.tags.filter((t) => t.uuid !== tagUuid),
        });
      }
      return { previous, personaUuid };
    },
    onError: (e: AxiosError, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          personaKeys.detail(context.personaUuid),
          context.previous,
        );
      }
      const message = utils.osiris.parseFormError(e);
      toast.error('Failed to Remove Tag', message || 'Unable to remove tag.');
    },
    onSettled: (_data, _error, { personaUuid }) => {
      queryClient.invalidateQueries({
        queryKey: personaKeys.detail(personaUuid),
      });
    },
  });

  return {
    removeTag: mutation.mutate,
    removeTagAsync: mutation.mutateAsync,
    isRemoving: mutation.isLoading,
  };
};

// ============================================
// Demographics Mutation
// ============================================

export const useUpdateDemographics = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      personaUuid,
      data,
    }: {
      personaUuid: string;
      data: IUpdateDemographicsPayload;
    }) => {
      return await api.persona.updateDemographics(personaUuid, data);
    },
    onSuccess: (_, { personaUuid }) => {
      queryClient.invalidateQueries({
        queryKey: personaKeys.detail(personaUuid),
      });
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error('Update Failed', message || 'Unable to update demographics.');
    },
  });

  return {
    updateDemographics: mutation.mutate,
    updateDemographicsAsync: mutation.mutateAsync,
    isUpdating: mutation.isLoading,
  };
};

// ============================================
// Nested Content Mutation Factory
// ============================================

type ContentType =
  | 'job'
  | 'pain'
  | 'gain'
  | 'socialValue'
  | 'motivation'
  | 'behaviour'
  | 'keyFact'
  | 'quote'
  | 'workdayStep'
  | 'chartData';

const contentTypeConfig: Record<
  ContentType,
  {
    add: (uuid: string, data: any) => Promise<any>;
    update: (uuid: string, itemUuid: string, data: any) => Promise<any>;
    delete: (uuid: string, itemUuid: string) => Promise<any>;
    reorder: (uuid: string, data: IReorderItemsPayload) => Promise<any>;
    label: string;
  }
> = {
  job: {
    add: (uuid, data) => api.persona.addJob(uuid, data),
    update: (uuid, itemUuid, data) =>
      api.persona.updateJob(uuid, itemUuid, data),
    delete: (uuid, itemUuid) => api.persona.deleteJob(uuid, itemUuid),
    reorder: (uuid, data) => api.persona.reorderJobs(uuid, data),
    label: 'Job',
  },
  pain: {
    add: (uuid, data) => api.persona.addPain(uuid, data),
    update: (uuid, itemUuid, data) =>
      api.persona.updatePain(uuid, itemUuid, data),
    delete: (uuid, itemUuid) => api.persona.deletePain(uuid, itemUuid),
    reorder: (uuid, data) => api.persona.reorderPains(uuid, data),
    label: 'Pain Point',
  },
  gain: {
    add: (uuid, data) => api.persona.addGain(uuid, data),
    update: (uuid, itemUuid, data) =>
      api.persona.updateGain(uuid, itemUuid, data),
    delete: (uuid, itemUuid) => api.persona.deleteGain(uuid, itemUuid),
    reorder: (uuid, data) => api.persona.reorderGains(uuid, data),
    label: 'Gain',
  },
  socialValue: {
    add: (uuid, data) => api.persona.addSocialValue(uuid, data),
    update: (uuid, itemUuid, data) =>
      api.persona.updateSocialValue(uuid, itemUuid, data),
    delete: (uuid, itemUuid) => api.persona.deleteSocialValue(uuid, itemUuid),
    reorder: (uuid, data) => api.persona.reorderSocialValues(uuid, data),
    label: 'Social Value',
  },
  motivation: {
    add: (uuid, data) => api.persona.addMotivation(uuid, data),
    update: (uuid, itemUuid, data) =>
      api.persona.updateMotivation(uuid, itemUuid, data),
    delete: (uuid, itemUuid) => api.persona.deleteMotivation(uuid, itemUuid),
    reorder: (uuid, data) => api.persona.reorderMotivations(uuid, data),
    label: 'Motivation',
  },
  behaviour: {
    add: (uuid, data) => api.persona.addBehaviour(uuid, data),
    update: (uuid, itemUuid, data) =>
      api.persona.updateBehaviour(uuid, itemUuid, data),
    delete: (uuid, itemUuid) => api.persona.deleteBehaviour(uuid, itemUuid),
    reorder: (uuid, data) => api.persona.reorderBehaviours(uuid, data),
    label: 'Behaviour',
  },
  keyFact: {
    add: (uuid, data) => api.persona.addKeyFact(uuid, data),
    update: (uuid, itemUuid, data) =>
      api.persona.updateKeyFact(uuid, itemUuid, data),
    delete: (uuid, itemUuid) => api.persona.deleteKeyFact(uuid, itemUuid),
    reorder: (uuid, data) => api.persona.reorderKeyFacts(uuid, data),
    label: 'Key Fact',
  },
  quote: {
    add: (uuid, data) => api.persona.addQuote(uuid, data),
    update: (uuid, itemUuid, data) =>
      api.persona.updateQuote(uuid, itemUuid, data),
    delete: (uuid, itemUuid) => api.persona.deleteQuote(uuid, itemUuid),
    reorder: (uuid, data) => api.persona.reorderQuotes(uuid, data),
    label: 'Quote',
  },
  workdayStep: {
    add: (uuid, data) => api.persona.addWorkdayStep(uuid, data),
    update: (uuid, itemUuid, data) =>
      api.persona.updateWorkdayStep(uuid, itemUuid, data),
    delete: (uuid, itemUuid) => api.persona.deleteWorkdayStep(uuid, itemUuid),
    reorder: (uuid, data) => api.persona.reorderWorkdaySteps(uuid, data),
    label: 'Workday Step',
  },
  chartData: {
    add: (uuid, data) => api.persona.addChartData(uuid, data),
    update: (uuid, itemUuid, data) =>
      api.persona.updateChartData(uuid, itemUuid, data),
    delete: (uuid, itemUuid) => api.persona.deleteChartData(uuid, itemUuid),
    reorder: (uuid, data) => api.persona.reorderChartData(uuid, data),
    label: 'Chart Data',
  },
};

export const usePersonaContentMutations = (
  personaUuid: string,
  contentType: ContentType,
) => {
  const queryClient = useQueryClient();
  const config = contentTypeConfig[contentType];

  const addMutation = useMutation({
    mutationFn: async (data: any) => {
      return await config.add(personaUuid, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: personaKeys.detail(personaUuid),
      });
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        `Failed to Add ${config.label}`,
        message || 'Please try again.',
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ itemUuid, data }: { itemUuid: string; data: any }) => {
      return await config.update(personaUuid, itemUuid, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: personaKeys.detail(personaUuid),
      });
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        `Failed to Update ${config.label}`,
        message || 'Please try again.',
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (itemUuid: string) => {
      return await config.delete(personaUuid, itemUuid);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: personaKeys.detail(personaUuid),
      });
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        `Failed to Delete ${config.label}`,
        message || 'Please try again.',
      );
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (data: IReorderItemsPayload) => {
      return await config.reorder(personaUuid, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: personaKeys.detail(personaUuid),
      });
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        `Failed to Reorder ${config.label}s`,
        message || 'Please try again.',
      );
    },
  });

  return {
    add: addMutation.mutate,
    addAsync: addMutation.mutateAsync,
    isAdding: addMutation.isLoading,
    update: updateMutation.mutate,
    updateAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isLoading,
    delete: deleteMutation.mutate,
    deleteAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isLoading,
    reorder: reorderMutation.mutate,
    reorderAsync: reorderMutation.mutateAsync,
    isReordering: reorderMutation.isLoading,
  };
};

// ============================================
// Training Documents
// ============================================

export const useTrainingDocuments = (personaUuid: string) => {
  const query = useQuery({
    queryKey: personaKeys.trainingDocuments(personaUuid),
    queryFn: async (): Promise<ITrainingDocument[]> => {
      return await api.persona.getTrainingDocuments(personaUuid);
    },
    enabled: !!personaUuid,
    staleTime: STALE_TIMES.standard,
    cacheTime: 1000 * 60 * 5,
    onError: (e: AxiosError) => {
      if (e.response?.status !== 404) {
        toast.error(
          'Failed to Load Documents',
          'Unable to load training documents.',
        );
      }
    },
  });

  return {
    documents: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};

export const useUploadTrainingDocument = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      personaUuid,
      file,
    }: {
      personaUuid: string;
      file: File;
    }) => {
      return await api.persona.uploadTrainingDocument(personaUuid, file);
    },
    onSuccess: (result, { personaUuid }) => {
      queryClient.invalidateQueries({
        queryKey: personaKeys.trainingDocuments(personaUuid),
      });
      toast.success(
        'Document Uploaded',
        `${result.filename} is being processed.`,
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error('Upload Failed', message || 'Unable to upload document.');
    },
  });

  return {
    uploadDocument: mutation.mutate,
    uploadDocumentAsync: mutation.mutateAsync,
    isUploading: mutation.isLoading,
  };
};

export const useDeleteTrainingDocument = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      personaUuid,
      documentUuid,
    }: {
      personaUuid: string;
      documentUuid: string;
    }) => {
      return await api.persona.deleteTrainingDocument(
        personaUuid,
        documentUuid,
      );
    },
    onSuccess: (_, { personaUuid }) => {
      queryClient.invalidateQueries({
        queryKey: personaKeys.trainingDocuments(personaUuid),
      });
      toast.success('Document Deleted', 'The document has been removed.');
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error('Deletion Failed', message || 'Unable to delete document.');
    },
  });

  return {
    deleteDocument: mutation.mutate,
    deleteDocumentAsync: mutation.mutateAsync,
    isDeleting: mutation.isLoading,
  };
};

// ============================================
// Evidence
// ============================================

export const useEvidence = (
  personaUuid: string,
  status?: 'pending' | 'accepted' | 'ignored' | 'all',
) => {
  const query = useQuery({
    queryKey: [...personaKeys.evidence(personaUuid), status],
    queryFn: async (): Promise<IEvidence[]> => {
      return await api.persona.getEvidence(personaUuid, status);
    },
    enabled: !!personaUuid,
    staleTime: STALE_TIMES.short,
    cacheTime: 1000 * 60 * 5,
    onError: (e: AxiosError) => {
      if (e.response?.status !== 404) {
        toast.error(
          'Failed to Load Evidence',
          'Unable to load evidence items.',
        );
      }
    },
  });

  return {
    evidence: query.data ?? [],
    pendingCount: query.data?.filter((e) => e.status === 'pending').length ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};

export const useAcceptEvidence = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      personaUuid,
      evidenceUuid,
    }: {
      personaUuid: string;
      evidenceUuid: string;
    }) => {
      return await api.persona.acceptEvidence(personaUuid, evidenceUuid);
    },
    onSuccess: (_, { personaUuid }) => {
      queryClient.invalidateQueries({
        queryKey: personaKeys.evidence(personaUuid),
      });
      queryClient.invalidateQueries({
        queryKey: personaKeys.detail(personaUuid),
      });
      toast.success('Evidence Accepted', 'The update has been applied.');
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error('Action Failed', message || 'Unable to accept evidence.');
    },
  });

  return {
    acceptEvidence: mutation.mutate,
    acceptEvidenceAsync: mutation.mutateAsync,
    isAccepting: mutation.isLoading,
  };
};

export const useIgnoreEvidence = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      personaUuid,
      evidenceUuid,
    }: {
      personaUuid: string;
      evidenceUuid: string;
    }) => {
      return await api.persona.ignoreEvidence(personaUuid, evidenceUuid);
    },
    onSuccess: (_, { personaUuid }) => {
      queryClient.invalidateQueries({
        queryKey: personaKeys.evidence(personaUuid),
      });
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error('Action Failed', message || 'Unable to ignore evidence.');
    },
  });

  return {
    ignoreEvidence: mutation.mutate,
    ignoreEvidenceAsync: mutation.mutateAsync,
    isIgnoring: mutation.isLoading,
  };
};

export const useAcceptAllEvidence = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (personaUuid: string) => {
      return await api.persona.acceptAllEvidence(personaUuid);
    },
    onSuccess: (_, personaUuid) => {
      queryClient.invalidateQueries({
        queryKey: personaKeys.evidence(personaUuid),
      });
      queryClient.invalidateQueries({
        queryKey: personaKeys.detail(personaUuid),
      });
      toast.success('All Evidence Accepted', 'All updates have been applied.');
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error('Action Failed', message || 'Unable to accept all evidence.');
    },
  });

  return {
    acceptAllEvidence: mutation.mutate,
    acceptAllEvidenceAsync: mutation.mutateAsync,
    isAcceptingAll: mutation.isLoading,
  };
};

// ============================================
// Chat
// ============================================

export const useChatSessions = (personaUuid: string) => {
  const query = useQuery({
    queryKey: personaKeys.chatSessions(personaUuid),
    queryFn: async (): Promise<IChatSession[]> => {
      return await api.persona.getChatSessions(personaUuid);
    },
    enabled: !!personaUuid,
    staleTime: STALE_TIMES.medium,
    cacheTime: 1000 * 60 * 10,
    onError: (e: AxiosError) => {
      if (e.response?.status !== 404) {
        toast.error('Failed to Load Sessions', 'Unable to load chat sessions.');
      }
    },
  });

  return {
    sessions: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};

export const useChatSession = (personaUuid: string, sessionUuid: string) => {
  const query = useQuery({
    queryKey: personaKeys.chatSession(personaUuid, sessionUuid),
    queryFn: async (): Promise<IChatSessionDetail> => {
      return await api.persona.getChatSession(personaUuid, sessionUuid);
    },
    enabled: !!personaUuid && !!sessionUuid,
    staleTime: STALE_TIMES.realtime,
    cacheTime: 1000 * 60 * 5,
    onError: (e: AxiosError) => {
      if (e.response?.status !== 404) {
        toast.error('Failed to Load Chat', 'Unable to load chat session.');
      }
    },
  });

  return {
    session: query.data,
    messages: query.data?.messages ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};

export const useDeleteChatSession = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      personaUuid,
      sessionUuid,
    }: {
      personaUuid: string;
      sessionUuid: string;
    }) => {
      return await api.persona.deleteChatSession(personaUuid, sessionUuid);
    },
    onSuccess: (_, { personaUuid, sessionUuid }) => {
      queryClient.invalidateQueries({
        queryKey: personaKeys.chatSessions(personaUuid),
      });
      queryClient.removeQueries({
        queryKey: personaKeys.chatSession(personaUuid, sessionUuid),
      });
      toast.success('Session Deleted', 'The chat session has been deleted.');
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error('Deletion Failed', message || 'Unable to delete session.');
    },
  });

  return {
    deleteSession: mutation.mutate,
    deleteSessionAsync: mutation.mutateAsync,
    isDeleting: mutation.isLoading,
  };
};

export const useStarterPrompts = (personaUuid: string) => {
  const query = useQuery({
    queryKey: personaKeys.starterPrompts(personaUuid),
    queryFn: async (): Promise<IStarterPromptsResponse> => {
      return await api.persona.getStarterPrompts(personaUuid);
    },
    enabled: !!personaUuid,
    staleTime: STALE_TIMES.long,
    cacheTime: 1000 * 60 * 30,
    onError: () => {
      // Silent failure for starter prompts
    },
  });

  return {
    prompts: query.data?.prompts ?? [],
    isLoading: query.isLoading,
  };
};

// ============================================
// Conversation Search
// ============================================

export const usePersonaConversationSearch = (
  personaUuid: string,
  filterOptions?: { message?: string; page?: number },
) => {
  return useQuery({
    queryKey: personaKeys.conversationSearch(
      personaUuid,
      filterOptions?.message,
      filterOptions?.page,
    ),
    queryFn: async (): Promise<IPersonaConversationSearchResponse> => {
      return await api.persona.searchConversations(personaUuid, filterOptions);
    },
    enabled: !!personaUuid,
    staleTime: STALE_TIMES.short,
    cacheTime: 1000 * 60 * 2,
    onError: (e: AxiosError) => {
      if (e.response?.status === 404) return;
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Search Failed',
        message || 'Unable to search conversations. Please try again.',
      );
    },
  });
};

// ============================================
// Mention Search
// ============================================

export const useMentionSearch = (
  query: string | null,
  type?: 'concept' | 'persona' | 'all',
  excludePersona?: string,
) => {
  const searchQuery = useQuery({
    queryKey: personaKeys.mentionSearch(query ?? '', type, excludePersona),
    queryFn: async (): Promise<IMentionSearchResponse> => {
      return await api.persona.searchMentions(
        query ?? '',
        type,
        excludePersona,
      );
    },
    enabled: query !== null, // Enabled when query is not null (empty string returns recent items)
    staleTime: STALE_TIMES.short,
    cacheTime: 1000 * 60 * 5,
    onError: () => {
      // Silent failure for autocomplete
    },
  });

  return {
    results: searchQuery.data?.results ?? [],
    isSearching: searchQuery.isLoading,
  };
};

// ============================================
// WebSocket Events
// ============================================

export type DocumentProcessingStage =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'started'
  | 'extracting'
  | 'analyzing'
  | 'creating_evidence';

export interface PersonaDocumentProcessingProgress {
  isProcessing: boolean;
  documentUuid: string | null;
  stage: DocumentProcessingStage | null;
  progress: number;
  message: string;
}

const DEFAULT_PROCESSING_PROGRESS: PersonaDocumentProcessingProgress = {
  isProcessing: false,
  documentUuid: null,
  stage: null,
  progress: 0,
  message: '',
};

export interface PersonaEvidenceUpdate {
  personaUuid: string;
  evidenceCount: number;
}

export const usePersonaSocketEvents = (personaUuid: string) => {
  const queryClient = useQueryClient();
  const [processingProgress, setProcessingProgress] =
    useState<PersonaDocumentProcessingProgress>(DEFAULT_PROCESSING_PROGRESS);

  // Listen for document processing progress
  useSocketEvent<
    'living_personas.document.processing.progress.account',
    ILivingPersonasDocumentProcessingProgressMessage
  >(
    'living_personas.document.processing.progress.account',
    useCallback(
      (data: ILivingPersonasDocumentProcessingProgressMessage) => {
        if (data.personaUuid !== personaUuid) return;

        if (data.stage === 'completed') {
          setProcessingProgress(DEFAULT_PROCESSING_PROGRESS);
          queryClient.invalidateQueries({
            queryKey: personaKeys.trainingDocuments(personaUuid),
          });
          queryClient.invalidateQueries({
            queryKey: personaKeys.evidence(personaUuid),
          });
          toast.success(
            'Document Processed',
            `${data.filename || 'Document'} has been analyzed.`,
          );
        } else if (data.stage === 'failed') {
          setProcessingProgress({
            isProcessing: false,
            documentUuid: data.documentUuid,
            stage: 'failed',
            progress: 0,
            message: data.message || 'Processing failed',
          });
          toast.error(
            'Processing Failed',
            data.message || 'Document processing failed.',
          );
        } else {
          setProcessingProgress({
            isProcessing: true,
            documentUuid: data.documentUuid,
            stage: data.stage,
            progress: data.progress || 0,
            message: data.message || 'Processing...',
          });
        }
      },
      [personaUuid, queryClient],
    ),
  );

  // Listen for new evidence discovered
  useSocketEvent<
    'living_personas.evidence.discovered.account',
    ILivingPersonasEvidenceDiscoveredMessage
  >(
    'living_personas.evidence.discovered.account',
    useCallback(
      (data: ILivingPersonasEvidenceDiscoveredMessage) => {
        if (data.personaUuid !== personaUuid) return;

        queryClient.invalidateQueries({
          queryKey: personaKeys.evidence(personaUuid),
        });
        toast.info(
          'New Evidence Found',
          `${data.evidenceCount || 'New'} updates discovered for this persona.`,
        );
      },
      [personaUuid, queryClient],
    ),
  );

  // Listen for persona ready (draft persona becomes initialized)
  useSocketEvent<
    'living_personas.persona.ready.account',
    ILivingPersonasPersonaReadyMessage
  >(
    'living_personas.persona.ready.account',
    useCallback(
      (data: ILivingPersonasPersonaReadyMessage) => {
        // Invalidate the list to show the newly initialized persona
        queryClient.invalidateQueries({ queryKey: personaKeys.lists() });
        // Also invalidate the detail if we're viewing this persona
        if (data.personaUuid === personaUuid) {
          queryClient.invalidateQueries({
            queryKey: personaKeys.detail(personaUuid),
          });
        }
      },
      [personaUuid, queryClient],
    ),
  );

  return {
    processingProgress,
    isProcessingDocument: processingProgress.isProcessing,
    resetProcessingProgress: useCallback(
      () => setProcessingProgress(DEFAULT_PROCESSING_PROGRESS),
      [],
    ),
  };
};

// ============================================
// Custom Widget Mutations
// ============================================

export const useCustomWidgetMutations = (personaUuid: string) => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: personaKeys.detail(personaUuid),
    });
    queryClient.invalidateQueries({ queryKey: personaKeys.list() });
  };

  // Widget-level mutations
  const createWidgetMutation = useMutation({
    mutationFn: async (data: ICreateCustomWidgetPayload) => {
      return await api.persona.createCustomWidget(personaUuid, data);
    },
    onSuccess: () => {
      invalidate();
      toast.success('Widget Created', 'Custom widget has been added.');
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error('Failed to Create Widget', message || 'Please try again.');
    },
  });

  const updateWidgetMutation = useMutation({
    mutationFn: async ({
      widgetUuid,
      data,
    }: {
      widgetUuid: string;
      data: IUpdateCustomWidgetPayload;
    }) => {
      return await api.persona.updateCustomWidget(
        personaUuid,
        widgetUuid,
        data,
      );
    },
    onSuccess: () => {
      invalidate();
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error('Failed to Update Widget', message || 'Please try again.');
    },
  });

  const deleteWidgetMutation = useMutation({
    mutationFn: async (widgetUuid: string) => {
      return await api.persona.deleteCustomWidget(personaUuid, widgetUuid);
    },
    onSuccess: () => {
      invalidate();
      toast.success('Widget Deleted', 'Custom widget has been removed.');
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error('Failed to Delete Widget', message || 'Please try again.');
    },
  });

  const reorderWidgetsMutation = useMutation({
    mutationFn: async (data: IReorderItemsPayload) => {
      return await api.persona.reorderCustomWidgets(personaUuid, data);
    },
    onSuccess: () => {
      invalidate();
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error('Failed to Reorder Widgets', message || 'Please try again.');
    },
  });

  // Item-level mutations
  const addItemMutation = useMutation({
    mutationFn: async ({
      widgetUuid,
      data,
    }: {
      widgetUuid: string;
      data: Record<string, unknown>;
    }) => {
      return await api.persona.addCustomWidgetItem(
        personaUuid,
        widgetUuid,
        data,
      );
    },
    onSuccess: () => {
      invalidate();
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error('Failed to Add Item', message || 'Please try again.');
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({
      widgetUuid,
      itemUuid,
      data,
    }: {
      widgetUuid: string;
      itemUuid: string;
      data: Record<string, unknown>;
    }) => {
      return await api.persona.updateCustomWidgetItem(
        personaUuid,
        widgetUuid,
        itemUuid,
        data,
      );
    },
    onSuccess: () => {
      invalidate();
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error('Failed to Update Item', message || 'Please try again.');
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async ({
      widgetUuid,
      itemUuid,
    }: {
      widgetUuid: string;
      itemUuid: string;
    }) => {
      return await api.persona.deleteCustomWidgetItem(
        personaUuid,
        widgetUuid,
        itemUuid,
      );
    },
    onSuccess: () => {
      invalidate();
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error('Failed to Delete Item', message || 'Please try again.');
    },
  });

  const reorderItemsMutation = useMutation({
    mutationFn: async ({
      widgetUuid,
      data,
    }: {
      widgetUuid: string;
      data: IReorderItemsPayload;
    }) => {
      return await api.persona.reorderCustomWidgetItems(
        personaUuid,
        widgetUuid,
        data,
      );
    },
    onSuccess: () => {
      invalidate();
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error('Failed to Reorder Items', message || 'Please try again.');
    },
  });

  return {
    createWidget: createWidgetMutation.mutate,
    createWidgetAsync: createWidgetMutation.mutateAsync,
    isCreatingWidget: createWidgetMutation.isLoading,
    updateWidget: updateWidgetMutation.mutate,
    deleteWidget: deleteWidgetMutation.mutate,
    reorderWidgets: reorderWidgetsMutation.mutate,
    addItem: addItemMutation.mutate,
    updateItem: updateItemMutation.mutate,
    deleteItem: deleteItemMutation.mutate,
    reorderItems: reorderItemsMutation.mutate,
    isAddingItem: addItemMutation.isLoading,
  };
};

// ============================================
// Combined Hook for Persona Detail Page
// ============================================

export const useLivingPersona = (personaUuid: string) => {
  const personaQuery = usePersona(personaUuid);
  const evidenceQuery = useEvidence(personaUuid, 'pending');
  const socketEvents = usePersonaSocketEvents(personaUuid);

  return {
    // Persona data
    persona: personaQuery.persona,
    isLoading: personaQuery.isLoading,
    isError: personaQuery.isError,
    refetch: personaQuery.refetch,

    // Evidence
    pendingEvidence: evidenceQuery.evidence,
    pendingEvidenceCount: evidenceQuery.pendingCount,
    isLoadingEvidence: evidenceQuery.isLoading,

    // Document processing
    isProcessingDocument: socketEvents.isProcessingDocument,
    processingProgress: socketEvents.processingProgress,
  };
};
