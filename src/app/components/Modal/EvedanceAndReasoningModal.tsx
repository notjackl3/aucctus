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
    <div className=' inline-flex flex-col items-center justify-start rounded-xl'>
      {/* Header */}
      <div className='inline-flex w-full items-center justify-between gap-4 border-b border-gray-300 pb-4'>
        <div className='inline-flex h-12 flex-col items-start justify-start gap-4 px-6 pt-6'>
          <h5 className='self-stretch text-lg font-bold leading-7 text-gray-900'>Evidence & Reasoning</h5>
        </div>
        <button className='btn btn-close btn-no-border' onClick={closeModal}>
          <Icon.Variant variant='closeX' />
        </button>
      </div>
      <div className='inline-flex h-full w-full items-start justify-start'>
        <div className='inline-flex max-w-96 flex-col items-start justify-start gap-5 self-stretch border-r border-gray-300 py-5'>
          {/* Conclusion */}
          <div className='flex h-16 flex-col items-center justify-center gap-2.5 self-stretch px-6'>
            <h6 className='self-stretch text-base font-bold leading-7 text-gray-500'>Conclusion</h6>
            <p className='self-stretch text-2xl font-bold text-indigo-900'>{conclusion}</p>
          </div>
          {/* Reasoning */}
          <div className='flex flex-col items-center justify-center gap-2.5 self-stretch px-6'>
            <h6 className='self-stretch text-base font-bold leading-7 text-gray-500'>Reasoning</h6>
            <p className='self-stretch text-sm font-medium leading-tight text-gray-500'>{reasoning}</p>
          </div>
        </div>

        {/* <div className="w-[1px] h-full bg-slate-200 "></div> */}

        {/* <div className="max-w-96 max-h-96 h-auto self-stretch py-5 flex-col bg-neutral-50 justify-start items-start flex overflow-hidden"> */}
        <ScrollArea.Root className='flex h-auto max-h-96 max-w-96 flex-col items-start justify-start self-stretch overflow-hidden bg-neutral-50 pt-5'>
          <div className='flex h-9 flex-col items-start justify-center self-stretch border-b border-slate-200 px-6 pb-2.5'>
            <div className='Text self-stretch text-base font-bold leading-7 text-gray-500'>Sources</div>
          </div>
          <ScrollArea.Viewport className='h-full w-full'>
            {/* <div className="h-full self-stretch bg-white flex-col justify-start items-start gap-5 inline-flex"> */}
            {sources.map((source) => (
              <a
                key={source.url}
                href={source.url}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center justify-start px-6 py-3 odd:bg-white'
              >
                <div className='inline-flex flex-col items-start justify-start'>
                  <div className='inline-flex items-center justify-start gap-3 border-slate-200 py-3'>
                    <div className='flex items-start justify-start gap-2'>
                      {/* Bullet */}
                      <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 [&>svg>use]:stroke-primary-500'>
                        <Icon.Variant variant='link-03' />
                      </div>
                    </div>
                    <div className='inline-flex h-10 flex-col items-start justify-start'>
                      <h6 className='max-h-5 w-60 truncate text-sm font-medium text-indigo-900'>{source.title}</h6>
                      <div className='max-h-5 w-60 truncate text-sm font-normal text-gray-500'>{source.url}</div>
                    </div>
                  </div>
                </div>
                <div className='inline-flex flex-col items-end justify-center py-3 pl-6'>
                  <div className='inline-flex items-center justify-end rounded-lg py-2.5'>
                    <Icon.Variant variant='link-external' />
                  </div>
                </div>
              </a>
            ))}
            {/* </div> */}
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar className='ScrollAreaScrollbar' orientation='vertical'>
            <ScrollArea.Thumb className='ScrollAreaThumb' />
          </ScrollArea.Scrollbar>
          <ScrollArea.Scrollbar className='ScrollAreaScrollbar' orientation='horizontal'>
            <ScrollArea.Thumb className='ScrollAreaThumb' />
          </ScrollArea.Scrollbar>
          <ScrollArea.Corner className='ScrollAreaCorner' />
        </ScrollArea.Root>
        {/* </div> */}
      </div>
    </div>
  );
};

export default EvidenceAndReasoning;
