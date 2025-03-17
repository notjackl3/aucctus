import { FunctionComponent, useCallback } from 'react';
import { Icon, Loading } from '@components';
import SeedField from '@components/Text/SeedField';
import { useConceptSeed } from '@hooks/query/concepts.hook';
import { useParams, useNavigate } from 'react-router-dom';
import { useReseedStore } from '@stores/reseed.store';
import { IConceptSeed } from '@libs/api/concepts';
import { AppPath } from '@routes/routes';

const ConceptSettings: FunctionComponent = () => {
  const { id: conceptUuid } = useParams();
  const navigate = useNavigate();
  const { seed, isLoading } = useConceptSeed(conceptUuid || '');
  const { setSeed } = useReseedStore();

  const onReseedClick = useCallback(() => {
    setSeed(seed as IConceptSeed);

    const seedId = (seed as IConceptSeed)?.uuid;
    if (seedId) {
      navigate(`/concept/incubate/${String(seedId)}`);
    } else {
      navigate(AppPath.IncubateConcept);
    }
  }, [seed, navigate, setSeed]);

  return (
    <div className='inline-flex h-96 w-full flex-col gap-3 pt-2'>
      <div className='flex w-full items-center justify-start'>
        {/* Left Buttons */}
        <div className='aucctus-border-secondary inline-flex items-start justify-start rounded-lg border shadow'>
          <div className='aucctus-bg-secondary aucctus-border-secondary flex items-center justify-center gap-2 rounded-l-lg border-r px-4 py-2'>
            <div className='aucctus-text-primary aucctus-text-md-medium'>
              Original Prompt
            </div>
          </div>
          <div className='aucctus-border-secondary aucctus-bg-primary flex items-center justify-center gap-2 rounded-r-lg border-r py-2 pl-3.5 pr-4'>
            <Icon variant='lock' />
            <div className='aucctus-text-primary aucctus-text-md-medium'>
              Uploads
            </div>
          </div>
        </div>

        {/* Right Button */}
        <button
          aria-label='Re-seed Concept'
          className='btn btn-normal ml-2 px-[16px] py-[10px]'
          onClick={onReseedClick}
        >
          <Icon
            variant='refresh'
            height={20}
            width={20}
            className='stroke-gray-light-900'
          />
          Re-Use Prompt
        </button>
      </div>

      <div className='grid max-w-[80%] grid-cols-2 gap-4 pt-4'>
        {isLoading ? (
          <Loading />
        ) : (
          seed.answers.map((answer) => (
            <SeedField
              key={answer.question.label.replace(' ', '-')}
              question={answer.question.label}
              answer={answer.answer.join(', ')}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ConceptSettings;
