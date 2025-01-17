import { Badge, Modal } from '@components';
import { useModal } from '@context/ModalContextProvider';
import { IIncumbent, ISource } from '@libs/api/types';
import React from 'react';
import IncumbentDetails from './IncumbentDetails';
import SidebarItem from './SidebarItem';

interface IncumbentDashboardProps {
  incumbents: IIncumbent[];
}

const IncumbentsList: React.FC<IncumbentDashboardProps> = ({ incumbents }) => {
  const { openModal } = useModal();
  const [selectedIncumbent, setSelectedIncumbent] = React.useState<
    IIncumbent | undefined
  >(incumbents[0]);

  React.useEffect(() => {
    if (incumbents.length > 0) {
      setSelectedIncumbent(incumbents[0]);
    }
  }, [incumbents]);

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
    <div className='relative rounded-xl border border-gray-200 bg-white p-4 pt-8 shadow-sm'>
      {/* Header */}
      <div className='mb-4 flex flex-row items-center justify-start'>
        <h2 className='pr-2 font-bold leading-[30px] text-[#0C111D]'>
          Incumbents
        </h2>
        <Badge.Count
          value={incumbents.length}
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
      <div className='absolute bottom-4 left-4 top-[4rem] w-80 overflow-y-auto rounded-lg border border-gray-200 bg-white p-4'>
        <nav>
          {incumbents.map((incumbent) => (
            <SidebarItem
              key={incumbent.uuid}
              incumbent={incumbent}
              isSelected={incumbent.uuid === selectedIncumbent?.uuid}
              onClick={() => setSelectedIncumbent(incumbent)}
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
      <main className='ml-[22rem] rounded-lg border-l border-gray-200 bg-[#F9FAFB] p-6'>
        {selectedIncumbent ? (
          <IncumbentDetails
            incumbent={selectedIncumbent}
            onReasoningClick={handleReasoningModelClick}
          />
        ) : (
          <div className='flex h-full items-center justify-center'>
            <p className='text-lg text-gray-500'>
              Select an incumbent to view details
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default IncumbentsList;
