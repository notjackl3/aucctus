import { FunctionComponent } from 'react';
import igniteIcon from '../assets/ignite.svg';
import Loading from './Loading';

interface IgniteLoadingProps {
  title: string;
  subtitle: string;
}

const IgniteLoading: FunctionComponent<IgniteLoadingProps> = ({
  title,
  subtitle,
}) => {
  return (
    <div className='aucctus-border-secondary aucctus-bg-primary inline-flex w-96 flex-col items-center justify-center gap-10 rounded-xl border px-8 py-10 shadow'>
      <div className='flex h-56 flex-col items-center justify-start gap-8 self-stretch'>
        <img alt='Ignite!' className='relative w-48' src={igniteIcon} />
        <div className='flex flex-col items-center justify-start gap-3 self-stretch'>
          <div className='aucctus-text-brand-primary self-stretch text-center text-3xl font-bold leading-9'>
            {title}
          </div>
          <div className='aucctus-text-tertiary self-stretch text-center text-sm font-medium'>
            {subtitle}
          </div>
        </div>
      </div>
      <div className='flex h-10 flex-col items-center justify-start gap-3 self-stretch'>
        <Loading />
      </div>
    </div>
  );
};

export default IgniteLoading;
