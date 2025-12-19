import React from 'react';
import PersonaCard from './PersonaCard';

// Colors for the persona indicators - MUST match the colors in ParticipantChart
const COLORS = ['#FF8A00', '#00C853', '#00B0FF', '#AA00FF'];

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
  maxParticipants?: number;
}

const ParticipantsList: React.FC<ParticipantsListProps> = ({
  personaDistribution,
  onUpdateParticipantCount,
  isUpdating,
  disableActions = false,
  maxParticipants = 20,
}) => {
  const handleCountChange = (id: string, count: number) => {
    onUpdateParticipantCount(id, count);
  };

  return (
    <div className='max-h-[400px] overflow-auto pr-1'>
      <div className='grid grid-cols-2 gap-2'>
        {personaDistribution.map((persona, index) => (
          <PersonaCard
            key={persona.id}
            persona={{
              id: persona.id,
              name: persona.name,
              segment: persona.segment,
              avatar: persona.avatar,
              count: persona.count,
              ratio: persona.ratio,
              color: COLORS[index % COLORS.length],
            }}
            onCountChange={handleCountChange}
            maxParticipants={maxParticipants}
            disabled={isUpdating || disableActions}
          />
        ))}
      </div>
    </div>
  );
};

export default ParticipantsList;
