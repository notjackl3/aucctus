import React, { FunctionComponent } from 'react';
import styles from './styles/igniteConcept.module.scss';
import IgniteLoading from '../../components/IgniteLoading';
import IgniteForm from '../../components/Forms/IgniteForm/IgniteForm';
import TextArea from '../../components/Text/TextArea/TextArea';
import useIgniteConcept from './hooks/useIgniteConcept';

const IgniteConcept: FunctionComponent = () => {
  const { isIgniteLoading, goalString, setGoalString, generateConcepts } = useIgniteConcept();

  const generateConceptList = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    generateConcepts(goalString);
  };

  return (
    <div className={styles.ignite}>
      {isIgniteLoading ? (
        <IgniteLoading title="Igniting Your Concept" subtitle="This process takes about 10 seconds, please wait." />
      ) : (
        <IgniteForm
          title="Generate A New Concept"
          subtitle="Enter details below and Aucctus AI will instantly generate up to 10 innovative ideas for your business"
          onSubmit={generateConceptList}
        >
          <TextArea
            name="concept"
            label="Describe your idea in one sentence"
            placeholder="I want to increase revenue from our high value customers"
            value={goalString}
            maxLength={2000}
            isDisableResize
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setGoalString(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" disabled={!goalString}>
            Generate Concepts
          </button>
        </IgniteForm>
      )}
    </div>
  );
};

export default IgniteConcept;
