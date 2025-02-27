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

const IgnitionCard: React.FunctionComponent<IIgnitionCardProps> = ({
  header,
  children,
  footer,
}) => {
  return (
    <section className='aucctus-border-secondary aucctus-bg-primary flex max-w-[360px] flex-col self-stretch overflow-clip rounded-xl border border-solid shadow-sm'>
      <div
        className={`flex w-full flex-col justify-center px-4 py-6 text-center ${header.color}`}
      >
        <img
          loading='lazy'
          src={header.image.src}
          alt={header.image.alt}
          className='aspect-[0.99] w-[75px] self-center'
        />
        <h1 className='aucctus-text-brand-primary mt-2.5 text-2xl font-medium leading-8'>
          {header.title}
        </h1>
        <p className='aucctus-text-tertiary mt-2.5 text-base leading-6'>
          {header.description}
        </p>
      </div>
      <div className='flex w-full grow flex-col justify-between gap-4 px-4 py-6'>
        {children}
      </div>
      {footer ? (
        <div className='aucctus-border-secondary flex w-full flex-row items-center justify-center gap-2.5 border-t border-solid px-2 py-3'>
          {footer}
        </div>
      ) : null}
    </section>
  );
};

export default IgnitionCard;
