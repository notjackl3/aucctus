import { FunctionComponent, useCallback } from 'react';
import { Icon, Loading } from '@components';
import SeedField from '@components/Text/SeedField';
import { useConceptSeed } from '@hooks/query/concepts.hook';
import { useParams, useNavigate } from 'react-router-dom';
import { useReseedStore } from '@stores/reseed.store';
import { IConceptSeed } from '@libs/api/concepts';
import { AppPath } from '@routes/routes';

const defaultIconProps = {
  width: 20,
  height: 20,
  stroke: '#98A2B3',
};

const ConceptSettings: FunctionComponent = () => {
  const { id: conceptUuid } = useParams();
  const navigate = useNavigate();
  const { seed, isLoading } = useConceptSeed(conceptUuid || '');
  const { setSeed } = useReseedStore();

  const onReseedClick = useCallback(() => {
    setSeed(seed as IConceptSeed);
    navigate(AppPath.IgniteConcept);
  }, [seed]);

  return (
    <div className='inline-flex h-96 w-full flex-col gap-3 pt-2'>
      <div className='flex w-full items-center justify-start'>
        {/* Left Buttons */}
        <div className='inline-flex items-start justify-start rounded-lg border border-gray-300 shadow'>
          <div className='flex items-center justify-center gap-2 rounded-l-lg border-r border-gray-300 bg-gray-50 px-4 py-2'>
            <div className='text-base font-semibold leading-tight text-slate-700'>
              Original Prompt
            </div>
          </div>
          <div className='flex items-center justify-center gap-2 rounded-r-lg border-r border-gray-300 bg-white py-2 pl-3.5 pr-4'>
            <Icon variant='lock' />
            <div className='text-base font-semibold leading-tight text-slate-700'>
              Uploads
            </div>
          </div>
        </div>

        {/* Right Button */}
        <button
          aria-label='Re-seed Concept'
          className='btn btn-normal hover:bg-secondary-600 ml-2 px-[16px] py-[10px]'
          onClick={onReseedClick}
        >
          <Icon variant='refresh' {...defaultIconProps} />
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
              answer={answer.answer}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ConceptSettings;
