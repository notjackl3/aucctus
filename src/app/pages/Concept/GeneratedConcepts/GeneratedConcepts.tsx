import { Container, Loading, Table } from '@components';
import Icon from '@components/Icon/Icon/Icon';
import IgniteLoading from '@components/IgniteLoading';
import {
  useConceptIgnition,
  useSaveGeneratedConcepts,
} from '@hooks/query/concepts.hook';
import { useGeneratedConcepts } from '@hooks/tables/generated-concepts.hook';
import { AppPath } from '@routes/routes';
import { useConceptGenerationStore } from '@stores/concept-generation.store';
import React, { FunctionComponent, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles/generatedConcepts.module.scss';

const GeneratedConcepts: FunctionComponent = () => {
  const navigate = useNavigate();
  const { mutate: igniteConcept, isLoading: isGenerateLoading } =
    useConceptIgnition();
  const { mutate: saveConcepts, isLoading: isSaveLoading } =
    useSaveGeneratedConcepts();
  const {
    generatedConcepts: concepts,
    seed,
    clear,
    setGeneratedConcepts,
  } = useConceptGenerationStore();

  const { table, hasSelectedConcepts, selectedConcepts } =
    useGeneratedConcepts();

  const handleSaveConcepts = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.preventDefault();
      saveConcepts(
        {
          concepts: selectedConcepts,
          seed: seed,
        },
        {
          onSuccess: () => {
            // TODO: Add navigation state to navigate to list of new concepts
            navigate(AppPath.ConceptBank);
            clear();
          },
        },
      );
    },
    [clear, selectedConcepts, navigate, saveConcepts, seed],
  );

  const handleGenerateConcepts = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.preventDefault();
      igniteConcept(
        {
          attributes: seed.attributes || [],
          numberOfConcepts: 10,
          type: seed.type || 'UNKNOWN',
        },
        {
          onSuccess: (response) => {
            setGeneratedConcepts([...response.concepts, ...concepts]);
          },
        },
      );
    },
    [concepts, igniteConcept, seed.attributes, seed.type, setGeneratedConcepts],
  );

  return (
    <React.Fragment>
      <div className={`${styles.generatedConcepts} flex min-h-screen flex-col`}>
        {isGenerateLoading ? (
          <IgniteLoading
            title='Generating Concepts'
            subtitle='This process takes about 10 seconds, please wait.'
          />
        ) : (
          <>
            <div className={styles.headerSection}>
              <div className={styles.header}>
                <h1>Generated Concepts</h1>
                <span className={styles.supportingText}>
                  From the list below, choose the top concepts that you want to
                  keep and continue building on
                </span>
              </div>
              <div className={styles.actions}>
                <button
                  className='btn btn-light'
                  onClick={handleGenerateConcepts}
                >
                  <Icon variant='refresh' /> Generate more
                </button>
              </div>
            </div>
            <Container.ConceptTableWrapper
              isLoading={isGenerateLoading}
              footer={
                <div className='flex h-full w-full justify-end p-3'>
                  <button
                    className='btn btn-primary disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600'
                    disabled={!hasSelectedConcepts || isSaveLoading}
                    onClick={handleSaveConcepts}
                  >
                    {isSaveLoading ? (
                      <Loading isSmall />
                    ) : (
                      `Save ${selectedConcepts.length} Concepts`
                    )}
                  </button>
                </div>
              }
            >
              <Table table={table} />
            </Container.ConceptTableWrapper>
          </>
        )}
      </div>
    </React.Fragment>
  );
};

export default GeneratedConcepts;
