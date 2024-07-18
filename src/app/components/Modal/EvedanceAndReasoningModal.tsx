import Icon from '@components/Icons';
import { useModal } from '@context/ModalContextProvider';
import { ISource } from '@libs/api/types';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import React from 'react';

interface IEvidenceAndReasoningProps {
  conclusion: string;
  reasoning: string;
  sources: ISource[];
}

const EvidenceAndReasoning: React.FC<IEvidenceAndReasoningProps> = ({ conclusion, reasoning, sources }) => {
  const { closeModal } = useModal();

  return (
    <div className='inline-flex flex-col items-center justify-start rounded-xl'>
      {/* Header */}
      <div className='inline-flex w-full items-center justify-between gap-4 border-b border-gray-300 pb-4'>
        <div className='inline-flex h-14 flex-col items-start justify-start gap-4 px-6 pb-[10px] pt-6'>
          <h5 className='self-stretch text-lg font-bold leading-7 text-gray-900'>Evidence & Reasoning</h5>
        </div>
        <button className='btn btn-close btn-no-border px-6 pt-6' onClick={closeModal}>
          <Icon.Variant variant='closeX' />
        </button>
      </div>
      <div className='inline-flex h-full w-full items-start justify-start'>
        <div className='inline-flex max-w-96 flex-col items-start justify-start gap-5 self-stretch border-r border-gray-300 p-6'>
          {/* Conclusion */}
          <div className='flex h-16 flex-col items-center justify-center gap-2.5 self-stretch'>
            <h6 className='self-stretch text-base font-bold leading-7 text-gray-500'>Conclusion</h6>
            <p className='self-stretch text-2xl font-bold text-indigo-900'>{conclusion}</p>
          </div>
          {/* Reasoning */}
          <div className='flex flex-col items-center justify-center gap-2.5 self-stretch'>
            <h6 className='self-stretch text-base font-bold leading-7 text-gray-500'>Reasoning</h6>
            <p className='self-stretch text-sm font-medium leading-tight text-gray-500'>{reasoning}</p>
          </div>
        </div>

        <ScrollArea.Root className='flex h-auto max-h-96 max-w-96 flex-col items-start justify-start overflow-hidden scroll-smooth rounded-br-xl bg-neutral-50 pt-6'>
          <div className='flex h-9 flex-col items-start justify-center self-stretch border-b border-slate-200 px-6 pb-2.5'>
            <div className='Text self-stretch text-base font-bold leading-7 text-gray-500'>Sources</div>
          </div>
          <ScrollArea.Viewport className='h-full w-full'>
            {sources.map((source) => (
              <a
                key={source.url}
                href={source.url}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex w-full items-center justify-between px-6 py-6 odd:bg-white'
              >
                <div className='inline-flex flex-row items-start justify-start gap-3'>
                  <div className='flex items-start justify-start gap-2'>
                    {/* Bullet */}
                    <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 [&>svg>use]:stroke-primary-500'>
                      <Icon.Variant variant='link-03' />
                    </div>
                  </div>
                  <div className='group relative inline-flex h-10 flex-col items-start justify-start'>
                    <h6 className='max-h-5 w-56 truncate bg-white text-sm font-medium text-indigo-900 hover:absolute hover:max-h-10 hover:text-clip hover:text-wrap'>
                      {source.title}
                    </h6>
                    <div className='max-h-5 w-56 truncate text-sm font-normal text-gray-500'>{source.url}</div>
                  </div>
                </div>

                <div className='inline-flex flex-col items-end justify-center'>
                  <div className='inline-flex items-center justify-end rounded-lg py-2.5'>
                    <Icon.Variant variant='link-external' />
                  </div>
                </div>
              </a>
            ))}
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar className='scroll' orientation='vertical'>
            <ScrollArea.Thumb className='ScrollAreaThumb' />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>
      </div>
    </div>
  );
};

export default EvidenceAndReasoning;
