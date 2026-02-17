import { Icon, ComponentTooltip } from '@components';
import {
  ConceptStatus,
  SeedStatus,
  ConceptReportStatus,
  ConceptIncubationQuestionnaireType,
} from '@libs/api/types';
import * as Popover from '@radix-ui/react-popover';
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { cn } from '@libs/utils/react';

// Common interface for all action menu buttons
interface IActionsMenuButtonProps {
  identifier: string;
  status?: ConceptStatus | SeedStatus;
  reportStatus?: ConceptReportStatus;
  onArchive: (uuid: string) => void;
  onUnarchive: (uuid: string) => void;
  onCancelReport?: (uuid: string) => void;
  onCloneConceptSeed?: (conceptUuid: string) => void; // Receives concept UUID, parent should handle getting seedUuid and cloning
  buttonClassName?: string;
  iconSize?: number;
  seedType?: ConceptIncubationQuestionnaireType;
}

const ActionsMenuButton: React.FC<IActionsMenuButtonProps> = ({
  identifier,
  status,
  reportStatus,
  onArchive,
  onUnarchive,
  onCancelReport,
  onCloneConceptSeed,
  buttonClassName = 'btn flex h-8 w-8 items-center justify-center rounded-lg border border-gray-100 bg-white p-0 shadow-sm transition-all hover:bg-gray-50',
  iconSize = 24,
  seedType,
}) => {
  const [open, setOpen] = React.useState<boolean>(false);
  const archiveLabel = status !== 'archived' ? 'Archive' : 'Unarchive';
  const showCancelReport = reportStatus === 'pending' && onCancelReport;
  const showCloneConceptSeed = status !== 'draft' && onCloneConceptSeed;

  const disableCloneConceptSeed =
    seedType === 'EMPLOYEE_SUBMISSION' || seedType === 'WATCHTOWER_SIGNAL';

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          className={cn(buttonClassName, {
            'bg-gray-50': open,
          })}
          aria-label='Update Item'
        >
          <Icon variant='dots-vertical' height={iconSize} width={iconSize} />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <AnimatePresence>
          {open && (
            <Popover.Content
              className='aucctus-bg-primary aucctus-border-secondary z-[9999] min-w-[160px] rounded-lg border p-2 shadow-lg'
              side='left'
              sideOffset={5}
              onInteractOutside={() => setOpen(false)}
              onEscapeKeyDown={() => setOpen(false)}
              forceMount
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                <div className='flex flex-col'>
                  <button
                    className='btn btn-no-border btn-light hover:aucctus-bg-secondary flex w-full items-center justify-start px-3 py-2'
                    onClick={() => {
                      if (status === 'archived') {
                        onUnarchive(identifier);
                      } else {
                        onArchive(identifier);
                      }
                      setOpen(false);
                    }}
                  >
                    <span className='aucctus-text-primary text-base'>
                      {archiveLabel}
                    </span>
                  </button>

                  {showCancelReport && (
                    <>
                      <div className='aucctus-bg-secondary mx-2 h-px' />
                      <button
                        className='btn btn-no-border btn-light hover:aucctus-bg-secondary flex w-full items-center justify-start px-3 py-2'
                        onClick={() => {
                          onCancelReport?.(identifier);
                          setOpen(false);
                        }}
                      >
                        <span className='aucctus-text-primary text-base'>
                          Cancel Report
                        </span>
                      </button>
                    </>
                  )}

                  {showCloneConceptSeed && (
                    <>
                      <div className='aucctus-bg-secondary mx-2 h-px' />
                      {disableCloneConceptSeed ? (
                        <ComponentTooltip
                          tip={
                            <div className='aucctus-text-primary aucctus-text-sm aucctus-bg-primary rounded-lg p-6'>
                              Not available for this seed type
                            </div>
                          }
                        >
                          <button
                            className='btn btn-no-border btn-light flex w-full cursor-not-allowed items-center justify-start px-3 py-2 opacity-50'
                            disabled={true}
                          >
                            <span className='aucctus-text-primary text-base'>
                              Clone Concept Seed
                            </span>
                          </button>
                        </ComponentTooltip>
                      ) : (
                        <button
                          className='btn btn-no-border btn-light hover:aucctus-bg-secondary flex w-full items-center justify-start px-3 py-2'
                          onClick={() => {
                            onCloneConceptSeed?.(identifier);
                            setOpen(false);
                          }}
                        >
                          <span className='aucctus-text-primary text-base'>
                            Clone Concept Seed
                          </span>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            </Popover.Content>
          )}
        </AnimatePresence>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default ActionsMenuButton;
