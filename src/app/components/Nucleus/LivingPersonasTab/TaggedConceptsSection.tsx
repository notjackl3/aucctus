/**
 * TaggedConceptsSection - Displays concepts tagged with a living persona.
 *
 * Shows a list of concepts linked to the persona via the living_personas M2M,
 * with clickable rows that navigate to the concept report.
 */

import { motion } from 'framer-motion';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassSurface } from '@components';
import { useTaggedConcepts } from '@hooks/query/persona.hook';
import { AppPath } from '@routes/routes';
import { Lightbulb, ChevronRight } from 'lucide-react';
import { cn } from '@libs/utils/react';
import {
  getConceptStatusColor,
  getConceptStatusDisplayName,
  CONCEPT_STATUS_STYLE_MAP,
} from '@libs/utils/concepts';
import type { ConceptStatus } from '@libs/api/types/concept/concepts';

export interface TaggedConceptsSectionProps {
  personaUuid: string;
  className?: string;
}

const TaggedConceptsSection: React.FC<TaggedConceptsSectionProps> = ({
  personaUuid,
  className,
}) => {
  const { concepts, isLoading } = useTaggedConcepts(personaUuid);
  const navigate = useNavigate();

  const handleConceptClick = (concept: {
    identifier: string;
    status: string;
  }) => {
    if (concept.status === 'new') {
      navigate(AppPath.ConceptBank);
    } else {
      navigate(AppPath.ConceptOverview.replace(':id', concept.identifier));
    }
  };

  return (
    <div className={className}>
      <GlassSurface className='overflow-hidden'>
        <div className='p-6'>
          <h3 className='aucctus-text-xs-bold aucctus-text-tertiary mb-4 uppercase tracking-wider'>
            Tagged Concepts
          </h3>

          {isLoading ? (
            <div className='animate-pulse space-y-3'>
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className='aucctus-bg-secondary h-16 rounded-xl' />
              ))}
            </div>
          ) : concepts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className='aucctus-text-tertiary flex flex-col items-center gap-2 py-6 text-center'
            >
              <Lightbulb className='h-8 w-8 opacity-40' />
              <p className='aucctus-text-sm'>
                No concepts have been tagged with this persona yet.
              </p>
              <p className='aucctus-text-xs opacity-60'>
                Tag a persona in the Idea Playground to see linked concepts
                here.
              </p>
            </motion.div>
          ) : (
            <div className='space-y-2'>
              {concepts.map((concept, index) => {
                const statusColor = getConceptStatusColor(
                  concept.status as ConceptStatus,
                );
                const styles = CONCEPT_STATUS_STYLE_MAP[statusColor];
                const statusLabel = getConceptStatusDisplayName(
                  concept.status as ConceptStatus,
                );

                return (
                  <motion.button
                    key={concept.uuid}
                    type='button'
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.04 }}
                    onClick={() => handleConceptClick(concept)}
                    className={cn(
                      'aucctus-bg-secondary group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left',
                      'transition-all duration-200',
                      'hover:aucctus-bg-tertiary hover:shadow-sm',
                    )}
                  >
                    <div className='min-w-0 flex-1'>
                      <p className='aucctus-text-primary aucctus-text-sm-medium truncate'>
                        {concept.name}
                      </p>
                      <div className='mt-1 flex items-center gap-2'>
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                            styles.bg,
                            styles.text,
                          )}
                        >
                          <span
                            className={cn(
                              'h-1.5 w-1.5 rounded-full',
                              styles.bullet,
                            )}
                          />
                          {statusLabel}
                        </span>
                        <span className='aucctus-text-tertiary text-xs'>
                          {new Date(concept.createdAt).toLocaleDateString(
                            undefined,
                            {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            },
                          )}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className='aucctus-text-tertiary h-4 w-4 flex-shrink-0 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100' />
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
      </GlassSurface>
    </div>
  );
};

export default TaggedConceptsSection;
