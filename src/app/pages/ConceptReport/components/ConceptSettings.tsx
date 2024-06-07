import { FunctionComponent } from 'react';
import Icon from '../../../components/Icons/Icon/Icon';
import SeedField from '../../../components/SeedField';
import { useConceptSeed } from '../../../hooks/query/concepts.hook';
import { useParams } from 'react-router-dom';

const ConceptSettings: FunctionComponent = () => {
  const { id: conceptUuid } = useParams();

  const { data: seed } = useConceptSeed(conceptUuid || '');

  return <div className='inline-flex h-full w-full flex-col items-center justify-start gap-8 pb-8'></div>;
};

export default ConceptSettings;
