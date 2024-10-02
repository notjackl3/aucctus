import { FunctionComponent } from 'react';
import Loading from '../components/Loading';

const LoadingScreen: FunctionComponent = () => {
  return (
    <div className='absolute bottom-0 left-0 right-0 top-0 z-[9999] m-auto flex h-full w-full items-center justify-center bg-white'>
      <Loading />
    </div>
  );
};

export default LoadingScreen;
