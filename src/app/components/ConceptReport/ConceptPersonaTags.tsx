import React, { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Popover from '@radix-ui/react-popover';
import { Plus, X, Users, Check } from 'lucide-react';
import { cn } from '@libs/utils/react';
import { usePersonas } from '@hooks/query/persona.hook';
import { useConceptUpdate } from '@hooks/query/concepts.hook';
import type { IConcept } from '@libs/api/types/concept/concepts';
import type { ILivingPersonaSummary } from '@libs/api/types/concept/concepts';

interface ConceptPersonaTagsProps {
  concept: IConcept;
  isReadOnly?: boolean;
}

const MAX_PERSONAS = 4;

const ConceptPersonaTags: React.FC<ConceptPersonaTagsProps> = ({
  concept,
  isReadOnly = false,
}) => {
  const [open, setOpen] = useState(false);
  const { personas: allPersonas, isLoading: personasLoading } = usePersonas();
  const updateMutation = useConceptUpdate();

  const taggedPersonas: ILivingPersonaSummary[] = useMemo(
    () => concept.livingPersonas ?? [],
    [concept.livingPersonas],
  );

  const taggedUuids = useMemo(
    () => new Set(taggedPersonas.map((p) => p.uuid)),
    [taggedPersonas],
  );

  const availablePersonas = useMemo(() => {
    if (!allPersonas) return [];
    return allPersonas.filter((p) => !taggedUuids.has(p.uuid));
  }, [allPersonas, taggedUuids]);

  const atLimit = taggedPersonas.length >= MAX_PERSONAS;

  const handleAdd = useCallback(
    (personaUuid: string) => {
      if (atLimit) return;
      const newUuids = [...(concept.livingPersonaUuids ?? []), personaUuid];
      updateMutation.mutate({
        identifier: concept.identifier,
        livingPersonaUuids: newUuids,
      });
    },
    [atLimit, concept.identifier, concept.livingPersonaUuids, updateMutation],
  );

  const handleRemove = useCallback(
    (personaUuid: string) => {
      const newUuids = (concept.livingPersonaUuids ?? []).filter(
        (u) => u !== personaUuid,
      );
      updateMutation.mutate({
        identifier: concept.identifier,
        livingPersonaUuids: newUuids,
      });
    },
    [concept.identifier, concept.livingPersonaUuids, updateMutation],
  );

  // Don't render anything if read-only and no personas tagged
  if (isReadOnly && taggedPersonas.length === 0) return null;

  return (
    <div className='mt-3 flex flex-wrap items-center gap-2'>
      {/* Tagged persona chips */}
      <AnimatePresence mode='popLayout'>
        {taggedPersonas.map((persona) => (
          <motion.span
            key={persona.uuid}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            layout
            className='aucctus-border-secondary aucctus-bg-secondary inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium'
          >
            {persona.avatarUrl ? (
              <img
                src={persona.avatarUrl}
                alt={persona.name}
                className='h-4 w-4 rounded-full object-cover'
              />
            ) : (
              <span
                className='flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold text-white'
                style={{
                  backgroundColor: persona.themeColor ?? 'hsl(270, 50%, 50%)',
                }}
              >
                {persona.name.charAt(0)}
              </span>
            )}
            <span className='aucctus-text-primary'>{persona.name}</span>
            <span className='aucctus-text-tertiary text-[10px]'>
              {persona.segment}
            </span>
            {!isReadOnly && (
              <button
                type='button'
                onClick={() => handleRemove(persona.uuid)}
                className='aucctus-text-tertiary ml-0.5 transition-colors hover:text-red-400'
                aria-label={`Remove ${persona.name}`}
              >
                <X size={12} />
              </button>
            )}
          </motion.span>
        ))}
      </AnimatePresence>

      {/* Add persona button + popover */}
      {!isReadOnly && (
        <Popover.Root open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <button
              type='button'
              disabled={atLimit}
              className={cn(
                'aucctus-border-secondary inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                atLimit
                  ? 'aucctus-text-tertiary cursor-not-allowed opacity-50'
                  : 'aucctus-text-secondary aucctus-bg-secondary-hover cursor-pointer',
              )}
            >
              {taggedPersonas.length > 0 ? (
                <>
                  <Plus size={12} />
                  <span>
                    {taggedPersonas.length}/{MAX_PERSONAS}
                  </span>
                </>
              ) : (
                <>
                  <Users size={12} />
                  <span>Add Personas</span>
                </>
              )}
            </button>
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content
              side='bottom'
              align='start'
              sideOffset={8}
              className='aucctus-bg-primary aucctus-border-secondary z-50 w-64 rounded-lg border shadow-lg'
            >
              <div className='aucctus-border-secondary border-b px-3 py-2'>
                <p className='aucctus-text-xs-medium aucctus-text-secondary'>
                  Tag Personas ({taggedPersonas.length}/{MAX_PERSONAS})
                </p>
              </div>
              <div className='max-h-48 overflow-y-auto p-1'>
                {personasLoading ? (
                  <p className='aucctus-text-tertiary px-3 py-2 text-xs'>
                    Loading...
                  </p>
                ) : availablePersonas.length === 0 ? (
                  <p className='aucctus-text-tertiary px-3 py-2 text-xs'>
                    {atLimit
                      ? 'Maximum personas reached'
                      : 'No more personas available'}
                  </p>
                ) : (
                  availablePersonas.map((persona) => (
                    <button
                      key={persona.uuid}
                      type='button'
                      onClick={() => handleAdd(persona.uuid)}
                      disabled={atLimit}
                      className={cn(
                        'aucctus-bg-secondary-hover flex w-full items-center gap-2 rounded-md px-3 py-2 text-left transition-colors',
                        atLimit && 'cursor-not-allowed opacity-50',
                      )}
                    >
                      {persona.avatar ? (
                        <img
                          src={persona.avatar}
                          alt={persona.name}
                          className='h-6 w-6 flex-shrink-0 rounded-full object-cover'
                        />
                      ) : (
                        <span
                          className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white'
                          style={{
                            backgroundColor:
                              persona.themeColor ?? 'hsl(270, 50%, 50%)',
                          }}
                        >
                          {persona.name.charAt(0)}
                        </span>
                      )}
                      <div className='min-w-0 flex-1'>
                        <p className='aucctus-text-primary truncate text-xs font-medium'>
                          {persona.name}
                        </p>
                        <p className='aucctus-text-tertiary truncate text-[10px]'>
                          {persona.segment}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Already tagged section */}
              {taggedPersonas.length > 0 && (
                <>
                  <div className='aucctus-border-secondary border-t px-3 py-1.5'>
                    <p className='aucctus-text-tertiary text-[10px] font-medium uppercase tracking-wider'>
                      Tagged
                    </p>
                  </div>
                  <div className='p-1 pb-2'>
                    {taggedPersonas.map((persona) => (
                      <button
                        key={persona.uuid}
                        type='button'
                        onClick={() => handleRemove(persona.uuid)}
                        className='aucctus-bg-secondary-hover flex w-full items-center gap-2 rounded-md px-3 py-2 text-left transition-colors'
                      >
                        {persona.avatarUrl ? (
                          <img
                            src={persona.avatarUrl}
                            alt={persona.name}
                            className='h-6 w-6 flex-shrink-0 rounded-full object-cover'
                          />
                        ) : (
                          <span
                            className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white'
                            style={{
                              backgroundColor:
                                persona.themeColor ?? 'hsl(270, 50%, 50%)',
                            }}
                          >
                            {persona.name.charAt(0)}
                          </span>
                        )}
                        <div className='min-w-0 flex-1'>
                          <p className='aucctus-text-primary truncate text-xs font-medium'>
                            {persona.name}
                          </p>
                        </div>
                        <Check
                          size={14}
                          className='aucctus-text-brand-primary flex-shrink-0'
                        />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      )}
    </div>
  );
};

export default ConceptPersonaTags;
