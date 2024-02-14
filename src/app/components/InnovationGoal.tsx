import { FunctionComponent, useState } from 'react';
import styles from '../assets/styles/pages/dashboard.module.scss';
import { logout } from '../../features/auth/auth.slice';
import { useQuery } from 'react-query';
import api from '../../libs/api';
import Loading from './Loading';
import { isAxiosError } from 'axios';
import { useAppDispatch } from '../hooks';

const InnovationGoal: FunctionComponent = () => {
  const dispatch = useAppDispatch();
  const [goal, setGoal] = useState<string>('');
  const [error, setError] = useState<string | undefined>();

  // TEMP
  const isLoading = true;

  // const query = useQuery({
  //   queryKey: 'innovationGoal',
  //   retry: 2,
  //   queryFn: async () => await api.organization.getInnovationGoal(),

  //   onError: (err) => {
  //     if (isAxiosError<INestJSErrorResponse>(err)) {
  //       if (err.response && err.response.data.statusCode >= 401) {
  //         dispatch(logout())
  //       }
  //     }
  //   },
  //   onSuccess: (data) => {
  //     if (error !== undefined) setError(undefined)
  //     setGoal(data)
  //   }
  // })

  return (
    <div className={styles.companyGoal}>
      <h3>Innovation Goal</h3>

      {
        // query.isLoading ?
        isLoading ? (
          // TODO Style Loading
          <Loading />
        ) : (
          <span className={styles.goalText}>{goal}</span>
        )
      }
    </div>
  );
};

export default InnovationGoal;
