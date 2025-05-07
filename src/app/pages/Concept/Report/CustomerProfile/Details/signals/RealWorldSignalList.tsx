import { Loading } from '@components';
import { useCustomerProfileRealWorldSignals } from '@hooks/query/concepts.hook';
import React, { useEffect, useMemo } from 'react';
import GroupedSignals from './GroupedSignals';
import SignalHeader from './SignalHeader';
import AiInsight from '../components/AiInsight';

const containerClassName =
  'flex flex-1 flex-col gap-2 rounded-lg border aucctus-border-primary aucctus-bg-primary px-4 pt-6 pb-2';

interface IRealWorldSignalListProps {
  profileUuid: string;
}

const RealWorldSignalList: React.FC<IRealWorldSignalListProps> = ({
  profileUuid,
}) => {
  const {
    signalsResponse,
    isLoading: isLoadingSignals,
    isFetched: isFetchedSignals,
  } = useCustomerProfileRealWorldSignals(profileUuid);

  const signals = useMemo(
    () => signalsResponse?.realWorldSignals || [],
    [signalsResponse],
  );
  const summary = useMemo(
    () => signalsResponse?.realWorldSignalsSummary,
    [signalsResponse],
  );
  const isAgentResearching = useMemo(
    () => ['Pending', 'Not Started'].includes(summary?.status || ''),
    [summary],
  );

  // Early return if no data after fetch
  if (isFetchedSignals && !signalsResponse) {
    return null;
  }

  if (isLoadingSignals) {
    return (
      <div className={containerClassName}>
        <Loading />
      </div>
    );
  }

  if (isAgentResearching) {
    return (
      <div className={containerClassName}>
        <div className='flex flex-1 flex-row items-center justify-center gap-4 py-4'>
          <Loading />
          <span className='aucctus-text-tertiary aucctus-text-sm'>
            An agent is currently analyzing real world signals. Please check
            back later.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClassName}>
      <SignalHeader profileUuid={profileUuid} />

      {signals.length > 0 && (
        <>
          <GroupedSignals profileUuid={profileUuid} signals={signals} />
          {summary?.summary && (
            <AiInsight
              textColorClass='aucctus-text-brand-primary'
              iconStrokeClass='aucctus-stroke-brand-primary'
              customInsight={summary?.summary}
            />
          )}
        </>
      )}

      {signals.length === 0 && (
        <div className='flex justify-center py-4'>
          <span className='aucctus-text-tertiary aucctus-text-sm'>
            No signals available yet.
          </span>
        </div>
      )}
    </div>
  );
};

export default RealWorldSignalList;
