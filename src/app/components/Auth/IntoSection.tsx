import { FunctionComponent } from 'react';
import images from '../../assets/img';
import Icon from '../Icon/Icon/Icon';

const NUMBER_OF_STARS = 5;

const IntoSection: FunctionComponent = () => {
  return (
    <div className='aucctus-bg-secondary flex h-screen flex-1 flex-col items-start justify-start gap-4 overflow-hidden text-left'>
      <div className='box-border flex w-full flex-col gap-6 pb-16 pl-14 pt-20'>
        <div className='flex flex-row items-start justify-start gap-1'>
          {[...Array(NUMBER_OF_STARS)].map((_, i) => (
            <Icon
              variant='star-01'
              key={`star-icon-${i}`}
              height={20}
              width={20}
              className='fill-indigo-600 stroke-primary-900'
            />
          ))}
        </div>
        <div className='aucctus-header-sm-medium aucctus-text-primary relative self-stretch'>
          Aucctus provides enormous potential for organizations to innovate at
          speed and scale.
        </div>
        <div className='flex flex-row items-start justify-start self-stretch'>
          <div className='flex flex-1 flex-col items-start justify-start'>
            <div className='aucctus-text-primary aucctus-text-lg-medium relative self-stretch'>
              — Brandon Milner
            </div>
            <div className='aucctus-text-secondary aucctus-text-md-medium relative self-stretch'>
              Head of Innovation at EllisDon
            </div>
          </div>
        </div>
      </div>
      <div className='aucctus-border-brand relative ml-16 box-border flex h-[900px] w-[1350px] flex-col items-start justify-start rounded-lg border-[6px] border-solid'>
        <img
          className='h-[900px] w-[1350px] overflow-hidden rounded-lg object-contain'
          alt='Aucctus'
          src={images.screenMockup}
        />
      </div>
    </div>
  );
};

export default IntoSection;
