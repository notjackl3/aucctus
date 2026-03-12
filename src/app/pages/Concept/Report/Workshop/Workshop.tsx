import { Loading } from '@components';
import { DynamicComponentRenderer } from '@components/DynamicComponent/DynamicComponentRenderer';
import { useWorkshop } from '@hooks/query/dynamicComponent.hook';
import type { IDynamicComponent } from '@libs/api/types/dynamicComponent.d';
import { cn } from '@libs/utils/react';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useState } from 'react';
import { Eye, FileCode, Layers } from 'lucide-react';
import { useConceptReportContext } from '../ConceptReport/ConceptReportContext';

/**
 * Workshop page for testing dynamic component generation.
 * Allows users to generate React components from concept reports using Claude CLI.
 */
const Workshop: React.FC = () => {
  const { concept } = useConceptReportContext();
  const conceptUuid = concept?.uuid || '';

  const {
    components,
    isLoadingComponents,
    generate,
    isStartingGeneration,
    isGenerating,
    generationStage,
    generationMessage,
    generationProgress,
  } = useWorkshop(conceptUuid);

  // Track which component is being previewed
  const [selectedComponentUuid, setSelectedComponentUuid] = useState<
    string | null
  >(null);
  const [showCode, setShowCode] = useState(false);

  // Component request input
  const [componentRequest, setComponentRequest] = useState('');

  // Handle generate button click
  const handleGenerate = useCallback(() => {
    if (!conceptUuid || !componentRequest.trim()) return;

    generate({
      conceptUuid,
      reportContent: componentRequest.trim(),
    });

    // Clear input after submitting
    setComponentRequest('');
  }, [componentRequest, conceptUuid, generate]);

  // Get status badge for component
  const getStatusBadge = (status: IDynamicComponent['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className='aucctus-bg-warning-subtle aucctus-text-warning-primary rounded-full px-2 py-0.5 text-xs'>
            Pending
          </span>
        );
      case 'prd_generating':
        return (
          <span className='aucctus-bg-brand-subtle aucctus-text-brand-primary rounded-full px-2 py-0.5 text-xs'>
            Generating PRD...
          </span>
        );
      case 'generating':
        return (
          <span className='aucctus-bg-brand-subtle aucctus-text-brand-primary rounded-full px-2 py-0.5 text-xs'>
            Generating...
          </span>
        );
      case 'completed':
        return (
          <span className='aucctus-bg-success-subtle aucctus-text-success-primary rounded-full px-2 py-0.5 text-xs'>
            Completed
          </span>
        );
      case 'failed':
        return (
          <span className='aucctus-bg-error-subtle aucctus-text-error-primary rounded-full px-2 py-0.5 text-xs'>
            Failed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className='w-full space-y-6'>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className='aucctus-text-xl-semibold aucctus-text-brand-primary mb-2'>
          Component Workshop
        </h1>
        <p className='aucctus-text-sm-regular aucctus-text-brand-secondary'>
          Generate custom React components from your concept reports using AI
        </p>
      </motion.div>

      {/* Generation Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className='aucctus-bg-primary aucctus-border-secondary rounded-lg border p-6 shadow-sm'
      >
        <div className='mb-4'>
          <h2 className='aucctus-text-lg-semibold aucctus-text-brand-primary mb-1'>
            Generate New Component
          </h2>
          <p className='aucctus-text-sm aucctus-text-tertiary'>
            Describe the component you want to create. The AI will analyze your
            concept data and generate a custom React component.
          </p>
        </div>

        {/* Component Request Input */}
        <div className='mb-4'>
          <label
            htmlFor='component-request'
            className='aucctus-text-sm-medium aucctus-text-brand-primary mb-2 block'
          >
            What component would you like to create?
          </label>
          <textarea
            id='component-request'
            value={componentRequest}
            onChange={(e) => setComponentRequest(e.target.value)}
            placeholder='e.g., "Create a 5-year financial projection chart showing revenue, costs, and profit margins" or "Build a customer segment comparison table with key metrics"'
            disabled={isStartingGeneration || isGenerating}
            className={cn(
              'aucctus-bg-secondary aucctus-border-secondary aucctus-text-brand-primary placeholder:aucctus-text-tertiary w-full rounded-lg border p-3 text-sm',
              'focus:aucctus-border-brand focus:ring-brand-500 focus:outline-none focus:ring-1',
              'min-h-[100px] resize-y',
              (isStartingGeneration || isGenerating) &&
                'cursor-not-allowed opacity-50',
            )}
          />
          <p className='aucctus-text-xs aucctus-text-tertiary mt-2'>
            Be specific about the data you want to visualize and the chart/table
            type you prefer.
          </p>
        </div>

        <div className='flex items-center justify-end'>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerate}
            disabled={
              isStartingGeneration || isGenerating || !componentRequest.trim()
            }
            className={cn(
              'btn btn-primary flex items-center gap-2',
              (isStartingGeneration ||
                isGenerating ||
                !componentRequest.trim()) &&
                'cursor-not-allowed opacity-50',
            )}
          >
            {isStartingGeneration || isGenerating ? (
              <>
                <Loading className='h-4 w-4' />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <FileCode className='h-4 w-4 stroke-white' />
                <span>Generate Component</span>
              </>
            )}
          </motion.button>
        </div>

        {/* Generation Progress */}
        <AnimatePresence>
          {isGenerating && generationProgress && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className='mt-4'
            >
              <div className='aucctus-bg-secondary rounded-lg p-4'>
                <div className='mb-2 flex items-center gap-2'>
                  <Loading className='h-4 w-4' />
                  <span className='aucctus-text-sm-medium aucctus-text-brand-primary'>
                    {generationStage === 'pending'
                      ? 'Queued'
                      : generationStage === 'prd_generating'
                        ? 'Generating PRD'
                        : generationStage === 'generating'
                          ? 'Generating Component'
                          : generationStage}
                  </span>
                </div>
                <p className='aucctus-text-sm aucctus-text-tertiary'>
                  {generationMessage || 'Processing your request...'}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Components List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className='space-y-4'
      >
        <div className='flex items-center gap-2'>
          <Layers className='aucctus-stroke-brand-primary h-5 w-5' />
          <h2 className='aucctus-text-lg-semibold aucctus-text-brand-primary'>
            Generated Components
          </h2>
          {components.length > 0 && (
            <span className='aucctus-text-sm aucctus-text-tertiary'>
              ({components.length})
            </span>
          )}
        </div>

        {isLoadingComponents ? (
          <div className='aucctus-bg-primary aucctus-border-secondary flex h-48 items-center justify-center rounded-lg border'>
            <Loading />
          </div>
        ) : components.length === 0 ? (
          <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border p-8'>
            <div className='flex flex-col items-center justify-center text-center'>
              <FileCode className='aucctus-stroke-tertiary mb-4 h-12 w-12' />
              <h3 className='aucctus-text-lg-semibold aucctus-text-brand-primary mb-2'>
                No components yet
              </h3>
              <p className='aucctus-text-sm aucctus-text-tertiary max-w-md'>
                Generate your first component to see it here. Components are
                created from your concept overview and can be previewed
                directly.
              </p>
            </div>
          </div>
        ) : (
          <div className='grid gap-4'>
            {components.map((component, index) => (
              <motion.div
                key={component.uuid}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={cn(
                  'aucctus-bg-primary aucctus-border-secondary rounded-lg border p-4 shadow-sm transition-all duration-200',
                  selectedComponentUuid === component.uuid &&
                    'aucctus-border-brand ring-brand-500 ring-1',
                )}
              >
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='mb-1 flex items-center gap-2'>
                      <h3 className='aucctus-text-md-semibold aucctus-text-brand-primary'>
                        {component.componentName || 'Unnamed Component'}
                      </h3>
                      {getStatusBadge(component.status)}
                    </div>
                    <p className='aucctus-text-xs aucctus-text-tertiary'>
                      Created:{' '}
                      {new Date(component.createdAt).toLocaleDateString()}
                      {(component.prdDurationMs || component.durationMs) && (
                        <span className='ml-2'>
                          (
                          {component.prdDurationMs &&
                            `PRD: ${(component.prdDurationMs / 1000).toFixed(1)}s`}
                          {component.prdDurationMs &&
                            component.durationMs &&
                            ', '}
                          {component.durationMs &&
                            `Component: ${(component.durationMs / 1000).toFixed(1)}s`}
                          )
                        </span>
                      )}
                    </p>
                    {component.status === 'failed' &&
                      component.errorMessage && (
                        <p className='aucctus-text-sm aucctus-text-error-primary mt-2'>
                          Error: {component.errorMessage}
                        </p>
                      )}
                  </div>

                  <div className='flex gap-2'>
                    {component.status === 'completed' &&
                      component.sourceCode && (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setSelectedComponentUuid(
                                selectedComponentUuid === component.uuid
                                  ? null
                                  : component.uuid,
                              );
                              setShowCode(false);
                            }}
                            className='btn btn-secondary btn-sm'
                          >
                            <Eye className='mr-1 h-4 w-4 stroke-current' />
                            {selectedComponentUuid === component.uuid
                              ? 'Hide'
                              : 'Preview'}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setSelectedComponentUuid(component.uuid);
                              setShowCode(true);
                            }}
                            className='btn btn-secondary btn-sm'
                          >
                            <FileCode className='mr-1 h-4 w-4 stroke-current' />
                            Code
                          </motion.button>
                        </>
                      )}
                  </div>
                </div>

                {/* Preview/Code Panel */}
                <AnimatePresence>
                  {selectedComponentUuid === component.uuid && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className='mt-4 overflow-hidden'
                    >
                      {showCode ? (
                        <div className='aucctus-bg-secondary max-h-96 overflow-auto rounded-lg p-4'>
                          <pre className='aucctus-text-xs aucctus-text-brand-primary font-mono'>
                            {component.sourceCode}
                          </pre>
                        </div>
                      ) : component.compiledCode ? (
                        <div className='aucctus-bg-secondary rounded-lg p-4'>
                          <DynamicComponentRenderer
                            compiledCode={component.compiledCode}
                            componentId={component.uuid}
                          />
                        </div>
                      ) : (
                        <div className='aucctus-bg-secondary flex h-48 items-center justify-center rounded-lg'>
                          <p className='aucctus-text-sm aucctus-text-tertiary'>
                            No compiled code available
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Workshop;
