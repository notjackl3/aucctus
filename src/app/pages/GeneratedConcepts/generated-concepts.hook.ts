import { useState } from 'react';
import { IConceptSeedBase, IGeneratedConcept } from '../../../libs/api/types';
import { useLocation } from 'react-router-dom';
import { RowSelectionState } from '@tanstack/react-table';
import { IGeneratedConceptsSaveBody } from '../../../libs/api/concepts';

type ConceptSeedWithoutCreatedBy = Omit<IConceptSeedBase, 'createdBy'>;

export interface IGeneratedConceptsState extends Omit<IGeneratedConceptsSaveBody, 'seed'> {
  seed: ConceptSeedWithoutCreatedBy;
}

const INITIAL_CONCEPT_SEED_STATE: ConceptSeedWithoutCreatedBy = {
  attributes: [],
  type: 'UNKNOWN',
};

const useGeneratedConcepts = () => {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const location = useLocation();
  const locationState = location.state as Partial<IGeneratedConceptsState>;

  const concepts = locationState.concepts || [];
  const seed = Object.assign(INITIAL_CONCEPT_SEED_STATE, locationState.seed || {});

  const getSelectedConcepts = (
    conceptsList: IGeneratedConcept[],
    rowSelection: RowSelectionState,
  ): IGeneratedConcept[] => {
    return conceptsList.reduce((acc: IGeneratedConcept[], concept, index) => {
      if (rowSelection[index]) {
        acc.push(concept);
      }
      return acc;
    }, []);
  };

  const selectedConcepts = getSelectedConcepts(concepts, rowSelection);
  const numberOfSelectedConcepts = `${selectedConcepts.length}`;
  const hasSelectedConcepts = selectedConcepts.length > 0;

  return {
    rowSelection,
    concepts,
    numberOfSelectedConcepts,
    selectedConcepts,
    seed,
    hasSelectedConcepts,
    getSelectedConcepts,
    setRowSelection,
  };
};

export default useGeneratedConcepts;
