import { FunctionComponent, useState } from 'react';
import { useParams } from 'react-router-dom';

import { IChallengeIdeaResponse } from '../../libs/api/typings/challenges';
import { useQuery } from 'react-query';
import api from '../../libs/api';
import styles from '../assets/styles/pages/ideas-submission.module.scss';
import FeatureIcon from '../components/FeatureIcon';
const IdeaSubmission: FunctionComponent = () => {
  const { id } = useParams();
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const [idea, setIdea] = useState<IChallengeIdeaResponse>();

  const query = useQuery({
    queryKey: 'challenge/idea',
    enabled: false,
    refetchOnWindowFocus: false,
    retry: 0,
    queryFn: async () => {
      if (!id) return;
      // return api.challenge.createIdea(id, { title, description });
    },
    // onSuccess: (data) => {
    //   setIdea(data);
    // },
    onError: (error) => {
      // TODO: Handle error
      alert(error);
    },
  });

  return (
    <div className={styles.ideaSubmission}>
      <div className={styles.header}>
        <FeatureIcon icon="lightbulb" color="purple" />
        <div className={styles.supportingText}>
          <h1>Submit Idea</h1>
          <span>Fill in the following fields to submit an idea</span>
        </div>
      </div>
      <div className={styles.content}></div>
    </div>
  );
};

export default IdeaSubmission;
