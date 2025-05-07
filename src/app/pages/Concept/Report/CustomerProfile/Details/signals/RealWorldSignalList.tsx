import { Loading } from '@components';
import { useCustomerProfileRealWorldSignals } from '@hooks/query/concepts.hook';
import React from 'react';
import GroupedSignals from './GroupedSignals';
import SignalHeader from './SignalHeader';

const containerClassName =
  'flex flex-1 flex-col gap-2 rounded-lg border aucctus-border-primary aucctus-bg-primary px-4 py-6';

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

  // Early return if no data after fetch
  if (isFetchedSignals && !signalsResponse) {
    return null;
  }

  const signals = signalsResponse?.realWorldSignals || [];
  const summary = signalsResponse?.summary;
  const isAgentResearching = ['Pending', 'Not Started'].includes(
    summary?.status || '',
  );

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
      <SignalHeader onAddSignal={() => {}} />

      {signals.length > 0 && (
        <GroupedSignals profileUuid={profileUuid} signals={signals} />
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
