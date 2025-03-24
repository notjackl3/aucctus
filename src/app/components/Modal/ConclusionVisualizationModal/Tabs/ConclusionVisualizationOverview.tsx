import { Card } from '@components';
import { mightContainMarkdown } from '@libs/utils/string';
import React from 'react';
import ReactMarkdown, { Components } from 'react-markdown';

interface IConclusionVisualizationOverviewProps {
  conclusion: string;
  reasoning: string;
  insights?: IInsight[];
}

const renderConclusion = (conclusion: string) => {
  return <div className='text-lg font-medium text-gray-900'>{conclusion}</div>;
};

const markdownComponents: Components = {
  strong: ({ children }) => (
    <strong className='aucctus-text-secondary'>{children}</strong>
  ),
};

const renderReasoning = (reasoning: string) => {
  if (mightContainMarkdown(reasoning)) {
    return (
      <ReactMarkdown
        className='aucctus-text-tertiary'
        components={markdownComponents}
      >
        {reasoning}
      </ReactMarkdown>
    );
  }

  return <div className='aucctus-text-tertiary text-sm'>{reasoning}</div>;
};

const renderInsights = (insights: IInsight[]) => {
  return (
    <div>
      {insights.map((insight) => (
        <Card.Insight key={insight.uuid} insight={insight} />
      ))}
    </div>
  );
};

const ConclusionVisualizationOverview: React.FC<
  IConclusionVisualizationOverviewProps
> = ({ conclusion, reasoning, insights }) => {
  return (
    <div className='mx-2 flex flex-col gap-4'>
      {renderConclusion(conclusion)}
      {renderReasoning(reasoning)}
      {insights && renderInsights(insights)}
    </div>
  );
};

export default ConclusionVisualizationOverview;
