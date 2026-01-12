import { useState, useCallback, useRef } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { IConcept } from '@libs/api/types';
import { Input } from '@components';
import { useInnovationPipeline } from './hooks/useInnovationPipeline';
import { PipelineHeader, PipelineBoard, PipelineCard } from './components';
import type { ConceptsByStage } from './types/pipeline.types';

const EMPTY_CONCEPTS_BY_STAGE: ConceptsByStage = {
  discovery: [],
  prototyping: [],
  proofOfConcept: [],
  mvp: [],
  scaling: [],
};

const InnovationPipelinePage = () => {
  const {
    conceptsByStage,
    totalCount,
    isLoading,
    handleDragEnd,
    findConceptByIdentifier,
    filterOptions,
    updateFilterOptions,
  } = useInnovationPipeline();

  const [activeCard, setActiveCard] = useState<IConcept | null>(null);

  // Track last search value to prevent debounce loops
  const lastSearchValueRef = useRef(filterOptions.search);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  // Handle search input change
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (newValue !== lastSearchValueRef.current) {
        lastSearchValueRef.current = newValue;
        updateFilterOptions({ search: newValue || undefined });
      }
    },
    [updateFilterOptions],
  );

  if (isLoading) {
    return (
      <div className='flex h-full flex-col p-8'>
        <PipelineHeader
          totalCount={0}
          conceptsByStage={EMPTY_CONCEPTS_BY_STAGE}
        />
        <div className='mb-4 flex items-center justify-end'>
          <div className='w-64'>
            <div className='aucctus-bg-tertiary h-10 animate-pulse rounded-lg' />
          </div>
        </div>
        <div className='flex flex-1 gap-4 overflow-x-auto'>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className='min-w-[280px] flex-1'>
              <div className='aucctus-bg-tertiary mb-3 h-6 w-24 animate-pulse rounded' />
              <div className='aucctus-bg-secondary flex flex-col gap-2 rounded-lg p-2'>
                {[1, 2, 3].map((j) => (
                  <div
                    key={j}
                    className='aucctus-bg-tertiary h-24 animate-pulse rounded-lg'
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='flex h-full flex-col p-8'>
      <PipelineHeader
        totalCount={totalCount}
        conceptsByStage={conceptsByStage}
      />

      {/* Search bar */}
      <div className='mb-4 flex items-center justify-end'>
        <div className='w-64'>
          <Input.Search
            name='pipeline-search'
            type='text'
            placeholder='Search concepts...'
            value={filterOptions.search || ''}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Kanban board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={(event) => {
          const concept = findConceptByIdentifier(event.active.id as string);
          setActiveCard(concept || null);
        }}
        onDragEnd={(event) => {
          handleDragEnd(event);
          setActiveCard(null);
        }}
        onDragCancel={() => setActiveCard(null)}
      >
        <div className='flex-1 overflow-x-auto'>
          <PipelineBoard conceptsByStage={conceptsByStage} />
        </div>
        <DragOverlay>
          {activeCard && <PipelineCard concept={activeCard} isDragOverlay />}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default InnovationPipelinePage;
