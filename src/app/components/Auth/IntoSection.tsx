import { FunctionComponent } from 'react';
import images from '../../assets/img';

const IntoSection: FunctionComponent = () => {
  return (
    <div className='aucctus-bg-secondary flex h-screen flex-1 flex-col items-start justify-start gap-4 overflow-hidden text-left'>
      <div className='aucctus-border-brand relative ml-16 mt-[15%] box-border flex h-[800px] w-[1200px] flex-col items-start justify-start rounded-lg border-4 border-solid'>
        <img
          className='h-[800px] w-[1200px] overflow-hidden rounded-lg object-contain'
          alt='Aucctus'
          src={images.screenMockup}
        />
      </div>
    </div>
  );
};

export default IntoSection;
