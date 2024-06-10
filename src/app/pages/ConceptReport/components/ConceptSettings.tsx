import { FunctionComponent } from 'react';
import SeedField from '../../../components/SeedField';
import { useConceptSeed } from '../../../hooks/query/concepts.hook';
import { useParams } from 'react-router-dom';
import Loading from '../../../components/Loading';

const ConceptSettings: FunctionComponent = () => {
  const { id: conceptUuid } = useParams();

  const { seed, isLoading } = useConceptSeed(conceptUuid || '');

  return (
    <div className='inline-flex h-96 w-full items-start justify-start px-10 pb-7'>
      <div className='flex h-24 w-96 flex-row flex-wrap items-start justify-start gap-5'>
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
