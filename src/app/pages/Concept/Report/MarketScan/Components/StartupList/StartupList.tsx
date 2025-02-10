import { Badge, Modal } from '@components';
import { useModal } from '@context/ModalContextProvider';
import { ISource, IStartup } from '@libs/api/types';
import React from 'react';
import StartupDetails from './StartupDetails';
import StartupSideBarItem from './StartupSideBarItem';

interface IStartupDashboardProps {
  startups: IStartup[];
}

const StartupList: React.FC<IStartupDashboardProps> = ({ startups }) => {
  const { openModal } = useModal();
  const [selectedStartup, setSelectedStartup] = React.useState<
    IStartup | undefined
  >(startups[0]);

  React.useEffect(() => {
    if (startups[0]) {
      setSelectedStartup(startups[0]);
    }
  }, [startups]);

  // Example callback for opening the "evidence & reasoning" modal
  const handleReasoningModelClick = React.useCallback(
    (conclusion: string, reasoning: string, sources: ISource[]) => {
      openModal(Modal.EvidenceAndReasoning, {
        conclusion,
        reasoning,
        sources,
      });
    },
    [openModal],
  );

  return (
    <div className='relative rounded-xl border border-gray-200 bg-white p-4 pt-8 shadow-sm'>
      {/* Header */}
      <div className='mb-4 flex flex-row items-center justify-start'>
        <h2 className='pr-2 font-bold leading-[30px] text-[#0C111D]'>
          Startups
        </h2>
        <Badge.Count
          value={startups.length}
          classNameBadge='bg-[#D0D5DD] h-4'
          classNameLabel='text-[#0C111D] text-sm font-bold'
        />
      </div>

      {/*
        SIDEBAR: Absolutely positioned on the left.
        - `top-0 bottom-0` pins it to the container’s top & bottom.
        - `w-80` gives it a fixed width.
        - `overflow-y-auto` so it scrolls if there is extra content.
        - We add a bit of padding so items aren't flush against the sides.
      */}
      <div className='absolute bottom-4 left-4 top-[4rem] max-h-[80vh] w-80 overflow-y-auto rounded-lg border border-gray-200 bg-white p-4'>
        <nav>
          {startups.map((startup) => (
            <StartupSideBarItem
              key={startup.uuid}
              startup={startup}
              isSelected={startup.uuid === selectedStartup?.uuid}
              onClick={() => setSelectedStartup(startup)}
            />
          ))}
        </nav>
      </div>

      {/*
        MAIN CONTENT: This remains in normal flow, so it determines
        the container's overall height.
        
        We add a left margin to keep it from going under the absolute sidebar.
        The container now grows/shrinks based on how tall <main> is.
      */}
      <main className='ml-[22rem] rounded-lg border-l border-gray-200 bg-[#F9FAFB]'>
        {selectedStartup ? (
          <div className='flex max-h-[80vh] gap-4 overflow-y-auto pb-6 pl-6 pt-6'>
            <StartupDetails
              className='pr-6' // for scrollbar positioning
              startup={selectedStartup}
              onReasoningClick={(conclusion, reasoning, sources) =>
                handleReasoningModelClick(conclusion, reasoning, sources)
              }
            />
          </div>
        ) : (
          <div className='flex h-full items-center justify-center'>
            <p className='text-lg text-gray-500'>
              Select a startup to view details
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default StartupList;
