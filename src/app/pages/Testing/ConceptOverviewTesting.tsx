import { ConceptOverview } from '@components';
import React from 'react';

const ConceptOverviewTesting: React.FC = () => {
  return (
    <div className='aucctus-bg-primary min-h-screen p-8'>
      <div className='mx-auto max-w-7xl'>
        <h1 className='aucctus-header-xl-bold aucctus-text-primary mb-8'>
          Concept Overview Testing
        </h1>

        <p className='aucctus-text-md aucctus-text-secondary mb-6'>
          Testing environment for concept overview components including
          executive dashboard, key assumptions, customer profiles, trends &
          drivers, ecosystem, and business model cards.
        </p>

        <div className='space-y-8'>
          <section>
            <ConceptOverview.ExecutiveDashboard />
          </section>
        </div>
      </div>
    </div>
  );
};

export default ConceptOverviewTesting;
