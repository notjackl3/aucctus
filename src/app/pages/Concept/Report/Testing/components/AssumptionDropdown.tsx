import React, { useCallback, useEffect, useRef } from 'react';
import { animated } from 'react-spring';
import { useExpandCollapseTransition } from '@hooks/animation/animation.hook';
import { IAssumptionV2 } from '@libs/api/types';
import CategoryIcon from '../../Assumptions/components/cards/category-progress-card/CategoryIcon';

interface AssumptionDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  availableAssumptions: IAssumptionV2[];
  onSelectAssumption: (assumptionUuid: string) => void;
  existingAssumptionUuids: Set<string>;
  existingAssumptionStatements: Set<string>;
}

const AssumptionDropdown: React.FC<AssumptionDropdownProps> = ({
  isOpen,
  onClose,
  availableAssumptions,
  onSelectAssumption,
  existingAssumptionUuids,
  existingAssumptionStatements,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  const transitions = useExpandCollapseTransition({
    isExpanded: isOpen,
    withOpacity: true,
    collapsedHeight: 0,
    maxHeight: 400,
    duration: 200,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleSelectAssumption = useCallback(
    (assumptionUuid: string) => {
      onSelectAssumption(assumptionUuid);
      onClose();
    },
    [onSelectAssumption, onClose],
  );

  // Filter out assumptions that are already added
  const filteredAssumptions = availableAssumptions.filter((assumption) => {
    const isAlreadyAddedByUuid = existingAssumptionUuids.has(assumption.uuid);
    const isAlreadyAddedByStatement = existingAssumptionStatements.has(
      assumption.statement,
    );
    return !isAlreadyAddedByUuid && !isAlreadyAddedByStatement;
  });

  return transitions(
    (style, item) =>
      item && (
        <animated.div
          ref={dropdownRef}
          style={style}
          className='absolute bottom-full left-0 z-50 mb-2 w-[400px] overflow-hidden'
        >
          <div className='aucctus-bg-primary aucctus-border-secondary max-h-[320px] overflow-y-auto rounded-lg border shadow-lg'>
            {/* Header */}
            <div className='aucctus-border-secondary border-b px-4 py-2.5'>
              <h4 className='aucctus-text-xs-semibold aucctus-text-brand-tertiary uppercase tracking-wide'>
                Available Assumptions
              </h4>
            </div>

            {/* Assumption List */}
            <div className='p-2'>
              {filteredAssumptions.length === 0 ? (
                <div className='aucctus-text-sm-regular aucctus-text-brand-secondary flex items-center justify-center py-8 text-center'>
                  No additional assumptions available
                </div>
              ) : (
                <ul className='space-y-1.5'>
                  {filteredAssumptions.map((assumption) => {
                    const categoryVal = (assumption.category?.toLowerCase() ||
                      'desirability') as
                      | 'desirability'
                      | 'feasibility'
                      | 'viability'
                      | 'adaptability';

                    return (
                      <li key={assumption.uuid}>
                        <button
                          type='button'
                          onClick={() =>
                            handleSelectAssumption(assumption.uuid)
                          }
                          className='aucctus-bg-primary-hover w-full rounded-md p-2.5 text-left transition-colors'
                        >
                          <div className='mb-1.5 flex items-center gap-1.5'>
                            <CategoryIcon category={categoryVal} />
                            <span className='aucctus-text-xs-medium aucctus-text-brand-secondary capitalize'>
                              {assumption.category || 'General'}
                            </span>
                          </div>
                          <p className='aucctus-text-sm-regular aucctus-text-brand-primary'>
                            {assumption.statement}
                          </p>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </animated.div>
      ),
  );
};

export default AssumptionDropdown;
