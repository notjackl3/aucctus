import { FunctionComponent } from 'react';
import SeedField from '../../../components/SeedField';
import { useConceptSeed } from '../../../hooks/query/concepts.hook';
import { useParams } from 'react-router-dom';
import Loading from '../../../components/Loading';
import Icon from '../../../components/Icons/Icon/Icon';

const ConceptSettings: FunctionComponent = () => {
  const { id: conceptUuid } = useParams();

  const { seed, isLoading } = useConceptSeed(conceptUuid || '');

  return (
    <div className='inline-flex h-96 w-full flex-col items-start justify-start gap-3 px-8 pb-8'>
      <div className='inline-flex items-start justify-start rounded-lg border border-gray-300 shadow'>
        {/* TODO: Convert these to buttons */}
        <div className='flex items-center justify-center gap-2 rounded-l-lg border-r border-gray-300 bg-gray-50 px-4 py-2'>
          <div className='text-base font-semibold leading-tight text-slate-700'>Original Prompt</div>
        </div>
        <div className='flex items-center justify-center gap-2 rounded-r-lg border-r border-gray-300 bg-white py-2 pl-3.5 pr-4'>
          <Icon variant='lock' />
          <div className='text-base font-semibold leading-tight text-slate-700'>Uploads</div>
        </div>
      </div>

      <div className='grid grid-flow-col grid-rows-2 gap-4'>
        {isLoading ? (
          <Loading />
        ) : (
          seed.attributes.map((attribute) => (
            <SeedField
              key={attribute.question.replace(' ', '-')}
              question={attribute.question}
              answer={attribute.answer}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ConceptSettings;
