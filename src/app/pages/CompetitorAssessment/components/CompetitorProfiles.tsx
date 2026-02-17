import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { ICompetitor } from '@libs/api/types/competitorAssessment';
import CompetitorProfileCard from './CompetitorProfileCard';
import CompetitorDetailPanel from './CompetitorDetailPanel';
import { Swords } from 'lucide-react';

interface CompetitorProfilesProps {
  competitors: ICompetitor[];
}

const CompetitorProfiles: React.FC<CompetitorProfilesProps> = ({
  competitors,
}) => {
  const [selectedCompetitor, setSelectedCompetitor] =
    useState<ICompetitor | null>(null);

  const yourCompany = competitors.find((c) => c.isYourCompany);
  const otherCompetitors = competitors.filter((c) => !c.isYourCompany);
  const orderedCompetitors = yourCompany
    ? [yourCompany, ...otherCompetitors]
    : otherCompetitors;

  if (orderedCompetitors.length === 0) {
    return (
      <div className='aucctus-bg-secondary aucctus-border-secondary flex flex-col items-center justify-center rounded-xl border p-12'>
        <Swords size={48} className='aucctus-stroke-tertiary mb-4' />
        <p className='aucctus-text-secondary text-sm'>
          No competitors discovered yet. Run a scan to find competitors.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {orderedCompetitors.map((competitor, index) => (
          <CompetitorProfileCard
            key={competitor.uuid}
            competitor={competitor}
            onClick={() => setSelectedCompetitor(competitor)}
            index={index}
          />
        ))}
      </div>

      <AnimatePresence>
        {selectedCompetitor && (
          <CompetitorDetailPanel
            competitor={selectedCompetitor}
            onClose={() => setSelectedCompetitor(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default CompetitorProfiles;
