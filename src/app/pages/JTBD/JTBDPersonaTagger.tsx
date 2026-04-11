import { usePersonas } from '@hooks/query/persona.hook';
import { cn } from '@libs/utils/react';
import * as Popover from '@radix-ui/react-popover';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Plus, Users, X } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';

interface JTBDPersonaTaggerProps {
  selectedUuids: string[];
  onChange: (uuids: string[]) => void;
}

const MAX_PERSONAS = 6;

const JTBDPersonaTagger: React.FC<JTBDPersonaTaggerProps> = ({
  selectedUuids,
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const { personas: allPersonas, isLoading: personasLoading } = usePersonas();

  const selectedSet = useMemo(() => new Set(selectedUuids), [selectedUuids]);

  const selectedPersonas = useMemo(() => {
    if (!allPersonas) return [];
    return allPersonas.filter((p) => selectedSet.has(p.uuid));
  }, [allPersonas, selectedSet]);

  const availablePersonas = useMemo(() => {
    if (!allPersonas) return [];
    return allPersonas.filter((p) => !selectedSet.has(p.uuid));
  }, [allPersonas, selectedSet]);

  const atLimit = selectedUuids.length >= MAX_PERSONAS;

  const handleAdd = useCallback(
    (personaUuid: string) => {
      if (atLimit) return;
      onChange([...selectedUuids, personaUuid]);
    },
    [atLimit, selectedUuids, onChange],
  );

  const handleRemove = useCallback(
    (personaUuid: string) => {
      onChange(selectedUuids.filter((u) => u !== personaUuid));
    },
    [selectedUuids, onChange],
  );

  return (
    <div>
      <div className='flex flex-wrap items-center gap-2'>
        {/* Selected persona chips */}
        <AnimatePresence mode='popLayout'>
          {selectedPersonas.map((persona) => (
            <motion.span
              key={persona.uuid}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              layout
              className='inline-flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.08] px-2.5 py-1 text-xs font-medium'
            >
              {persona.avatar ? (
                <img
                  src={persona.avatar}
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
              <span className='text-white/80'>{persona.name}</span>
              <button
                type='button'
                onClick={() => handleRemove(persona.uuid)}
                className='ml-0.5 text-white/30 transition-colors hover:text-red-400'
                aria-label={`Remove ${persona.name}`}
              >
                <X size={12} />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>

        {/* Add persona button + popover */}
        <Popover.Root open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <button
              type='button'
              disabled={atLimit}
              className={cn(
                'inline-flex items-center gap-1 rounded-full border border-white/[0.1] px-2.5 py-1 text-xs font-medium transition-colors',
                atLimit
                  ? 'cursor-not-allowed text-white/30 opacity-50'
                  : 'text-white/50 hover:bg-white/[0.08] hover:text-white/70',
              )}
            >
              {selectedUuids.length > 0 ? (
                <>
                  <Plus size={12} />
                  <span>
                    {selectedUuids.length}/{MAX_PERSONAS}
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
              className='z-50 w-64 overflow-hidden rounded-lg border border-white/[0.15] bg-black/90 shadow-xl backdrop-blur-xl'
            >
              <div className='border-b border-white/[0.1] px-3 py-2'>
                <p className='text-xs font-medium text-white/50'>
                  Tag Personas ({selectedUuids.length}/{MAX_PERSONAS})
                </p>
              </div>
              <div className='max-h-48 overflow-y-auto p-1'>
                {personasLoading ? (
                  <p className='px-3 py-2 text-xs text-white/30'>Loading...</p>
                ) : availablePersonas.length === 0 ? (
                  <p className='px-3 py-2 text-xs text-white/30'>
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
                        'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left transition-colors hover:bg-white/[0.08]',
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
                        <p className='truncate text-xs font-medium text-white/80'>
                          {persona.name}
                        </p>
                        <p className='truncate text-[10px] text-white/40'>
                          {persona.segment}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Already tagged section */}
              {selectedPersonas.length > 0 && (
                <>
                  <div className='border-t border-white/[0.1] px-3 py-1.5'>
                    <p className='text-[10px] font-medium uppercase tracking-wider text-white/30'>
                      Tagged
                    </p>
                  </div>
                  <div className='p-1 pb-2'>
                    {selectedPersonas.map((persona) => (
                      <button
                        key={persona.uuid}
                        type='button'
                        onClick={() => handleRemove(persona.uuid)}
                        className='flex w-full items-center gap-2 rounded-md px-3 py-2 text-left transition-colors hover:bg-white/[0.08]'
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
                          <p className='truncate text-xs font-medium text-white/80'>
                            {persona.name}
                          </p>
                        </div>
                        <Check
                          size={14}
                          className='flex-shrink-0 text-emerald-400'
                        />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
    </div>
  );
};

export default JTBDPersonaTagger;
