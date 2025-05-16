import React, { useCallback, useMemo, useState } from 'react';
import TabView, { TabElement } from '@components/Container/TabView/TabView';
import { ICustomerProfileRealWorldSignal } from '@libs/api/types';
import RealWorldSignalCard from './RealWorldSignalCard';
import { capitalize } from '@libs/utils/string';

// Define the stance order as a constant to reuse
const stanceOrder = ['In Favour', 'Neutral', 'Against'];

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

  // Get all available stances that have at least one signal, in the specific order
  const availableStances = useMemo(() => {
    const tabOrder = ['all', ...stanceOrder];
    const stances: string[] = [];

    // Filter and order stances based on the predefined order
    tabOrder.forEach((stance) => {
      if (
        stance === 'all' ||
        (groupedSignals[stance] && groupedSignals[stance].length > 0)
      ) {
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
      label: `${capitalize(stance)} (${groupedSignals[stance]?.length || 0})`,
      value: stance,
    }));
  }, [groupedSignals, availableStances]);

  // Handle tab selection
  const onTabSelect = useCallback((value: string) => {
    setSelectedStance(value);
  }, []);

  // Get the signals to display based on the selected stance
  const displayedSignals = useMemo(() => {
    const signals = groupedSignals[selectedStance] || [];

    // If we're in the 'all' tab, sort signals by stance order
    if (selectedStance === 'all') {
      return [...signals].sort((a, b) => {
        const stanceA = a.stance || '';
        const stanceB = b.stance || '';

        const indexA = stanceOrder.indexOf(stanceA);
        const indexB = stanceOrder.indexOf(stanceB);

        // If both stances are in the stanceOrder array, sort by that order
        if (indexA !== -1 && indexB !== -1) {
          return indexA - indexB;
        }

        // If only one stance is in the array, prioritize it
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;

        // If neither stance is in the array, maintain original order
        return 0;
      });
    }

    // For specific stance tabs, the signals are already filtered by that stance
    return signals;
  }, [groupedSignals, selectedStance]);

  return (
    <>
      <TabView
        tabs={signalTabs}
        tabGroupClassName='pointer-events-auto !py-2 mt-2'
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
