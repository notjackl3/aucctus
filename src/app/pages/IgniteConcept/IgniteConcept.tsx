import { FunctionComponent, useState } from 'react';
import styles from './styles/igniteConcept.module.scss';
import { useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../../libs/api';
import { AppPath } from '../../../routes/routes';
import IgniteLoading from '../../components/IgniteLoading';
import IgniteForm from '../../components/IgniteForm';
import TextArea from '../../components/TextArea';
import { IConceptCreate } from '../../../libs/api/typings';
import useIgniteConcept from './hooks/useIgniteConcept';

const IgniteConcept: FunctionComponent = () => {
  const navigate = useNavigate();
  const [concept, setConcept] = useState<string>('');

  const queryClient = useQueryClient();

  const conceptStatusMutation = useMutation({
    mutationFn: async (conceptObj: IConceptCreate) => {
      return api?.concept?.igniteConcepts(conceptObj);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['concepts'] });
      navigate(AppPath.GeneratedConcepts, { state: { data, goal: concept } });
    },
  });

  const generateConcepts = (concept: string) => {
    const conceptPutObj: IConceptCreate = {
      goal: concept,
    };
    conceptStatusMutation.mutate(conceptPutObj);
  };

  // const {
  //   isIgniteLoading,
  //   goalString,
  //   setGoalString,
  //   generateConcepts
  // } = useIgniteConcept();

  return (
    <div className={styles.ignite}>
      {conceptStatusMutation.isLoading ? (
        <IgniteLoading title="Igniting Your Concept" subtitle="This process takes about 10 seconds, please wait." />
      ) : (
        <IgniteForm
          title="Ignite Your Concept"
          subtitle="These answers will kick start your concept innovation process"
        >
          <TextArea
            name="concept"
            label="Describe your idea in one sentence."
            placeholder="I want a new innovative idea for my company to explore"
            value={concept}
            maxLength={200}
            isDisableResize
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setConcept(e.target.value)}
          />
          <button className="btn btn-primary" disabled={!concept} onClick={() => generateConcepts(concept)}>
            Generate Concepts
          </button>
        </IgniteForm>
      )}
    </div>
  );
};

export default IgniteConcept;
