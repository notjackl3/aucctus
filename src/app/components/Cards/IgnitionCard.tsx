import * as React from 'react';

interface IIgnitionCardProps {
  header: {
    title: string;
    description: string;
    // The tailwindcss color class
    color: string;
    image: {
      src: string;
      alt: string;
    };
  };
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

const IgnitionCard: React.FunctionComponent<IIgnitionCardProps> = ({ header, children, footer }) => {
  return (
    <section className='flex max-w-[360px] flex-col self-stretch overflow-clip rounded-xl border border-solid border-slate-200 bg-white shadow-sm'>
      <div className={`flex w-full flex-col justify-center px-4 py-6 text-center ${header.color}`}>
        <img
          loading='lazy'
          src={header.image.src}
          alt={header.image.alt}
          className='aspect-[0.99] w-[75px] self-center'
        />
        <h1 className='mt-2.5 text-2xl font-medium leading-8 text-indigo-900'>{header.title}</h1>
        <p className='mt-2.5 text-base leading-6 text-gray-500'>{header.description}</p>
      </div>
      <div className='mt-5 flex w-full grow flex-col justify-between gap-3.5 px-4 pb-6'>{children}</div>
      {footer ? (
        <div className='flex w-full flex-row items-center justify-center gap-2.5 border-t border-solid border-slate-200 py-3 '>
          {footer}
        </div>
      ) : null}
    </section>
  );
};

export default IgnitionCard;
