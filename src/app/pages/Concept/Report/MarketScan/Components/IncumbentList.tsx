'use client';

import { Badge, Icon } from '@components';
import { IIncumbent } from '@libs/api/types';
import { useEffect, useState } from 'react';
import images from '@assets/img';

const iconDefaultProps = {
  height: 16,
  width: 16,
  stroke: '#2B3674',
};

type IncumbentDashboardProps = {
  incumbents: IIncumbent[];
};

export const IncumbentsList = ({ incumbents }: IncumbentDashboardProps) => {
  const [selectedIncumbent, setSelectedIncumbent] = useState<IIncumbent | null>(
    null,
  );

  useEffect(() => {
    if (incumbents.length > 0) {
      setSelectedIncumbent(incumbents[0]);
    }
  }, [incumbents]);

  return (
    <div className='flex flex-col rounded-xl border border-gray-200 bg-white p-4 pt-8 shadow-sm'>
      <div className='flex flex-row items-center justify-start'>
        <h2 className='pr-2 font-bold leading-[30px] text-[#0C111D]'>
          Incumbents
        </h2>
        <Badge.Count
          value={incumbents.length}
          classNameBadge='bg-[#D0D5DD] h-4'
          classNameLabel='text-[#0C111D] text-sm font-bold'
        />
      </div>

      <div className='mt-8 flex overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm'>
        {/* Left Sidebar - Fixed width */}
        <div className='h-full w-80'>
          <nav>
            {incumbents.map((incumbent) => (
              <div
                key={incumbent.uuid}
                className={`group flex cursor-pointer flex-col items-start gap-3 p-4 hover:bg-gray-50 ${
                  selectedIncumbent?.uuid === incumbent.uuid
                    ? 'bg-gray-100'
                    : ''
                }`}
                onClick={() => setSelectedIncumbent(incumbent)}
              >
                <div className='flex w-full flex-row items-center justify-between'>
                  <div className='flex items-center'>
                    <div className='h-8 w-8 overflow-hidden rounded-full'>
                      <img
                        alt='company-logo'
                        onError={(
                          e: React.SyntheticEvent<HTMLImageElement, Event>,
                        ) => {
                          e.currentTarget.src = images.companyLogoDefault;
                        }}
                        src={`https://logo.clearbit.com/${new URL(incumbent.source).hostname}`}
                      />
                    </div>
                    <h3 className='ml-2 text-sm font-medium text-gray-900'>
                      {incumbent.name}
                    </h3>
                  </div>
                  <div className='rounded-md bg-[#EAECF0] p-[4px]'>
                    <Icon
                      variant='link'
                      height='12'
                      width='12'
                      stroke='#2B3674'
                    />
                  </div>
                </div>
                <p className='line-clamp-3 text-[12px] font-normal leading-[18px] text-[#0C111D]'>
                  {incumbent.description}
                </p>
                {incumbent.hasCompetitiveProduct ? (
                  <Badge.Count
                    value='Competitive Product'
                    classNameBadge='bg-[#F4F3FF] h-4 flex items-center justify-center rounded-lg border border-[#D9D6FE]'
                    classNameLabel="font-['Inter'] font-medium text-[12px] leading-[18px] text-center text-[#5925DC]"
                  />
                ) : (
                  <Badge.Count
                    value='Competitive Product'
                    classNameBadge='bg-[#F4F3FF] h-4 flex items-center justify-center rounded-lg'
                    classNameLabel="font-['Inter'] font-medium text-[12px] leading-[18px] text-center text-[red]"
                  />
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Main Content - Fluid width */}
        <main className='flex-1 border-l border-gray-200 bg-[#F9FAFB] p-6'>
          {selectedIncumbent ? (
            <div className='mx-auto max-w-5xl space-y-4'>
              {/* General Information Section */}
              <section>
                <h2 className="mb-4 h-[15px] w-[176px] font-['Inter'] text-[12px] font-bold leading-[15px] text-gray-950">
                  General Information
                </h2>
                <div className='flex justify-between gap-6'>
                  <div className='flex-1 rounded-lg border border-gray-200 bg-white p-6'>
                    <section className='pb-4'>
                      <div className='mb-1 flex items-start justify-between'>
                        <h3 className="font-['Inter'] text-[10px] font-medium leading-[20px] text-[#667085]">
                          Company Overview
                        </h3>
                        <div className='rounded-md bg-[#EAECF0] p-[4px]'>
                          <Icon variant='link-source' {...iconDefaultProps} />
                        </div>
                      </div>
                      <p className="font-['Inter'] text-[18px] font-bold leading-[28px] text-[#0C111D]">
                        {selectedIncumbent.general.overview}
                      </p>
                    </section>
                    <div className='flex flex-row justify-between'>
                      <div className='flex flex-row gap-10'>
                        <div className='pb-4'>
                          <h3 className="font-['Inter'] text-[10px] font-medium leading-[20px] text-[#667085]">
                            Headquarters
                          </h3>
                          <p className="font-['Inter'] text-[12px] font-normal leading-[18px] text-[#0C111D]">
                            {selectedIncumbent.general.headquarters}
                          </p>
                        </div>
                        <div className='pb-4'>
                          <h3 className="font-['Inter'] text-[10px] font-medium leading-[20px] text-[#667085]">
                            Established
                          </h3>
                          <p className="font-['Inter'] text-[12px] font-normal leading-[18px] text-[#0C111D]">
                            {selectedIncumbent.general.yearEstablished}
                          </p>
                        </div>
                      </div>
                      <div>
                        <div className='rounded-md bg-[#EAECF0] p-[4px]'>
                          <Icon variant='link-source' {...iconDefaultProps} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Recent Activity Section */}
              <section>
                <h2 className="mb-4 h-[15px] w-[176px] font-['Inter'] text-[12px] font-bold leading-[15px] text-gray-950">
                  Recent Activity
                </h2>
                <div className='space-y-4'>
                  {selectedIncumbent.recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className='rounded-lg border border-gray-200 bg-white p-4'
                    >
                      <p className="font-['Inter'] text-[12px] font-normal leading-[18px] text-[#0C111D]">
                        <div className='flex items-center justify-between'>
                          <h3 className="font-['Inter'] text-[12px] font-normal leading-[18px] text-gray-950">
                            {activity.activity}
                          </h3>
                          <div className='cursor-pointer rounded-md bg-[#EAECF0]'>
                            <Icon
                              onClick={() =>
                                window.open(activity.source, '_blank')
                              }
                              variant='link-source'
                              {...iconDefaultProps}
                            />
                          </div>
                        </div>
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Recommended Action Section */}
              <section>
                <h2 className="mb-4 h-[15px] w-[176px] font-['Inter'] text-[12px] font-bold leading-[15px] text-gray-950">
                  Recommended Action
                </h2>
                <div className='border-size-[2px] rounded-lg border border-[#0C111D] bg-[#FFF] p-4'>
                  <div className='mb-2 flex items-center gap-2'>
                    <Icon
                      variant='eye'
                      height={20}
                      width={20}
                      stroke='#0C111D'
                    />
                    <h3 className="font-['Inter'] text-[12px] font-medium leading-[20px] text-[#0C111D]">
                      Monitor
                    </h3>
                  </div>
                  <p className="font-['Inter'] text-[12px] font-normal leading-[18px] text-[#0C111D]">
                    {selectedIncumbent.recommendedAction}
                  </p>
                </div>
              </section>

              {/* Support Section */}
              {/* <section>
                <h2 className="w-[176px] h-[15px] font-['Inter'] font-bold text-[12px] leading-[15px] text-gray-950 mb-4">
                  Support
                </h2>
                {selectedIncumbent.support.map((item, index) => (
                  <div
                    key={index}
                    className='mb-4 rounded-lg border border-gray-200 bg-white p-6'
                  >
                    <p className='mb-4 text-gray-700'>{item.insight}</p>
                    <h3 className='mb-2 text-sm font-medium text-gray-500'>
                      Sources:
                    </h3>
                    <ul className='space-y-2'>
                      {item.sources.map((source, sourceIndex) => (
                        <li key={sourceIndex} className='flex items-start'>
                          <div className='rounded-md bg-[#EAECF0] p-[4px]'>
                            <Icon variant='link-source' {...iconDefaultProps} />
                          </div>
                          <div className='ml-2'>
                            <a
                              href={source.url}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='text-blue-600 hover:underline'
                            >
                              {source.name}
                            </a>
                            <p className='text-sm text-gray-500'>
                              {source.description}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </section> */}
            </div>
          ) : (
            <div className='flex h-full items-center justify-center'>
              <p className='text-lg text-gray-500'>
                Select an incumbent to view details
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default IncumbentsList;
