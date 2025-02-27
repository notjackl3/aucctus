import { FunctionComponent } from 'react';
import { HELP_EMAIL } from '../../../../libs/constants';
import Icon from '../../Icon/Icon/Icon';

const year = new Date().getFullYear();

const Footer: FunctionComponent = () => {
  return (
    <div className='px-13 py-xs flex h-24 flex-row flex-wrap-reverse items-end justify-center justify-between gap-4 self-stretch text-left font-[inherit] text-sm text-gray-600 sm:flex-nowrap sm:justify-between sm:gap-0'>
      <div className='aucctus-text-tertiary aucctus-text-md relative mb-3 ml-8 leading-5'>
        © {year} Aucctus Inc. All Rights Reserved.
      </div>
      <div className='mb-3 mr-8 flex flex-row items-center gap-2'>
        <Icon
          variant='mail'
          width={24}
          height={24}
          className='h-4 w-4 flex-shrink-0 overflow-hidden stroke-gray-light-900'
        />
        <a
          href={`mailto:${HELP_EMAIL}`}
          className='aucctus-text-md relative leading-5 !text-gray-light-500 no-underline'
        >
          {HELP_EMAIL}
        </a>
      </div>
    </div>
  );
};

export default Footer;
