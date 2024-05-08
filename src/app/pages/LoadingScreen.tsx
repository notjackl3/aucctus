import { FunctionComponent } from 'react';
import Loading from '../components/Loading';

const LoadingScreen: FunctionComponent = () => {
  return (
    <div className='loading-screen'>
      <Loading />
    </div>
  );
};

export default LoadingScreen;
