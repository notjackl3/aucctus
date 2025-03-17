import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import IncubateConcept from './IncubateConcept';

const IncubateConceptWrapper: React.FC = () => {
  // Extract UUID from URL parameters
  const { uuid } = useParams<{ uuid?: string }>();

  // Also check for query parameters for backward compatibility
  const [searchParams] = useSearchParams();
  const seedUuidFromQuery = searchParams.get('seed');

  // Use UUID from path params if available, otherwise fall back to query params
  const initialDraftSeedUuid = uuid || seedUuidFromQuery || undefined;

  console.log('initialDraftSeedUuid', initialDraftSeedUuid);

  try {
    return <IncubateConcept initialDraftSeedUuid={initialDraftSeedUuid} />;
  } catch (error) {
    // Replace console.error with a proper error handling mechanism
    return (
      <div className='p-8'>
        <h1>Error Loading Incubate Concept</h1>
        <p>
          There was an error loading this component. Please try again or contact
          support.
        </p>
      </div>
    );
  }
};

export default IncubateConceptWrapper;
