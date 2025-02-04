import React from 'react';
import ReactMarkdown from 'react-markdown';
import { IInsight } from '@libs/api/types';
import { Card } from '@components';
import { mightContainMarkdown } from '@libs/utils/string';

interface IConclusionVisualizationOverviewProps {
  conclusion: string;
  reasoning: string;
  insights?: IInsight[];
}

const renderConclusion = (conclusion: string) => {
  return <div className='text-lg font-medium text-gray-900'>{conclusion}</div>;
};

const renderReasoning = (reasoning: string) => {
  if (mightContainMarkdown(reasoning)) {
    return <ReactMarkdown>{reasoning}</ReactMarkdown>;
  }

  return <div className='text-sm text-gray-500'>{reasoning}</div>;
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
