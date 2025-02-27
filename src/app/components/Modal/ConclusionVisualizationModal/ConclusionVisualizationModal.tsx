import { Container } from '@components';
import { ISource, IInsight } from '@libs/api/types';
import React, { useState, useEffect } from 'react';
import ConclusionVisualizationOverview from './Tabs/ConclusionVisualizationOverview';
import ConclusionVisualizationSources from './Tabs/ConclusionVisualizationSources';
export interface IConclusionVisualizationProps {
  conclusion: string;
  reasoning: string;
  insights?: IInsight[];
  sources: ISource[];
}

type TabTitles = 'Overview' | 'Sources';
export const VISUALIZATION_TABS: { label: TabTitles; value: string }[] = [
  { label: 'Overview', value: 'Overview' },
  { label: 'Sources', value: 'Sources' },
];

const ConclusionVisualization: React.FC<IConclusionVisualizationProps> = ({
  conclusion,
  reasoning,
  insights,
  sources,
}) => {
  const [activeTab, setActiveTab] = useState<TabTitles>('Overview');

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'Overview':
        return (
          <ConclusionVisualizationOverview
            conclusion={conclusion}
            reasoning={reasoning}
            insights={insights}
          />
        );
      case 'Sources':
        return <ConclusionVisualizationSources sources={sources} />;
      default:
        return null;
    }
  };

  return (
    <div className='flex h-full min-w-[500px] max-w-[500px] flex-col overflow-auto'>
      <Container.TabView
        variant='button-separated'
        className='flex flex-1 flex-col px-4'
        tabClassName='flex-1 px-4 py-2 rounded-lg text-center aucctus-bg-primary-hover hover:border-b-2 hover:aucctus-border-primary transition-colors flex items-center justify-center'
        tabs={VISUALIZATION_TABS}
        onTabSelect={(tab) => setActiveTab(tab as TabTitles)}
        activeTab={activeTab}
      >
        <div className='max-h-[90vh] w-full flex-1 overflow-auto py-4'>
          {renderActiveTab()}
        </div>
      </Container.TabView>
    </div>
  );
};

export default ConclusionVisualization;
