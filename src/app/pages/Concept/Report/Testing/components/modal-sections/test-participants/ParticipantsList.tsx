import React, { useState } from 'react';
import { Icon } from '@components';

import defaultAvatar from '@assets/img/avatar.png';

interface PersonaDistribution {
  id: string;
  participantUuid: string;
  profileUuid: string;
  name: string;
  segment: string;
  description: string;
  avatar: string;
  count: number;
  ratio: number;
  status: string;
  isSkipped: boolean;
  isPrimary: boolean;
  geoLocation: string;
  ageRange: string;
  incomeRange: string;
  occupation: string;
  notes: string;
  color: string;
}

interface ParticipantsListProps {
  personaDistribution: PersonaDistribution[];
  onUpdateParticipantCount: (
    participantId: string,
    newCount: number,
  ) => Promise<void>;
  isUpdating: boolean;
  disableActions?: boolean;
  onRequestSkip?: (participant: PersonaDistribution) => void;
  onRequestUnskip?: (participant: PersonaDistribution) => void;
}

const ParticipantsList: React.FC<ParticipantsListProps> = ({
  personaDistribution,
  onUpdateParticipantCount,
  isUpdating,
  disableActions = false,
  onRequestSkip,
  onRequestUnskip,
}) => {
  const [editingParticipantId, setEditingParticipantId] = useState<
    string | null
  >(null);
  const [editingValue, setEditingValue] = useState<number>(0);

  // Start editing a participant count
  const startEditingParticipant = (
    participantId: string,
    currentCount: number,
  ) => {
    setEditingParticipantId(participantId);
    setEditingValue(currentCount);
  };

  // Cancel editing
  const cancelEditingParticipant = () => {
    setEditingParticipantId(null);
    setEditingValue(0);
  };

  // Handle submit for participant count edit
  const handleSubmitParticipantEdit = async () => {
    if (editingParticipantId) {
      await onUpdateParticipantCount(editingParticipantId, editingValue);
      setEditingParticipantId(null);
      setEditingValue(0);
    }
  };

  return (
    <div className='aucctus-border-secondary aucctus-bg-primary rounded-lg border p-6'>
      <div className='mb-4 flex items-center justify-between'>
        <h4 className='aucctus-text-md-semibold aucctus-text-brand-primary'>
          Personas to target
        </h4>
      </div>

      <div className='max-h-[450px] space-y-4 overflow-auto pr-1'>
        {personaDistribution.map((persona) => {
          const isSkipped = persona.isSkipped;
          const actionsDisabled = isUpdating || disableActions;

          return (
            <div
              key={persona.id}
              className='aucctus-border-secondary aucctus-bg-secondary-subtle rounded-lg border p-4'
            >
              {/* Persona Header */}
              <div className='mb-3 flex items-start justify-between'>
                <div className='flex items-center gap-3'>
                  {/* Color indicator */}
                  <div
                    className='h-3 w-3 rounded-full'
                    style={{ backgroundColor: persona.color }}
                  />

                  {/* Avatar */}
                  <img
                    className='aucctus-border-secondary h-10 w-10 rounded-full border object-cover'
                    alt={persona.name}
                    src={persona.avatar || defaultAvatar}
                  />

                  {/* Name and Segment */}
                  <div>
                    <div className='flex items-center gap-2'>
                      <h5 className='aucctus-text-sm-semibold aucctus-text-brand-primary'>
                        {persona.name}
                      </h5>
                      {persona.isPrimary && (
                        <span className='aucctus-bg-brand-secondary aucctus-text-brand-tertiary flex items-center gap-1 rounded-full px-2 py-0.5 text-xs'>
                          <Icon
                            variant='briefcase'
                            height={10}
                            width={10}
                            className='aucctus-stroke-brand-primary'
                          />
                          Primary
                        </span>
                      )}
                    </div>
                    <span className='aucctus-text-xs-regular aucctus-text-secondary'>
                      {persona.segment}
                    </span>
                  </div>
                </div>

                {/* Count and Ratio Controls */}
                <div className='flex items-center gap-3'>
                  <div className='flex items-center gap-2'>
                    <div className='aucctus-text-xs-semibold aucctus-text-tertiary aucctus-bg-secondary rounded px-2 py-1'>
                      {persona.ratio}%
                    </div>
                    {isSkipped && (
                      <span className='aucctus-text-xs-semibold aucctus-text-error-primary aucctus-bg-error-subtle rounded px-2 py-0.5'>
                        Skipped
                      </span>
                    )}
                  </div>

                  {/* Editable Count Section */}
                  {editingParticipantId === persona.id ? (
                    <div className='flex items-center gap-2'>
                      <input
                        type='number'
                        className='aucctus-border-secondary aucctus-text-sm w-16 rounded border p-1 text-center'
                        value={editingValue}
                        onChange={(e) =>
                          setEditingValue(parseInt(e.target.value) || 0)
                        }
                        min={0}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSubmitParticipantEdit();
                          } else if (e.key === 'Escape') {
                            cancelEditingParticipant();
                          }
                        }}
                      />
                      <button
                        className='btn btn-success btn-xs'
                        onClick={handleSubmitParticipantEdit}
                        disabled={actionsDisabled}
                      >
                        <Icon
                          variant='check'
                          className='aucctus-stroke-white h-3 w-3'
                        />
                      </button>
                      <button
                        className='btn btn-secondary btn-xs'
                        onClick={cancelEditingParticipant}
                        disabled={actionsDisabled}
                      >
                        <Icon
                          variant='closeX'
                          className='aucctus-stroke-secondary h-3 w-3'
                        />
                      </button>
                    </div>
                  ) : (
                    <div className='flex items-center gap-2'>
                      <span className='aucctus-text-sm-semibold aucctus-text-brand-primary px-3 py-1'>
                        {persona.count}
                      </span>
                      <button
                        className='btn btn-secondary btn-xs'
                        onClick={() =>
                          startEditingParticipant(persona.id, persona.count)
                        }
                        disabled={actionsDisabled || isSkipped}
                      >
                        <Icon
                          variant='edit'
                          className='aucctus-stroke-secondary h-3 w-3'
                        />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Persona Details */}
              <div className='space-y-2'>
                <p className='aucctus-text-sm-regular aucctus-text-secondary line-clamp-2'>
                  {persona.description}
                </p>

                {/* Demographics */}
                <div className='flex flex-wrap gap-4 text-xs'>
                  <div className='flex items-center gap-1'>
                    <Icon
                      variant='globe'
                      className='aucctus-stroke-tertiary h-3 w-3'
                    />
                    <span className='aucctus-text-tertiary'>
                      {persona.geoLocation}
                    </span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <Icon
                      variant='calendar'
                      className='aucctus-stroke-tertiary h-3 w-3'
                    />
                    <span className='aucctus-text-tertiary'>
                      {persona.ageRange}
                    </span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <Icon
                      variant='briefcase'
                      className='aucctus-stroke-tertiary h-3 w-3'
                    />
                    <span className='aucctus-text-tertiary'>
                      {persona.occupation}
                    </span>
                  </div>
                </div>
              </div>
              <div className='mt-3 flex items-center justify-between border-t pt-3'>
                <span className='aucctus-text-xs-regular aucctus-text-secondary'>
                  {isSkipped
                    ? 'Skipped personas are excluded from collateral updates.'
                    : 'Skip personas to focus collateral on your key audiences.'}
                </span>
                {isSkipped ? (
                  <button
                    className='btn btn-primary btn-xs'
                    onClick={() => onRequestUnskip?.(persona)}
                    disabled={actionsDisabled || !onRequestUnskip}
                  >
                    Unskip
                  </button>
                ) : (
                  <button
                    className='btn btn-text btn-xs aucctus-text-error-primary'
                    onClick={() => onRequestSkip?.(persona)}
                    disabled={actionsDisabled || !onRequestSkip}
                  >
                    Skip
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ParticipantsList;
