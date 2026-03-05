/**
 * Nucleus Overview Widget React Query Hooks
 *
 * Provides data fetching and mutation hooks for the Nucleus Overview tab.
 * Widgets are AI-generated from nucleus research, then user-editable.
 */

import { toast } from '@components';
import api from '@libs/api';
import type {
  INucleusOverviewWidget,
  ICreateNucleusOverviewWidgetPayload,
  IUpdateNucleusOverviewWidgetPayload,
  IReorderOverviewItemsPayload,
  NucleusOverviewWidgetType,
} from '@libs/api/types/nucleusOverview';
import utils from '@libs/utils';
import { AxiosError } from 'axios';
import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';

import { AucctusQueryKeys } from './query-keys';

// ============================================
// Query Keys
// ============================================

export const nucleusOverviewKeys = {
  all: [AucctusQueryKeys.nucleusOverviewWidgets] as const,
  widgets: (reportUuid: string) =>
    [...nucleusOverviewKeys.all, reportUuid] as const,
};

// ============================================
// Optimistic Update Helpers
// ============================================

/** Maps widget type to the key of its items array on INucleusOverviewWidget. */
const WIDGET_ITEMS_KEY: Record<
  NucleusOverviewWidgetType,
  keyof INucleusOverviewWidget | null
> = {
  thesis: null,
  card_list: 'cardListItems',
  checklist: 'checklistItems',
  accordion: 'accordionItems',
  visualization: 'visualizationItems',
  constrained_text: 'constrainedTextItems',
};

type WidgetCacheContext = {
  previousWidgets: INucleusOverviewWidget[] | undefined;
};

/**
 * Snapshot the widgets cache and apply an optimistic transform.
 * Returns the previous data for rollback on error.
 */
function optimisticWidgetUpdate(
  queryClient: QueryClient,
  reportUuid: string,
  transform: (widgets: INucleusOverviewWidget[]) => INucleusOverviewWidget[],
): WidgetCacheContext {
  const queryKey = nucleusOverviewKeys.widgets(reportUuid);
  queryClient.cancelQueries(queryKey);
  const previousWidgets =
    queryClient.getQueryData<INucleusOverviewWidget[]>(queryKey);
  if (previousWidgets) {
    queryClient.setQueryData<INucleusOverviewWidget[]>(
      queryKey,
      transform(previousWidgets),
    );
  }
  return { previousWidgets };
}

// ============================================
// Query Hooks
// ============================================

/**
 * Fetch all overview widgets (with items) for a nucleus report.
 */
export const useNucleusOverviewWidgets = (reportUuid: string | undefined) => {
  const query = useQuery({
    queryKey: nucleusOverviewKeys.widgets(reportUuid ?? ''),
    queryFn: async (): Promise<INucleusOverviewWidget[]> => {
      return await api.nucleus.getOverviewWidgets(reportUuid!);
    },
    enabled: !!reportUuid,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
    onError: (e: AxiosError) => {
      if (e.response?.status !== 404) {
        const message = utils.osiris.parseFormError(e);
        toast.error(
          'Overview Fetch Failed',
          message || 'Unable to fetch overview widgets. Please try again',
        );
      }
    },
  });

  return {
    ...query,
    widgets: query.data ?? [],
    hasWidgets: (query.data ?? []).length > 0,
  };
};

// ============================================
// Mutation Hooks
// ============================================

/**
 * Trigger AI generation of overview widgets.
 */
export const useGenerateNucleusOverview = (reportUuid: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return await api.nucleus.generateOverview(reportUuid!);
    },
    onSuccess: () => {
      // Invalidate the report query so overviewStatus updates to 'generating' promptly
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.nucleusReportLatest],
      });
      toast.success(
        'Overview Generation Started',
        'AI is generating your strategic overview.',
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Generation Failed',
        message || 'Unable to generate overview. Please try again',
      );
    },
    onSettled: () => {
      if (reportUuid) {
        queryClient.invalidateQueries(nucleusOverviewKeys.widgets(reportUuid));
      }
    },
  });
};

/**
 * Create a new overview widget.
 */
export const useCreateOverviewWidget = (reportUuid: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ICreateNucleusOverviewWidgetPayload) => {
      return await api.nucleus.createOverviewWidget(reportUuid!, data);
    },
    onSuccess: () => {
      if (reportUuid) {
        queryClient.invalidateQueries(nucleusOverviewKeys.widgets(reportUuid));
      }
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Create Widget Failed',
        message || 'Unable to create widget.',
      );
    },
  });
};

/**
 * Update an overview widget's metadata (optimistic).
 */
export const useUpdateOverviewWidget = (reportUuid: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      widgetUuid,
      data,
    }: {
      widgetUuid: string;
      data: IUpdateNucleusOverviewWidgetPayload;
    }) => {
      return await api.nucleus.updateOverviewWidget(
        reportUuid!,
        widgetUuid,
        data,
      );
    },
    onMutate: async ({ widgetUuid, data }) => {
      if (!reportUuid) return;
      return optimisticWidgetUpdate(queryClient, reportUuid, (widgets) =>
        widgets.map((w) => (w.uuid === widgetUuid ? { ...w, ...data } : w)),
      );
    },
    onError: (e: AxiosError, _vars, context?: WidgetCacheContext) => {
      if (context?.previousWidgets && reportUuid) {
        queryClient.setQueryData(
          nucleusOverviewKeys.widgets(reportUuid),
          context.previousWidgets,
        );
      }
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Update Widget Failed',
        message || 'Unable to update widget.',
      );
    },
    onSettled: () => {
      if (reportUuid) {
        queryClient.invalidateQueries(nucleusOverviewKeys.widgets(reportUuid));
      }
    },
  });
};

/**
 * Delete an overview widget.
 */
export const useDeleteOverviewWidget = (reportUuid: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (widgetUuid: string) => {
      return await api.nucleus.deleteOverviewWidget(reportUuid!, widgetUuid);
    },
    onSuccess: () => {
      if (reportUuid) {
        queryClient.invalidateQueries(nucleusOverviewKeys.widgets(reportUuid));
      }
      toast.success('Widget Deleted', 'Widget has been removed.');
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Delete Widget Failed',
        message || 'Unable to delete widget.',
      );
    },
  });
};

/**
 * Reorder overview widgets.
 */
export const useReorderOverviewWidgets = (reportUuid: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: IReorderOverviewItemsPayload) => {
      return await api.nucleus.reorderOverviewWidgets(reportUuid!, data);
    },
    onSuccess: () => {
      if (reportUuid) {
        queryClient.invalidateQueries(nucleusOverviewKeys.widgets(reportUuid));
      }
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error('Reorder Failed', message || 'Unable to reorder widgets.');
    },
  });
};

/**
 * Add an item to an overview widget (optimistic).
 */
export const useAddOverviewWidgetItem = (reportUuid: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      widgetUuid,
      data,
    }: {
      widgetUuid: string;
      data: Record<string, unknown>;
    }) => {
      return await api.nucleus.addOverviewWidgetItem(
        reportUuid!,
        widgetUuid,
        data,
      );
    },
    onMutate: async ({ widgetUuid, data }) => {
      if (!reportUuid) return;
      return optimisticWidgetUpdate(queryClient, reportUuid, (widgets) =>
        widgets.map((w) => {
          if (w.uuid !== widgetUuid) return w;
          const itemsKey = WIDGET_ITEMS_KEY[w.widgetType];
          if (!itemsKey) return w;
          const items = w[itemsKey] as unknown as Array<
            Record<string, unknown>
          >;
          const tempItem = {
            uuid: `temp-${Date.now()}`,
            order: items.length,
            ...data,
          };
          return { ...w, [itemsKey]: [...items, tempItem] };
        }),
      );
    },
    onError: (e: AxiosError, _vars, context?: WidgetCacheContext) => {
      if (context?.previousWidgets && reportUuid) {
        queryClient.setQueryData(
          nucleusOverviewKeys.widgets(reportUuid),
          context.previousWidgets,
        );
      }
      const message = utils.osiris.parseFormError(e);
      toast.error('Add Item Failed', message || 'Unable to add item.');
    },
    onSettled: () => {
      if (reportUuid) {
        queryClient.invalidateQueries(nucleusOverviewKeys.widgets(reportUuid));
      }
    },
  });
};

/**
 * Update an item within an overview widget (optimistic).
 */
export const useUpdateOverviewWidgetItem = (reportUuid: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      widgetUuid,
      itemUuid,
      data,
    }: {
      widgetUuid: string;
      itemUuid: string;
      data: Record<string, unknown>;
    }) => {
      return await api.nucleus.updateOverviewWidgetItem(
        reportUuid!,
        widgetUuid,
        itemUuid,
        data,
      );
    },
    onMutate: async ({ widgetUuid, itemUuid, data }) => {
      if (!reportUuid) return;
      return optimisticWidgetUpdate(queryClient, reportUuid, (widgets) =>
        widgets.map((w) => {
          if (w.uuid !== widgetUuid) return w;
          const itemsKey = WIDGET_ITEMS_KEY[w.widgetType];
          if (!itemsKey) return w;
          const items = (
            w[itemsKey] as unknown as Array<Record<string, unknown>>
          ).map((item) =>
            item.uuid === itemUuid ? { ...item, ...data } : item,
          );
          return { ...w, [itemsKey]: items };
        }),
      );
    },
    onError: (e: AxiosError, _vars, context?: WidgetCacheContext) => {
      if (context?.previousWidgets && reportUuid) {
        queryClient.setQueryData(
          nucleusOverviewKeys.widgets(reportUuid),
          context.previousWidgets,
        );
      }
      const message = utils.osiris.parseFormError(e);
      toast.error('Update Item Failed', message || 'Unable to update item.');
    },
    onSettled: () => {
      if (reportUuid) {
        queryClient.invalidateQueries(nucleusOverviewKeys.widgets(reportUuid));
      }
    },
  });
};

/**
 * Delete an item from an overview widget (optimistic).
 */
export const useDeleteOverviewWidgetItem = (reportUuid: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      widgetUuid,
      itemUuid,
    }: {
      widgetUuid: string;
      itemUuid: string;
    }) => {
      return await api.nucleus.deleteOverviewWidgetItem(
        reportUuid!,
        widgetUuid,
        itemUuid,
      );
    },
    onMutate: async ({ widgetUuid, itemUuid }) => {
      if (!reportUuid) return;
      return optimisticWidgetUpdate(queryClient, reportUuid, (widgets) =>
        widgets.map((w) => {
          if (w.uuid !== widgetUuid) return w;
          const itemsKey = WIDGET_ITEMS_KEY[w.widgetType];
          if (!itemsKey) return w;
          const items = (
            w[itemsKey] as unknown as Array<Record<string, unknown>>
          ).filter((item) => item.uuid !== itemUuid);
          return { ...w, [itemsKey]: items };
        }),
      );
    },
    onError: (e: AxiosError, _vars, context?: WidgetCacheContext) => {
      if (context?.previousWidgets && reportUuid) {
        queryClient.setQueryData(
          nucleusOverviewKeys.widgets(reportUuid),
          context.previousWidgets,
        );
      }
      const message = utils.osiris.parseFormError(e);
      toast.error('Delete Item Failed', message || 'Unable to delete item.');
    },
    onSettled: () => {
      if (reportUuid) {
        queryClient.invalidateQueries(nucleusOverviewKeys.widgets(reportUuid));
      }
    },
  });
};

/**
 * Reorder items within an overview widget.
 */
export const useReorderOverviewWidgetItems = (
  reportUuid: string | undefined,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      widgetUuid,
      data,
    }: {
      widgetUuid: string;
      data: IReorderOverviewItemsPayload;
    }) => {
      return await api.nucleus.reorderOverviewWidgetItems(
        reportUuid!,
        widgetUuid,
        data,
      );
    },
    onSuccess: () => {
      if (reportUuid) {
        queryClient.invalidateQueries(nucleusOverviewKeys.widgets(reportUuid));
      }
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Reorder Items Failed',
        message || 'Unable to reorder items.',
      );
    },
  });
};
