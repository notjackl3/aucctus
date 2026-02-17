// @ts-nocheck
// DEPRECATED: This page is no longer used. Use Concept Report Workshop tab instead.
/**
 * ComponentWorkshop
 *
 * A page where users can request AI-generated React components
 * and preview them in real-time using DynamicComponentRenderer.
 *
 * Features:
 * - Natural language component generation
 * - File upload support for reference materials
 * - Live component preview
 * - Component library management
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Loading, toast } from '@components';
import { DynamicComponentRenderer } from '@components/DynamicComponent';
import { cn } from '@libs/utils/react';
import {
  useComponentList,
  useServiceHealth,
  useDeleteComponent,
  useComponent,
} from '@hooks/query/dynamicComponent.hook';
import { useComponentGeneratorWebSocket } from '@hooks/query/dynamicComponentWebSocket.hook';
import type { IComponentListItem } from '@libs/api/types/dynamicComponent.d';

// Local components
import {
  WorkshopHeader,
  FileUploadZone,
  ComponentCard,
  GenerationProgress,
  EmptyState,
} from './components';
import { useFileUpload } from './hooks';
import { Plus, RefreshCw, Sparkles } from 'lucide-react';
import { DynamicIcon } from '@libs/utils/iconMap';

/**
 * View mode for the workshop
 */
type ViewMode = 'generate' | 'preview' | 'library';

/**
 * Tips data for the generate view
 */
const GENERATION_TIPS = [
  {
    icon: 'lightbulb',
    title: 'Be Specific',
    desc: 'Include details about layout, colors, and interactions',
  },
  {
    icon: 'layers',
    title: 'Describe Data',
    desc: 'Mention what data the component should accept',
  },
  {
    icon: 'target',
    title: 'Set Expectations',
    desc: 'Specify any styling or framework requirements',
  },
] as const;

/**
 * ComponentWorkshop - Main page component
 */
const ComponentWorkshop: React.FC = () => {
  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('generate');
  const [query, setQuery] = useState('');
  const [selectedComponentName, setSelectedComponentName] = useState<
    string | null
  >(null);

  // File upload hook
  const {
    files: uploadedFiles,
    isDragging,
    fileInputRef,
    handleFileSelect,
    handleRemoveFile,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    clearFiles,
    openFilePicker,
  } = useFileUpload({ maxFiles: 10 });

  // API hooks
  const { isHealthy, isChecking } = useServiceHealth();
  const {
    generate,
    isLoading: isGenerating,
    result,
    compiledCode: generatedCompiledCode,
    componentName: generatedComponentName,
    reset,
    duration,
    cost,
    messages,
  } = useComponentGeneratorWebSocket();
  const { components, isLoading: isLoadingList, refresh } = useComponentList();
  const { deleteComponent, isDeleting } = useDeleteComponent();
  const { component: libraryComponent, isLoading: isLoadingLibraryComponent } =
    useComponent(selectedComponentName);

  // Derived values
  const activeCompiledCode = useMemo(() => {
    if (generatedCompiledCode) return generatedCompiledCode;
    return libraryComponent?.compiledCode ?? null;
  }, [generatedCompiledCode, libraryComponent?.compiledCode]);

  const activeSourceCode = useMemo(() => {
    if (result?.generatedComponent?.sourceCode) {
      return result.generatedComponent.sourceCode;
    }
    return libraryComponent?.sourceCode ?? null;
  }, [result?.generatedComponent?.sourceCode, libraryComponent?.sourceCode]);

  const activeComponentName = useMemo(() => {
    if (generatedComponentName) return generatedComponentName;
    return libraryComponent?.name ?? selectedComponentName ?? null;
  }, [generatedComponentName, libraryComponent?.name, selectedComponentName]);

  const isDisabled = isGenerating || !isHealthy;

  // Stable callback ref for DynamicComponentRenderer to prevent re-renders
  const handleRenderError = useCallback((error: Error) => {
    toast.error('Render Error', error.message);
  }, []);

  // Handlers
  const handleGenerate = useCallback(async () => {
    if (!query.trim()) {
      toast.error('Please describe the component you want to create');
      return;
    }

    setSelectedComponentName(null);

    try {
      await generate({
        query,
        files: uploadedFiles.length > 0 ? uploadedFiles : undefined,
      });
      setViewMode('preview');
      clearFiles();
    } catch {
      // Error handled by hook
    }
  }, [query, generate, uploadedFiles, clearFiles]);

  const handleSelectComponent = useCallback(
    (component: IComponentListItem) => {
      reset();
      setSelectedComponentName(component.name);
      setViewMode('preview');
    },
    [reset],
  );

  const handleDeleteComponent = useCallback(
    async (component: IComponentListItem, e: React.MouseEvent) => {
      e.stopPropagation();
      if (confirm(`Are you sure you want to delete "${component.name}"?`)) {
        await deleteComponent(component.name);
        if (selectedComponentName === component.name) {
          setSelectedComponentName(null);
        }
        refresh();
      }
    },
    [deleteComponent, refresh, selectedComponentName],
  );

  const handleNewComponent = useCallback(() => {
    reset();
    setQuery('');
    setSelectedComponentName(null);
    clearFiles();
    setViewMode('generate');
  }, [reset, clearFiles]);

  return (
    <div className='aucctus-bg-secondary flex h-full min-h-screen flex-col'>
      {/* Header */}
      <WorkshopHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isHealthy={isHealthy}
        isChecking={isChecking}
      />

      {/* Main Content */}
      <main className='flex-1 p-6'>
        <div className='mx-auto max-w-7xl'>
          {/* Generate View */}
          {viewMode === 'generate' && (
            <div
              className='animate-in fade-in slide-in-from-bottom-4 duration-300'
              role='tabpanel'
              id='generate-panel'
              aria-labelledby='generate-tab'
            >
              <div className='aucctus-bg-primary aucctus-border-secondary rounded-2xl border p-8'>
                <div className='mx-auto max-w-2xl text-center'>
                  {/* Hero Section */}
                  <div className='mb-6'>
                    <div className='aucctus-bg-brand-solid mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl'>
                      <Sparkles className='aucctus-stroke-white h-8 w-8' />
                    </div>
                    <h2 className='aucctus-text-xl-semibold aucctus-text-primary mb-2'>
                      Create a Component
                    </h2>
                    <p className='aucctus-text-md aucctus-text-secondary'>
                      Describe the React component you want to create. Be
                      specific about functionality, styling, and any data it
                      should display.
                    </p>
                  </div>

                  {/* Query Input */}
                  <div className='relative mb-6'>
                    <textarea
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder='Create a dashboard card showing monthly revenue with a line chart, percentage change indicator, and comparison to last month...'
                      rows={5}
                      disabled={isDisabled}
                      aria-label='Component description'
                      className={cn(
                        'aucctus-text-md w-full resize-none rounded-xl border p-4',
                        'aucctus-bg-secondary aucctus-border-secondary aucctus-text-primary',
                        'placeholder:aucctus-text-placeholder',
                        'focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)]',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                      )}
                    />
                    <div className='absolute bottom-3 right-3 flex items-center gap-2'>
                      <span className='aucctus-text-xs aucctus-text-quaternary'>
                        {query.length} characters
                      </span>
                    </div>
                  </div>

                  {/* File Upload */}
                  <div className='mb-6'>
                    <FileUploadZone
                      files={uploadedFiles}
                      isDragging={isDragging}
                      disabled={isDisabled}
                      fileInputRef={fileInputRef}
                      onFileSelect={handleFileSelect}
                      onRemoveFile={handleRemoveFile}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onOpenFilePicker={openFilePicker}
                    />
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={handleGenerate}
                    disabled={isDisabled || !query.trim()}
                    className={cn(
                      'btn btn-primary btn-lg w-full',
                      'disabled:cursor-not-allowed disabled:opacity-50',
                    )}
                  >
                    {isGenerating ? (
                      <span className='flex items-center justify-center gap-2'>
                        <Loading className='h-5 w-5' />
                        Generating Component...
                      </span>
                    ) : (
                      <span className='flex items-center justify-center gap-2'>
                        <Sparkles className='aucctus-stroke-white h-5 w-5' />
                        Generate Component
                      </span>
                    )}
                  </button>

                  {/* Tips */}
                  <div className='mt-8 grid gap-4 md:grid-cols-3'>
                    {GENERATION_TIPS.map((tip) => (
                      <div
                        key={tip.title}
                        className='aucctus-bg-secondary rounded-xl p-4 text-left'
                      >
                        <DynamicIcon
                          variant={tip.icon as any}
                          className='aucctus-stroke-brand-primary mb-2 h-5 w-5'
                        />
                        <h4 className='aucctus-text-sm-semibold aucctus-text-primary mb-1'>
                          {tip.title}
                        </h4>
                        <p className='aucctus-text-xs aucctus-text-tertiary'>
                          {tip.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Generation Progress */}
              {isGenerating && <GenerationProgress messages={messages} />}
            </div>
          )}

          {/* Preview View */}
          {viewMode === 'preview' && (
            <div
              className='animate-in fade-in slide-in-from-bottom-4 duration-300'
              role='tabpanel'
              id='preview-panel'
              aria-labelledby='preview-tab'
            >
              {/* Preview Header */}
              <div className='mb-6 flex items-center justify-between'>
                <div>
                  <h2 className='aucctus-text-lg-semibold aucctus-text-primary'>
                    {activeComponentName || 'Component Preview'}
                  </h2>
                  {(duration || cost) && (
                    <div className='mt-1 flex items-center gap-4'>
                      {duration && (
                        <span className='aucctus-text-xs aucctus-text-tertiary'>
                          Generated in {(duration / 1000).toFixed(1)}s
                        </span>
                      )}
                      {cost && (
                        <span className='aucctus-text-xs aucctus-text-tertiary'>
                          Cost: ${cost.toFixed(4)}
                        </span>
                      )}
                    </div>
                  )}
                  {selectedComponentName && !generatedComponentName && (
                    <span className='aucctus-text-xs aucctus-text-tertiary mt-1 inline-block'>
                      From library
                    </span>
                  )}
                </div>
                <button
                  onClick={handleNewComponent}
                  className='btn btn-secondary btn-sm'
                >
                  <Plus className='aucctus-stroke-secondary mr-1.5 h-4 w-4' />
                  New Component
                </button>
              </div>

              {/* Loading state */}
              {isLoadingLibraryComponent && selectedComponentName && (
                <div className='aucctus-bg-primary aucctus-border-secondary rounded-2xl border p-12'>
                  <div className='flex flex-col items-center justify-center'>
                    <Loading className='mb-4 h-8 w-8' />
                    <p className='aucctus-text-sm aucctus-text-tertiary'>
                      Loading {selectedComponentName}...
                    </p>
                  </div>
                </div>
              )}

              {/* Component Preview */}
              {!isLoadingLibraryComponent && activeCompiledCode ? (
                <div className='aucctus-bg-primary aucctus-border-secondary overflow-hidden rounded-lg border'>
                  <div className='aucctus-bg-secondary aucctus-border-secondary border-b px-4 py-3'>
                    <div className='flex items-center gap-2'>
                      <div className='aucctus-bg-error-solid h-3 w-3 rounded-full' />
                      <div className='aucctus-bg-warning-solid h-3 w-3 rounded-full' />
                      <div className='aucctus-bg-success-solid h-3 w-3 rounded-full' />
                      <span className='aucctus-text-xs aucctus-text-tertiary ml-4'>
                        Live Preview
                      </span>
                    </div>
                  </div>
                  <div className='p-6'>
                    <DynamicComponentRenderer
                      compiledCode={activeCompiledCode}
                      componentId={activeComponentName || 'preview'}
                      onError={handleRenderError}
                    />
                  </div>
                </div>
              ) : (
                !isLoadingLibraryComponent && (
                  <EmptyState
                    icon='cube'
                    title={
                      selectedComponentName
                        ? 'Component Not Compiled'
                        : 'No Component to Preview'
                    }
                    description={
                      selectedComponentName
                        ? 'This component has not been compiled yet. Source code is available below.'
                        : 'Generate a new component or select one from the library.'
                    }
                    actions={
                      !selectedComponentName
                        ? [
                            {
                              label: 'Generate',
                              onClick: () => setViewMode('generate'),
                              variant: 'primary',
                            },
                            {
                              label: 'Browse Library',
                              onClick: () => setViewMode('library'),
                              variant: 'secondary',
                            },
                          ]
                        : undefined
                    }
                  />
                )
              )}

              {/* Source Code */}
              {activeSourceCode && (
                <details className='mt-6'>
                  <summary className='aucctus-text-sm-medium aucctus-text-secondary hover:aucctus-text-primary cursor-pointer transition-colors'>
                    View Source Code
                  </summary>
                  <pre className='aucctus-bg-primary aucctus-border-secondary mt-4 overflow-x-auto rounded-xl border p-4'>
                    <code className='aucctus-text-xs aucctus-text-secondary'>
                      {activeSourceCode}
                    </code>
                  </pre>
                </details>
              )}
            </div>
          )}

          {/* Library View */}
          {viewMode === 'library' && (
            <div
              className='animate-in fade-in slide-in-from-bottom-4 duration-300'
              role='tabpanel'
              id='library-panel'
              aria-labelledby='library-tab'
            >
              {/* Library Header */}
              <div className='mb-6 flex items-center justify-between'>
                <div>
                  <h2 className='aucctus-text-lg-semibold aucctus-text-primary'>
                    Component Library
                  </h2>
                  <p className='aucctus-text-sm aucctus-text-tertiary mt-1'>
                    {components.length} component
                    {components.length !== 1 ? 's' : ''} generated
                  </p>
                </div>
                <button onClick={refresh} className='btn btn-secondary btn-sm'>
                  <RefreshCw className='aucctus-stroke-secondary mr-1.5 h-4 w-4' />
                  Refresh
                </button>
              </div>

              {/* Loading State */}
              {isLoadingList ? (
                <div className='flex items-center justify-center py-12'>
                  <Loading className='h-8 w-8' />
                </div>
              ) : components.length === 0 ? (
                <EmptyState
                  icon='inbox-02'
                  title='No Components Yet'
                  description='Generate your first component to see it here.'
                  actions={[
                    {
                      label: 'Create Component',
                      onClick: () => setViewMode('generate'),
                      variant: 'primary',
                    },
                  ]}
                />
              ) : (
                <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                  {components.map((component) => (
                    <ComponentCard
                      key={component.name}
                      component={component}
                      isSelected={selectedComponentName === component.name}
                      isDeleting={isDeleting}
                      onClick={() => handleSelectComponent(component)}
                      onDelete={(e) => handleDeleteComponent(component, e)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ComponentWorkshop;
