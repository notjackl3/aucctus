'use client';

import { Badge, Button, Icon, Modal } from '@components';
import { IInsight, IInvestor, ISupport } from '@libs/api/types';
import { useCallback, useEffect, useState } from 'react';
import images from '@assets/img';
import InvestorsLineChart from './InvestorsLineChart';
import { formatLargeNumber } from '@libs/utils/number';
import { useModal } from '@context/ModalContextProvider';

const iconDefaultProps = {
  height: 16,
  width: 16,
  stroke: '#2B3674',
};

type InvestorListProps = {
  investors: IInvestor[];
};

function getTotalInvestment(investors: IInvestor[]): number {
  return investors.reduce((acc, val) => acc + val.investedAmount, 0);
}

function getTotalInvestments(investors: IInvestor[]): number {
  return investors.length;
}

const Investors = ({ investors }: InvestorListProps) => {
  const [selectedInvestment, setSelectedInvestment] =
    useState<IInvestor | null>(null);

  const { openModal } = useModal();

  useEffect(() => {
    if (investors.length > 0) {
      setSelectedInvestment(investors[0]);
    }
  }, [investors]);

  const totalInvestment = getTotalInvestment(investors);
  const totalInvestments = getTotalInvestments(investors);

  // Ensure the list is sorted from earliest to latest
  const sortedInvestors = [...investors].sort(
    (a, b) =>
      new Date(b.investmentDate).getTime() -
      new Date(a.investmentDate).getTime(),
  );

  const handleSupportModalClick = useCallback(
    (conclusion: string, support: ISupport) => {
      openModal(Modal.EvidenceAndReasoning, {
        conclusion: conclusion,
        reasoning: support.insights
          .map((i: IInsight) => i.summary)
          .join('\n\n'),
        sources: Array.from(
          new Map(
            support.insights
              .flatMap((i: IInsight) => i.sources) // Flatten all sources arrays
              .map((source) => [source.url, source]), // Use source.url as the key
          ).values(), // Get only the unique values
        ),
      });
    },
    [openModal],
  );

  return (
    <div className='flex flex-col rounded-xl border border-gray-200 bg-white p-4 pt-8 shadow-sm'>
      <div className='flex flex-row items-center justify-start'>
        <h2 className='pr-2 font-bold leading-[30px] text-[#0C111D]'>
          Investors
        </h2>
        <Badge.Count
          value={sortedInvestors.length}
          classNameBadge='bg-[#D0D5DD] h-4'
          classNameLabel='text-[#0C111D] text-sm font-bold'
        />
      </div>

      <div className='mt-8 flex overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm'>
        <div className='h-full w-80'>
          <nav>
            {sortedInvestors.map((investment) => (
              <div
                key={investment.uuid}
                className={`group flex cursor-pointer flex-col items-start gap-3 p-4 hover:bg-gray-50 ${
                  selectedInvestment?.uuid === investment.uuid
                    ? 'bg-gray-100'
                    : ''
                }`}
                onClick={() => setSelectedInvestment(investment)}
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
                        src={`https://logo.clearbit.com/${investment.domain}`}
                      />
                    </div>
                    <h3 className='ml-2 text-sm font-medium text-gray-900'>
                      {investment.name}
                    </h3>
                  </div>
                  <div
                    onClick={() =>
                      handleSupportModalClick(
                        investment.name,
                        investment.support,
                      )
                    }
                    className='cursor-pointer rounded-md bg-[#EAECF0] p-[4px]'
                  >
                    <Icon variant='link-source' {...iconDefaultProps} />
                  </div>
                </div>
                <div className='flex-start flex gap-6'>
                  <div>
                    <p className='font-inter text-[12px] font-bold text-[#0C111D]'>
                      Amount invested
                    </p>
                    <p className='font-inter pt-3 text-[12px] font-normal text-[#0C111D]'>
                      ${formatLargeNumber(investment.investedAmount)}
                    </p>
                  </div>
                  <div>
                    <p className='font-inter text-[12px] font-bold text-[#0C111D]'>
                      Date invested
                    </p>
                    <p className='font-inter pt-3 text-[12px] font-normal text-[#0C111D]'>
                      {investment.investmentDate}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </nav>
        </div>
        <main className='flex-1 border-l border-gray-200 bg-[#F9FAFB] p-6'>
          <div className='rounded bg-white p-5 shadow-md'>
            <div className='direction-row flex gap-6'>
              <div>
                <p className='font-inter text-[10px] font-medium text-[#667085]'>
                  Total Investment
                </p>
                <p className='font-inter flex items-center gap-2 pt-2 text-[20px] font-bold text-[#0C111D]'>
                  <Icon
                    variant='trendup'
                    height='25'
                    width='25'
                    stroke='#17B26A'
                  />
                  <p>{formatLargeNumber(totalInvestment)}</p>
                </p>
              </div>
              <div>
                <p className='font-inter text-[10px] font-medium text-[#667085]'>
                  Total Investments
                </p>
                <p className='font-inter flex items-center gap-2 pt-2 text-[20px] font-bold text-[#0C111D]'>
                  <Icon
                    variant='trendup'
                    height='25'
                    width='25'
                    stroke='#17B26A'
                  />
                  <p>{totalInvestments}</p>
                </p>
              </div>
            </div>
            {sortedInvestors?.length > 0 && (
              <InvestorsLineChart
                data={sortedInvestors ?? []}
                selected={selectedInvestment}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Investors;
