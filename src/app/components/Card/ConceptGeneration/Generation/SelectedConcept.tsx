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
  const { draftSeedUuid } = useConceptIncubationStore();
  const { updateGeneratedConcept } = useConceptGenerationStore();
  const [valueProposition, setValueProposition] = React.useState(
    activeConcept?.valueProposition || '',
  );
  const [overview, setOverview] = React.useState(activeConcept?.overview || '');
  const [problemStatement, setProblemStatement] = React.useState(
    activeConcept?.problemStatement || '',
  );
  const [differentiators, setDifferentiators] = React.useState(
    activeConcept?.differentiators || [],
  );
  const [rightsToWin, setRightToWin] = React.useState(
    activeConcept?.rightsToWin || [],
  );

  React.useEffect(() => {
    if (activeConcept) {
      setValueProposition(activeConcept.valueProposition);
      setOverview(activeConcept.overview);
      setProblemStatement(activeConcept.problemStatement);
      setDifferentiators(activeConcept.differentiators || []);
      setRightToWin(activeConcept.rightsToWin || []);
    }
  }, [activeConcept]);

  const handleSave = () => {
    if (activeConcept && draftSeedUuid) {
      activeConcept.valueProposition = valueProposition;
      activeConcept.overview = overview;
      activeConcept.problemStatement = problemStatement;
      activeConcept.differentiators = differentiators;
      activeConcept.rightsToWin = rightsToWin;
      updateGeneratedConcept(draftSeedUuid, activeConcept);
    }
  };

  const handleDifferentiatorChange = (index: number, value: string) => {
    const updated = [...differentiators];
    updated[index] = { ...updated[index], description: value };
    setDifferentiators(updated);
  };

  const handleRightToWinChange = (index: number, value: string) => {
    const updated = [...rightsToWin];
    updated[index] = { ...updated[index], description: value };
    setRightToWin(updated);
  };

  // Don't render if no active concept
  if (!activeConcept) {
    return (
      <div className='flex h-full items-center justify-center'>
        <span className='aucctus-text-secondary'>Loading concept...</span>
      </div>
    );
  }

  return (
    <>
      <ConceptHeader
        isSelected={isSelected}
        title={activeConcept?.title || ''}
        onSelect={() => activeConcept && onSelect(activeConcept)}
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

      <div className='aucctus-text-primary aucctus-text-md-semibold mx-4 mb-1 mt-4'>
        Problem Statement
      </div>
      <div className='aucctus-text-secondary aucctus-text-sm mx-4 flex flex-row gap-2'>
        <EditModeSwitcher
          pClassName='aucctus-text-brand-secondary aucctus-text-sm'
          textFieldClassName='aucctus-text-brand-secondary aucctus-text-sm'
          value={problemStatement}
          label=''
          name='problemStatement'
          maxLength={1000}
          rows={1}
          onChange={(e) => setProblemStatement(e.target.value)}
          handleSave={handleSave}
          handleCancel={() =>
            setProblemStatement(activeConcept.problemStatement)
          }
        />
      </div>

      <div className='aucctus-text-primary aucctus-text-md-semibold mx-4 mb-1 mt-4'>
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

      <div className='aucctus-text-primary aucctus-text-md-semibold mx-4 mb-1 mt-4'>
        Differentiators
      </div>
      <div className='mx-4 flex flex-col gap-2'>
        {differentiators
          .sort((a, b) => a.order - b.order)
          .map((item, index) => (
            <div
              key={index}
              className='aucctus-text-secondary aucctus-text-sm flex flex-row gap-2'
            >
              <span className='aucctus-text-tertiary flex min-w-[1.5rem] items-center justify-center'>
                •
              </span>
              <EditModeSwitcher
                pClassName='aucctus-text-brand-secondary aucctus-text-sm flex-1'
                textFieldClassName='aucctus-text-brand-secondary aucctus-text-sm flex-1'
                value={item.description}
                label=''
                name={`differentiator-${index}`}
                maxLength={500}
                rows={1}
                onChange={(e) =>
                  handleDifferentiatorChange(index, e.target.value)
                }
                handleSave={handleSave}
                handleCancel={() => {
                  setDifferentiators(activeConcept.differentiators || []);
                }}
              />
            </div>
          ))}
      </div>

      <div className='aucctus-text-primary aucctus-text-md-semibold mx-4 mb-1 mt-4'>
        Rights to Win
      </div>
      <div className='mx-4 flex flex-col gap-2'>
        {rightsToWin
          .sort((a, b) => a.order - b.order)
          .map((item, index) => (
            <div
              key={index}
              className='aucctus-text-secondary aucctus-text-sm flex flex-row gap-2'
            >
              <span className='aucctus-text-tertiary flex min-w-[1.5rem] items-center justify-center'>
                •
              </span>
              <EditModeSwitcher
                pClassName='aucctus-text-brand-secondary aucctus-text-sm flex-1'
                textFieldClassName='aucctus-text-brand-secondary aucctus-text-sm flex-1'
                value={item.description}
                label=''
                name={`rightToWin-${index}`}
                maxLength={500}
                rows={1}
                onChange={(e) => handleRightToWinChange(index, e.target.value)}
                handleSave={handleSave}
                handleCancel={() => {
                  setRightToWin(activeConcept.rightsToWin || []);
                }}
              />
            </div>
          ))}
      </div>
    </>
  );
};

export default SelectedConcept;
