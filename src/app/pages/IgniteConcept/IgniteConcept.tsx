import React, { FunctionComponent } from 'react';
import styles from './styles/igniteConcept.module.scss';
import IgniteLoading from '../../components/IgniteLoading';
import IgniteForm from '../../components/IgniteForm';
import TextArea from '../../components/TextArea';
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
          title="Ignite Your Concept"
          subtitle="These answers will kick start your concept innovation process"
          onSubmit={generateConceptList}
        >
          <TextArea
            name="concept"
            label="Describe your idea in one sentence."
            placeholder="I want a new innovative idea for my company to explore"
            value={goalString}
            maxLength={200}
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
