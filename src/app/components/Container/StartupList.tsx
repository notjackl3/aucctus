import { Badge, Card, Container, Modal } from '@components';
import { useModal } from '@context/ModalContextProvider';
import { ISource, IStartup } from '@libs/api/types';
import React from 'react';

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
    (conclusion: string, reasoning: string, sources: ISource[]) =>
      (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        openModal(Modal.EvidenceAndReasoning, {
          conclusion,
          reasoning,
          sources,
        });
        e.preventDefault();
        e.stopPropagation();
      },
    [openModal],
  );

  return (
    <div className='flex flex-col rounded-xl border border-gray-200 bg-white p-4 pt-8 shadow-sm'>
      {/* Header */}
      <div className='p flex flex-row items-center justify-start'>
        <h2 className='pr-2 font-bold leading-[30px] text-[#0C111D]'>
          Startups
        </h2>
        <Badge.Count
          value={startups.length}
          classNameBadge='bg-[#D0D5DD] h-4'
          classNameLabel='text-[#0C111D] text-sm font-bold'
        />
      </div>

      <div className='mt-8 flex overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm'>
        {/* Left Sidebar */}
        <div className='h-full w-80'>
          <nav>
            {startups.map((startup) => (
              <Card.StartupSideBarItem
                key={startup.uuid}
                startup={startup}
                isSelected={startup.uuid === selectedStartup?.uuid}
                onClick={() => setSelectedStartup(startup)}
              />
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <main className='flex-1 border-l border-gray-200 bg-[#F9FAFB] p-6'>
          {selectedStartup ? (
            <Container.StartupDetails
              startup={selectedStartup}
              onReasoningClick={handleReasoningModelClick}
            />
          ) : (
            <div className='flex h-full items-center justify-center'>
              <p className='text-lg text-gray-500'>
                Select a startup to view details
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default StartupList;
