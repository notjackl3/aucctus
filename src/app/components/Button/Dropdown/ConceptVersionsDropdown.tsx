import React from 'react';
import { cn } from '@libs/utils/react';
import {
  useConceptVersions,
  useRevertConceptVersion,
} from '@hooks/query/concepts.hook';
import { IConceptVersion } from '@libs/api/types/concept/concept_versions';
import { Loading } from '@components';
import LoadingMask from '@components/Card/ConceptGeneration/UserExploration/components/util/LoadingMask';
import ConceptVersionCard from '@components/Card/ConceptVersionCard';

interface ConceptVersionsDropdownProps {
  conceptUuid: string;
  className?: string;
  onClose: () => void;
}

const ConceptVersionsDropdown: React.FC<ConceptVersionsDropdownProps> = ({
  conceptUuid,
  className,
  onClose,
}) => {
  const { versions, isLoading } = useConceptVersions(conceptUuid);
  const { mutate: revertConceptVersion, isLoading: isReverting } =
    useRevertConceptVersion();

  const handleVersionSelect = (version: IConceptVersion) => {
    revertConceptVersion(
      {
        uuid: conceptUuid,
        payload: { versionId: version.versionId },
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  return (
    <div
      className={cn(
        'aucctus-bg-primary aucctus-border-primary mt-1 rounded-md border shadow-lg',
        className,
      )}
    >
      {isLoading ? (
        <span className='flex h-full items-center justify-center'>
          <Loading />
        </span>
      ) : (
        <div className='flex !max-h-[500px] flex-col gap-2 overflow-auto py-1'>
          {versions && versions.versions.length > 0 ? (
            versions.versions.map((v) => (
              <ConceptVersionCard
                key={v.revisionId}
                version={v}
                onSelect={handleVersionSelect}
              />
            ))
          ) : (
            <div className='aucctus-text-secondary px-4 py-2'>
              No versions available
            </div>
          )}
        </div>
      )}
      <LoadingMask isLoading={isReverting} />
    </div>
  );
};

export default ConceptVersionsDropdown;
