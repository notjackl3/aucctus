import { useModal } from '@context/ModalContextProvider';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import React from 'react';

interface ISupportInsightsProps {
  support: ISupport;
}

const SupportInsights: React.FC<ISupportInsightsProps> = ({ support }) => {
  const { closeModal } = useModal();

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).origin;
      return `${domain}/favicon.ico`;
    } catch {
      return '';
    }
  };

  return (
    <div className='flex h-screen w-full flex-col items-center justify-start'>
      <ScrollArea.Root className='aucctus-border-secondary h-full w-[600px] overflow-hidden rounded-br-xl border'>
        {/* Header */}
        <div className='aucctus-border-secondary flex items-center justify-between border-b px-6 py-4'>
          <h2 className='aucctus-text-secondary aucctus-text-sm-bold'>
            Support Insights
          </h2>
          <button
            onClick={closeModal}
            className='aucctus-text-tertiary-hover aucctus-text-sm-medium focus:outline-none'
          >
            Close
          </button>
        </div>

        {/* Scrollable Content */}
        <ScrollArea.Viewport className='h-full w-full'>
          <div className='space-y-4 p-4'>
            {support.insights.map((insight) => (
              <div
                key={insight.uuid}
                className='aucctus-border-secondary aucctus-bg-primary space-y-4 rounded-lg border p-4'
              >
                <div>
                  <h3 className='aucctus-text-secondary text-sm font-bold'>
                    Insight Summary:
                  </h3>
                  <p className='text-sm text-gray-600'>{insight.summary}</p>
                </div>
                <div>
                  <h3 className='aucctus-text-secondary text-sm font-bold'>
                    Description:
                  </h3>
                  <p className='text-sm text-gray-600'>{insight.description}</p>
                </div>
                <div className='space-y-4'>
                  <h3 className='aucctus-text-secondary text-sm font-bold'>
                    Sources:
                  </h3>
                  {insight.sources.map((source) => (
                    <div
                      key={source.uuid}
                      className='flex items-center space-x-2'
                    >
                      <img
                        src={getFaviconUrl(source.url)}
                        alt='favicon'
                        className='h-6 w-6 rounded-full'
                      />
                      <div>
                        <a
                          href={source.url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='aucctus-text-brand-secondary aucctus-text-sm-medium hover:underline'
                        >
                          {source.title}
                        </a>
                        <p className='aucctus-text-tertiary aucctus-text-xs-medium'>
                          {source.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea.Viewport>

        {/* Scrollbar */}
        <ScrollArea.Scrollbar
          orientation='vertical'
          className='w-2 bg-gray-200'
        >
          <ScrollArea.Thumb className='w-full rounded-md bg-gray-500' />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </div>
  );
};

export default SupportInsights;
