/**
 * OverviewTab - Container for the Nucleus Overview dashboard.
 *
 * Fetches overview widgets from the API and renders them in a configurable grid.
 * Supports edit mode with drag-and-drop reordering, visibility toggles, size
 * controls, widget deletion, and widget creation. Layout preferences are
 * persisted to localStorage.
 */

import { GlassSurface } from '@components';
import {
  useAddOverviewWidgetItem,
  useCreateOverviewWidget,
  useDeleteOverviewWidget,
  useDeleteOverviewWidgetItem,
  useGenerateNucleusOverview,
  useNucleusOverviewWidgets,
  useUpdateOverviewWidget,
  useUpdateOverviewWidgetItem,
} from '@hooks/query/nucleusOverview.hook';
import { useAccountBranding } from '@hooks/query/accountBranding.hook';
import type {
  INucleusOverviewWidget,
  IUpdateNucleusOverviewWidgetPayload,
} from '@libs/api/types/nucleusOverview';
import {
  getOverviewWidgetPreferences,
  saveOverviewWidgetPreferences,
  clearOverviewWidgetPreferences,
} from '@libs/utils/overview-widget-preferences';
import { motion, AnimatePresence } from 'framer-motion';
import type { OverviewStatus } from '@libs/api/types/nucleus';
import {
  LayoutDashboard,
  Loader2,
  Plus,
  Settings,
  Sparkles,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import useStore from '@stores/store';

import LayoutEditSaveBanner from '../LivingPersonasTab/LayoutEditSaveBanner';
import AddOverviewWidgetModal from './AddOverviewWidgetModal';
import OverviewWidgetGrid, {
  buildDefaultOverviewConfig,
  getDefaultWidgetSize,
} from './OverviewWidgetGrid';
import type { OverviewWidgetConfig } from './OverviewWidgetGrid';

interface OverviewTabProps {
  reportUuid: string;
  overviewStatus?: OverviewStatus;
}

/** Merge local config with API widget data: prune deleted, append new. */
const mergeWidgetConfig = (
  prev: OverviewWidgetConfig[],
  apiWidgets: INucleusOverviewWidget[],
): OverviewWidgetConfig[] => {
  if (prev.length === 0) return buildDefaultOverviewConfig(apiWidgets);
  const apiIds = new Set(apiWidgets.map((w) => w.uuid));
  const pruned = prev.filter((c) => apiIds.has(c.id));
  const existingIds = new Set(pruned.map((c) => c.id));
  const newEntries = apiWidgets
    .filter((w) => !existingIds.has(w.uuid))
    .map((w) => ({
      id: w.uuid,
      label: w.title,
      visible: true,
      size: getDefaultWidgetSize(w),
    }));
  if (newEntries.length === 0 && pruned.length === prev.length) return prev;
  return [...pruned, ...newEntries];
};

const OverviewEmptyState: React.FC<{
  onGenerate: () => void;
  isGenerating: boolean;
}> = ({ onGenerate, isGenerating }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className='flex flex-col items-center justify-center py-20'
  >
    <GlassSurface className='max-w-md p-8 text-center' variant='default'>
      <LayoutDashboard className='text-primary/40 mx-auto mb-4 h-10 w-10' />
      <h3 className='aucctus-text-primary mb-2 text-lg font-semibold'>
        No Overview Yet
      </h3>
      <p className='aucctus-text-secondary mb-6 text-sm'>
        Generate a strategic overview from your Nucleus intelligence. AI will
        synthesize all 10 research categories into actionable widgets.
      </p>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onGenerate}
        disabled={isGenerating}
        className='aucctus-bg-brand-primary inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-50'
      >
        <Sparkles className='h-4 w-4' />
        {isGenerating ? 'Generating...' : 'Generate Overview'}
      </motion.button>
    </GlassSurface>
  </motion.div>
);

const OverviewGeneratingState: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className='flex flex-col items-center justify-center py-20'
  >
    <GlassSurface className='max-w-md p-8 text-center' variant='default'>
      <Loader2 className='text-primary/40 mx-auto mb-4 h-10 w-10 animate-spin' />
      <h3 className='aucctus-text-primary mb-2 text-lg font-semibold'>
        Generating Strategic Overview
      </h3>
      <p className='aucctus-text-secondary text-sm'>
        AI is synthesizing your Nucleus intelligence into actionable strategic
        widgets. This typically takes 1-2 minutes.
      </p>
    </GlassSurface>
  </motion.div>
);

const OverviewTab: React.FC<OverviewTabProps> = ({
  reportUuid,
  overviewStatus,
}) => {
  const { widgets, hasWidgets, isLoading, isFetching } =
    useNucleusOverviewWidgets(reportUuid);
  const { branding } = useAccountBranding();
  const generateMutation = useGenerateNucleusOverview(reportUuid);
  const deleteWidgetMutation = useDeleteOverviewWidget(reportUuid);
  const createWidgetMutation = useCreateOverviewWidget(reportUuid);
  const updateWidgetMutation = useUpdateOverviewWidget(reportUuid);
  const addItemMutation = useAddOverviewWidgetItem(reportUuid);
  const updateItemMutation = useUpdateOverviewWidgetItem(reportUuid);
  const deleteItemMutation = useDeleteOverviewWidgetItem(reportUuid);

  // Account UUID for scoped localStorage persistence
  const account = useStore((state) => state.auth.account);
  const accountUuid = account?.uuid;

  const brandColors = branding?.colors ?? {};

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddWidgetModalOpen, setIsAddWidgetModalOpen] = useState(false);

  // Widget config state — lazy initializer reads localStorage once on mount
  const [widgetConfig, setWidgetConfig] = useState<OverviewWidgetConfig[]>(
    () =>
      getOverviewWidgetPreferences(reportUuid, accountUuid) ??
      buildDefaultOverviewConfig(widgets),
  );
  const [savedWidgetConfig, setSavedWidgetConfig] = useState<
    OverviewWidgetConfig[]
  >(
    () =>
      getOverviewWidgetPreferences(reportUuid, accountUuid) ??
      buildDefaultOverviewConfig(widgets),
  );

  // Sync config when widgets change (e.g., after generation, deletion, or creation)
  useEffect(() => {
    if (widgets.length === 0) return;
    setWidgetConfig((prev) => mergeWidgetConfig(prev, widgets));
    setSavedWidgetConfig((prev) => mergeWidgetConfig(prev, widgets));
  }, [widgets]);

  const hasLayoutChanges = useMemo(
    () => JSON.stringify(widgetConfig) !== JSON.stringify(savedWidgetConfig),
    [widgetConfig, savedWidgetConfig],
  );

  // Layout handlers
  const handleToggleEditMode = useCallback(() => {
    setIsEditMode((prev) => !prev);
  }, []);

  const handleSaveLayout = useCallback(() => {
    setSavedWidgetConfig(widgetConfig);
    saveOverviewWidgetPreferences(reportUuid, widgetConfig, accountUuid);
    setIsEditMode(false);
  }, [widgetConfig, reportUuid, accountUuid]);

  const handleCancelLayout = useCallback(() => {
    setWidgetConfig(savedWidgetConfig);
    setIsEditMode(false);
  }, [savedWidgetConfig]);

  const handleResetLayout = useCallback(() => {
    const defaultConfig = buildDefaultOverviewConfig(widgets);
    setWidgetConfig(defaultConfig);
    setSavedWidgetConfig(defaultConfig);
    clearOverviewWidgetPreferences(reportUuid, accountUuid);
  }, [widgets, reportUuid, accountUuid]);

  const handleDeleteWidget = useCallback(
    (widgetUuid: string) => {
      deleteWidgetMutation.mutate(widgetUuid);
    },
    [deleteWidgetMutation],
  );

  const handleUpdateWidget = useCallback(
    (widgetUuid: string, data: Record<string, unknown>) => {
      updateWidgetMutation.mutate({
        widgetUuid,
        data: data as IUpdateNucleusOverviewWidgetPayload,
      });
    },
    [updateWidgetMutation],
  );

  const handleAddItem = useCallback(
    (widgetUuid: string, data: Record<string, unknown>) => {
      addItemMutation.mutate({ widgetUuid, data });
    },
    [addItemMutation],
  );

  const handleUpdateItem = useCallback(
    (widgetUuid: string, itemUuid: string, data: Record<string, unknown>) => {
      updateItemMutation.mutate({ widgetUuid, itemUuid, data });
    },
    [updateItemMutation],
  );

  const handleDeleteItem = useCallback(
    (widgetUuid: string, itemUuid: string) => {
      deleteItemMutation.mutate({ widgetUuid, itemUuid });
    },
    [deleteItemMutation],
  );

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-20'>
        <div className='aucctus-text-tertiary text-sm'>Loading overview...</div>
      </div>
    );
  }

  // Show generating state when overview is in progress:
  // - overviewStatus from the report API (covers auto-dispatch after Phase 3)
  // - generateMutation.isLoading (during the API call itself)
  // - generateMutation.isSuccess (bridges the gap after 202 returns but before overviewStatus updates)
  const isGenerating =
    overviewStatus === 'generating' ||
    generateMutation.isLoading ||
    generateMutation.isSuccess;

  if (!hasWidgets) {
    if (isGenerating) {
      return <OverviewGeneratingState />;
    }

    return (
      <OverviewEmptyState
        onGenerate={() => generateMutation.mutate()}
        isGenerating={generateMutation.isLoading}
      />
    );
  }

  return (
    <div>
      {/* Toolbar */}
      <div className='mb-4 flex items-center justify-end gap-2'>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAddWidgetModalOpen(true)}
          className='aucctus-text-secondary hover:aucctus-bg-secondary flex h-8 w-8 items-center justify-center rounded-lg transition-colors'
          title='Add widget'
        >
          <Plus className='h-4 w-4' />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleToggleEditMode}
          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
            isEditMode
              ? 'aucctus-bg-brand-secondary aucctus-text-brand-primary'
              : 'aucctus-text-secondary hover:aucctus-bg-secondary'
          }`}
          title='Configure layout'
        >
          <Settings className='h-4 w-4' />
        </motion.button>
      </div>

      {/* Widget Grid */}
      <OverviewWidgetGrid
        widgets={widgets}
        brandColors={brandColors}
        isLayoutMode={isEditMode}
        widgetConfig={widgetConfig}
        onConfigChange={setWidgetConfig}
        onDeleteWidget={isEditMode ? handleDeleteWidget : undefined}
        isEditable
        onAddItem={handleAddItem}
        onUpdateItem={handleUpdateItem}
        onDeleteItem={handleDeleteItem}
        onUpdateWidget={handleUpdateWidget}
        isSyncing={isFetching && !isLoading}
      />

      {/* Edit mode save banner */}
      <AnimatePresence>
        {isEditMode && (
          <LayoutEditSaveBanner
            hasChanges={hasLayoutChanges}
            onSave={handleSaveLayout}
            onCancel={handleCancelLayout}
            onReset={handleResetLayout}
          />
        )}
      </AnimatePresence>

      {/* Add widget modal */}
      <AddOverviewWidgetModal
        open={isAddWidgetModalOpen}
        onOpenChange={setIsAddWidgetModalOpen}
        onCreateWidget={async (data) => {
          await createWidgetMutation.mutateAsync(data);
        }}
      />
    </div>
  );
};

export default OverviewTab;
