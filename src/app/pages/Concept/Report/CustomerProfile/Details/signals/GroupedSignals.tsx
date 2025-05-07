import React, { useCallback, useMemo, useState } from 'react';
import TabView, { TabElement } from '@components/Container/TabView/TabView';
import { ICustomerProfileRealWorldSignal } from '@libs/api/types';
import RealWorldSignalCard from './RealWorldSignalCard';

interface IGroupedSignalsProps {
  profileUuid: string;
  signals: ICustomerProfileRealWorldSignal[];
}

const GroupedSignals: React.FC<IGroupedSignalsProps> = ({
  profileUuid,
  signals,
}) => {
  // Group signals by stance
  const groupedSignals = useMemo(() => {
    const grouped: Record<string, ICustomerProfileRealWorldSignal[]> = {
      all: [], // Initialize 'all' category first
    };

    signals.forEach((signal) => {
      // Add to specific stance group
      if (signal.stance) {
        grouped[signal.stance] = [...(grouped[signal.stance] || []), signal];
      }
      // Always add to 'all' group
      grouped['all'].push(signal);
    });

    return grouped;
  }, [signals]);

  // Get all available stances that have at least one signal
  const availableStances = useMemo(() => {
    const stances: string[] = ['all']; // Always include 'all'

    // Add other stances that have signals
    Object.entries(groupedSignals).forEach(([stance, stanceSignals]) => {
      if (stance !== 'all' && stanceSignals.length > 0) {
        stances.push(stance);
      }
    });

    return stances;
  }, [groupedSignals]);

  // State to track the currently selected stance - initialize with 'all' if available
  const [selectedStance, setSelectedStance] = useState<string>(
    availableStances.length > 0 ? availableStances[0] : 'all',
  );

  // Create tabs for the TabView component
  const signalTabs = useMemo(() => {
    // Create tab elements for each available stance
    return availableStances.map<TabElement>((stance) => ({
      label: `${stance} (${groupedSignals[stance]?.length || 0})`,
      value: stance,
    }));
  }, [groupedSignals, availableStances]);

  // Handle tab selection
  const onTabSelect = useCallback((value: string) => {
    setSelectedStance(value);
  }, []);

  // Get the signals to display based on the selected stance
  const displayedSignals = useMemo(() => {
    return groupedSignals[selectedStance] || [];
  }, [groupedSignals, selectedStance]);

  return (
    <>
      <TabView
        tabs={signalTabs}
        tabGroupClassName='pointer-events-auto'
        className='mt-4'
        variant='button-separated'
        onTabSelect={onTabSelect}
        activeTab={selectedStance}
      >
        <div className='mt-4 flex grid w-full grid-cols-2 flex-wrap gap-4 px-4'>
          {displayedSignals.map((signal) => (
            <RealWorldSignalCard
              key={signal.uuid}
              profileUuid={profileUuid}
              signal={signal}
            />
          ))}
        </div>
      </TabView>
    </>
  );
};

export default GroupedSignals;
