import { Icon } from '@components';
import EditModeSwitcher from '@components/Text/EditModeSwitcher/EditModeSwitcher';
import { IGeneratedConcept } from '@libs/api/types';
import { useConceptGenerationStore } from '@stores/concept-generation.store';
import { useConceptIncubationStore } from '@stores/concept-incubation/enhancedStore';
import React from 'react';
interface ConceptHeaderProps {
  title: string;
  onSelect: () => void;
  isSelected: boolean;
}

const ConceptHeader: React.FC<ConceptHeaderProps> = ({
  title,
  onSelect,
  isSelected,
}) => {
  return (
    <div className='m-4 flex flex-row items-center justify-center gap-2'>
      <span className='aucctus-text-brand-primary aucctus-text-xl-semibold'>
        {title}
      </span>
      <span className='flex flex-1'></span>
      <button onClick={onSelect} className='btn btn-light !p-2'>
        <Icon variant='check-circle-broken' height={20} width={20} />{' '}
        {isSelected ? 'Unselect' : 'Select'}
      </button>
    </div>
  );
};

interface SelectedConceptProps {
  activeConcept: IGeneratedConcept;
  onSelect: (concept: IGeneratedConcept) => void;
  isSelected: boolean;
}

const SelectedConcept: React.FC<SelectedConceptProps> = ({
  activeConcept,
  onSelect,
  isSelected,
}) => {
  React.useEffect(() => {
    setValueProposition(activeConcept.valueProposition);
    setOverview(activeConcept.overview);
  }, [activeConcept]);

  const { draftSeedUuid } = useConceptIncubationStore();
  const { updateGeneratedConcept } = useConceptGenerationStore();
  const [valueProposition, setValueProposition] = React.useState(
    activeConcept.valueProposition,
  );
  const [overview, setOverview] = React.useState(activeConcept.overview);

  const handleSave = () => {
    activeConcept.valueProposition = valueProposition;
    activeConcept.overview = overview;
    updateGeneratedConcept(draftSeedUuid, activeConcept);
  };

  return (
    <>
      <ConceptHeader
        isSelected={isSelected}
        title={activeConcept.title!}
        onSelect={() => onSelect(activeConcept)}
      />
      <div className='aucctus-text-secondary aucctus-text-sm mx-4 flex flex-row gap-2'>
        <EditModeSwitcher
          pClassName='aucctus-text-brand-secondary aucctus-text-sm'
          textFieldClassName='aucctus-text-brand-secondary aucctus-text-sm'
          value={overview}
          label=''
          name='overview'
          maxLength={1000}
          rows={1}
          onChange={(e) => setOverview(e.target.value)}
          handleSave={handleSave}
          handleCancel={() => {
            setOverview(activeConcept.overview);
          }}
        />
      </div>
      <div className='aucctus-text-primary aucctus-text-md-semibold mx-4 mt-4'>
        Value Proposition
      </div>
      <div className='aucctus-text-secondary aucctus-text-sm mx-4 flex flex-row gap-2'>
        <EditModeSwitcher
          pClassName='aucctus-text-brand-secondary aucctus-text-sm'
          textFieldClassName='aucctus-text-brand-secondary aucctus-text-sm'
          value={valueProposition}
          label=''
          name='valueProposition'
          maxLength={1000}
          rows={1}
          onChange={(e) => setValueProposition(e.target.value)}
          handleSave={handleSave}
          handleCancel={() =>
            setValueProposition(activeConcept.valueProposition)
          }
        />
      </div>
    </>
  );
};

export default SelectedConcept;
