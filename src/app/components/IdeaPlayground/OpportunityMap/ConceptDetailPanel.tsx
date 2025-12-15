import React, { useState } from 'react';
import { Icon } from '@components';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@components/Tabs/Tabs';

interface ConceptDetail {
  shouldWeDo: string;
  whatIsIt: string;
  description: string;
  conceptType: 'Core' | 'Adjacent' | 'Disruptive';
  momentumScore?: string;
  initialGutCheck?: string;
  problemItSolves: string;
  uniqueValue: string;
  reasonsToBelieve: string[];
  reasonsToChallenge: string[];
  alignment: string[];
}

interface ConceptDetailPanelProps {
  title: string;
  icon: string;
  conceptDetail: ConceptDetail | null;
}

const ConceptDetailPanel: React.FC<ConceptDetailPanelProps> = ({
  title,
  icon,
  conceptDetail,
}) => {
  const [activeTab, setActiveTab] = useState('believe');

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
    <div className='space-y-6'>
      {/* Header with Badge */}
      <div className='flex items-start justify-between gap-4'>
        <div className='flex flex-1 items-start gap-3'>
          <Icon
            variant={icon as any}
            className='aucctus-stroke-white h-6 w-6 flex-shrink-0 opacity-80'
          />
          <div>
            <h2 className='aucctus-text-xl-bold aucctus-text-white mb-1'>
              {title}
            </h2>
            <p className='aucctus-text-sm aucctus-text-white opacity-60'>
              {conceptDetail.description}
            </p>
          </div>
        </div>

        {/* Category Badge */}
        <span
          className={`flex-shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${
            conceptDetail.conceptType === 'Core'
              ? 'border border-blue-400/30 bg-blue-500/20 text-blue-300'
              : conceptDetail.conceptType === 'Adjacent'
                ? 'border border-purple-400/30 bg-purple-500/20 text-purple-300'
                : 'border border-orange-400/30 bg-orange-500/20 text-orange-300'
          }`}
        >
          {conceptDetail.conceptType}
        </span>
      </div>

      {/* initialGutCheck Card */}
      {conceptDetail.initialGutCheck && (
        <div className='aucctus-bg-frosted-glass rounded-lg border border-white/20 p-6 backdrop-blur-md'>
          <h3 className='aucctus-text-lg-semibold aucctus-text-white mb-3'>
            Gut Check
          </h3>
          <p className='aucctus-text-white leading-relaxed opacity-80'>
            {conceptDetail.initialGutCheck}
          </p>
        </div>
      )}

      {/* Idea Score Assessment Widget with Tabs */}
      <div className='aucctus-bg-frosted-glass rounded-lg border border-white/20 p-6 backdrop-blur-md'>
        <div className='mb-4 flex items-center justify-between'>
          <h3 className='aucctus-text-lg-semibold aucctus-text-white'>
            Idea Score Assessment
          </h3>

          {/* Idea Score */}
          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-2'>
              <span className='aucctus-text-xs aucctus-text-white opacity-70'>
                Idea Score
              </span>
              <div className='flex gap-1'>
                {[1, 2, 3].map((bar) => {
                  const score = conceptDetail.momentumScore
                    ? parseInt(conceptDetail.momentumScore, 10)
                    : 0;
                  return (
                    <div
                      key={bar}
                      className={`h-4 w-1 rounded-full ${
                        bar <= score
                          ? score === 3
                            ? 'bg-green-400'
                            : score === 2
                              ? 'bg-yellow-400'
                              : 'bg-orange-400'
                          : 'bg-white/20'
                      }`}
                    ></div>
                  );
                })}
              </div>
            </div>

            {/* Momentum Label */}
            {conceptDetail.momentumScore && (
              <span
                className={`aucctus-text-xs font-semibold ${
                  conceptDetail.momentumScore === '3'
                    ? 'text-green-400'
                    : conceptDetail.momentumScore === '2'
                      ? 'text-yellow-400'
                      : 'text-orange-400'
                }`}
              >
                {conceptDetail.momentumScore === '3'
                  ? 'High Momentum'
                  : conceptDetail.momentumScore === '2'
                    ? 'Emerging Momentum'
                    : 'Early Momentum'}
              </span>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
          <TabsList className='grid w-full grid-cols-3 bg-white/5 p-1'>
            <TabsTrigger
              value='believe'
              className='data-[state=active]:aucctus-text-white aucctus-text-tertiary aucctus-text-xs flex items-center justify-center gap-1.5 py-2 data-[state=active]:bg-white/20'
            >
              <Icon
                variant='thumbs-up'
                className='aucctus-stroke-white h-4 w-4'
              />
              <span className='aucctus-text-white'>Reasons to Believe</span>
            </TabsTrigger>
            <TabsTrigger
              value='challenge'
              className='data-[state=active]:aucctus-text-white aucctus-text-tertiary aucctus-text-xs flex items-center justify-center gap-1.5 py-2 data-[state=active]:bg-white/20'
            >
              <Icon
                variant='alert-triangle'
                className='aucctus-stroke-white h-4 w-4'
              />
              <span className='aucctus-text-white'>Reasons to Challenge</span>
            </TabsTrigger>
            <TabsTrigger
              value='alignment'
              className='data-[state=active]:aucctus-text-white aucctus-text-tertiary aucctus-text-xs flex items-center justify-center gap-1.5 py-2 data-[state=active]:bg-white/20'
            >
              <Icon
                variant='target-round'
                className='aucctus-stroke-white h-4 w-4'
              />
              <span className='aucctus-text-white'>Alignment</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value='believe' className='mt-4'>
            <ul className='aucctus-text-white space-y-3 opacity-80'>
              {conceptDetail.reasonsToBelieve &&
              conceptDetail.reasonsToBelieve.length > 0 ? (
                conceptDetail.reasonsToBelieve.map((reason, index) => (
                  <li key={index} className='flex items-center gap-3'>
                    <span className='h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-400'></span>
                    <span className='aucctus-text-sm leading-relaxed'>
                      {reason}
                    </span>
                  </li>
                ))
              ) : (
                <p className='aucctus-text-sm opacity-70'>
                  No reasons to believe provided
                </p>
              )}
            </ul>
          </TabsContent>

          <TabsContent value='challenge' className='mt-4'>
            <ul className='aucctus-text-white space-y-3 opacity-80'>
              {conceptDetail.reasonsToChallenge &&
              conceptDetail.reasonsToChallenge.length > 0 ? (
                conceptDetail.reasonsToChallenge.map((reason, index) => (
                  <li key={index} className='flex items-center gap-3'>
                    <span className='h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-400'></span>
                    <span className='aucctus-text-sm leading-relaxed'>
                      {reason}
                    </span>
                  </li>
                ))
              ) : (
                <p className='aucctus-text-sm opacity-70'>
                  No reasons to challenge provided
                </p>
              )}
            </ul>
          </TabsContent>

          <TabsContent value='alignment' className='mt-4'>
            <ul className='aucctus-text-white space-y-3 opacity-80'>
              {conceptDetail.alignment && conceptDetail.alignment.length > 0 ? (
                conceptDetail.alignment.map((item, index) => (
                  <li key={index} className='flex items-center gap-3'>
                    <span className='h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400'></span>
                    <span className='aucctus-text-sm leading-relaxed'>
                      {item}
                    </span>
                  </li>
                ))
              ) : (
                <p className='aucctus-text-sm opacity-70'>
                  No alignment items provided
                </p>
              )}
            </ul>
          </TabsContent>
        </Tabs>
      </div>

      {/* Problem It Solves Card */}
      {conceptDetail.problemItSolves && (
        <div className='aucctus-bg-frosted-glass rounded-lg border border-white/20 p-6 backdrop-blur-md'>
          <h3 className='aucctus-text-lg-semibold aucctus-text-white mb-3'>
            Problem It Solves
          </h3>
          <p className='aucctus-text-white leading-relaxed opacity-80'>
            {conceptDetail.problemItSolves}
          </p>
        </div>
      )}

      {/* Unique Value Proposition Card */}
      {conceptDetail.uniqueValue && (
        <div className='aucctus-bg-frosted-glass rounded-lg border border-white/20 p-6 backdrop-blur-md'>
          <h3 className='aucctus-text-lg-semibold aucctus-text-white mb-3'>
            Unique Value Proposition
          </h3>
          <p className='aucctus-text-white leading-relaxed opacity-80'>
            {conceptDetail.uniqueValue}
          </p>
        </div>
      )}
    </div>
  );
};

export default ConceptDetailPanel;
