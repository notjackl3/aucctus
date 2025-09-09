import { AppPath } from '@routes/routes';
import React from 'react';
import { Link } from 'react-router-dom';

const Testing: React.FC = () => {
  return (
    <div className='aucctus-bg-primary min-h-screen p-8'>
      <div className='mx-auto max-w-4xl'>
        <h1 className='aucctus-header-xl-bold aucctus-text-primary mb-8'>
          Testing Dashboard
        </h1>

        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          <Link
            to={AppPath.TestingNucleus}
            className='aucctus-bg-secondary-hover aucctus-border-primary block rounded-lg border p-6 transition-colors duration-200'
          >
            <h2 className='aucctus-header-md-semibold aucctus-text-primary mb-3'>
              Nucleus Components
            </h2>
            <p className='aucctus-text-sm aucctus-text-secondary'>
              Test and preview nucleus visualization components including org
              charts, SWOT analysis, risk index, and brand equity
              visualizations.
            </p>
          </Link>

          <Link
            to={AppPath.TestingConceptOverview}
            className='aucctus-bg-secondary-hover aucctus-border-primary block rounded-lg border p-6 transition-colors duration-200'
          >
            <h2 className='aucctus-header-md-semibold aucctus-text-primary mb-3'>
              Concept Overview Components
            </h2>
            <p className='aucctus-text-sm aucctus-text-secondary'>
              Test and preview concept overview components including executive
              dashboard, key assumptions, customer profiles, trends & drivers,
              ecosystem, and business model cards.
            </p>
          </Link>

          {/* Placeholder for future testing modules */}
          <div className='aucctus-bg-secondary aucctus-border-secondary rounded-lg border p-6 opacity-50'>
            <h2 className='aucctus-header-md-semibold aucctus-text-tertiary mb-3'>
              Other Components
            </h2>
            <p className='aucctus-text-sm aucctus-text-tertiary'>
              Additional testing modules coming soon...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testing;
