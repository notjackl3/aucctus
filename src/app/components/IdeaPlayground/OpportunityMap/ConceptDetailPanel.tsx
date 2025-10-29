import React from 'react';
import { Icon } from '@components';

interface ConceptDetail {
  shouldWeDo: string;
  whatIsIt: string;
  problemItSolves: string;
  uniqueValue: string;
  reasonsToBelieve: string[];
  reasonsToChallenge: string[];
  keyThingsToValidate: string[];
}

interface ConceptDetailPanelProps {
  title: string;
  section: string;
  icon: string;
  conceptDetail: ConceptDetail | null;
}

const ConceptDetailPanel: React.FC<ConceptDetailPanelProps> = ({
  title,
  section,
  icon,
  conceptDetail,
}) => {
  if (!conceptDetail) {
    return (
      <div className='flex h-full items-center justify-center'>
        <p className='aucctus-text-white text-center opacity-50'>
          Click on any idea card to view detailed information
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='mb-6 flex items-center gap-3'>
        <Icon
          variant={icon as any}
          className='aucctus-stroke-white opacity-80'
          height={32}
          width={32}
        />
        <div>
          <h2 className='aucctus-text-xl-bold aucctus-text-white'>{title}</h2>
          <p className='aucctus-text-white aucctus-text-sm opacity-60'>
            {section} Innovation
          </p>
        </div>
      </div>

      {/* Should We Do This? Card */}
      <div className='aucctus-bg-frosted-glass rounded-lg border border-white/20 p-4 backdrop-blur-md transition-all duration-300 hover:bg-white/15'>
        <h3 className='aucctus-text-lg-semibold aucctus-text-white mb-3'>
          Should We Do This?
        </h3>
        <p className='aucctus-text-white leading-relaxed opacity-70'>
          <strong>Yes.</strong> {conceptDetail.shouldWeDo}
        </p>
      </div>

      {/* What Is It Card */}
      <div className='aucctus-bg-frosted-glass rounded-lg border border-white/20 p-4 backdrop-blur-md transition-all duration-300 hover:bg-white/15'>
        <h3 className='aucctus-text-lg-semibold aucctus-text-white mb-3'>
          What Is It
        </h3>
        <p className='aucctus-text-white leading-relaxed opacity-70'>
          {conceptDetail.whatIsIt}
        </p>
      </div>

      {/* Problem It Solves Card */}
      <div className='aucctus-bg-frosted-glass rounded-lg border border-white/20 p-4 backdrop-blur-md transition-all duration-300 hover:bg-white/15'>
        <h3 className='aucctus-text-lg-semibold aucctus-text-white mb-3'>
          Problem It Solves
        </h3>
        <p className='aucctus-text-white leading-relaxed opacity-70'>
          {conceptDetail.problemItSolves}
        </p>
      </div>

      {/* Unique Value Proposition Card */}
      <div className='aucctus-bg-frosted-glass rounded-lg border border-white/20 p-4 backdrop-blur-md transition-all duration-300 hover:bg-white/15'>
        <h3 className='aucctus-text-lg-semibold aucctus-text-white mb-3'>
          Unique Value Proposition
        </h3>
        <p className='aucctus-text-white leading-relaxed opacity-70'>
          {conceptDetail.uniqueValue}
        </p>
      </div>

      {/* Reasons to Believe Card */}
      <div className='aucctus-bg-success-glass aucctus-border-success-extra-subtle hover:aucctus-bg-success-glass-hover rounded-lg border p-4 transition-all duration-300'>
        <h3 className='aucctus-text-lg-semibold aucctus-text-white mb-3'>
          Reasons to Believe
        </h3>
        <ul className='aucctus-text-white space-y-2 opacity-70'>
          {conceptDetail.reasonsToBelieve.map((reason, index) => (
            <li key={index} className='flex items-start gap-2'>
              <span className='aucctus-bg-white mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full opacity-60'></span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Reasons to Challenge Card */}
      <div className='aucctus-bg-error-glass aucctus-border-error-extra-subtle hover:aucctus-bg-error-glass-hover rounded-lg border p-4 transition-all duration-300'>
        <h3 className='aucctus-text-lg-semibold aucctus-text-white mb-3'>
          Reasons to Challenge
        </h3>
        <ul className='aucctus-text-white space-y-2 opacity-70'>
          {conceptDetail.reasonsToChallenge.map((reason, index) => (
            <li key={index} className='flex items-start gap-2'>
              <span className='aucctus-bg-white mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full opacity-60'></span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Key Things to Validate Card */}
      <div className='aucctus-bg-warning-glass aucctus-border-warning-extra-subtle hover:aucctus-bg-warning-glass-hover rounded-lg border p-4 transition-all duration-300'>
        <h3 className='aucctus-text-lg-semibold aucctus-text-white mb-3'>
          Key Things to Validate
        </h3>
        <ul className='aucctus-text-white space-y-2 opacity-70'>
          {conceptDetail.keyThingsToValidate.map((item, index) => (
            <li key={index} className='flex items-start gap-2'>
              <span className='aucctus-bg-white mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full opacity-60'></span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ConceptDetailPanel;
