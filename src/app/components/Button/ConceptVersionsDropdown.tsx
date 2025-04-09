import React from 'react';
import { cn } from '@libs/utils/react';
import {
  useConceptVersions,
  useRevertConceptVersion,
} from '@hooks/query/concepts.hook';
import { IConceptVersion } from '@libs/api/types/concept/concept_versions';
import utils from '@libs/utils';
import { Loading } from '@components';
import LoadingMask from '@components/Card/ConceptGeneration/UserExploration/components/util/LoadingMask';

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

  const formatVersionDate = React.useCallback((version: IConceptVersion) => {
    if (!version.createdTimestamp) {
      return '';
    }

    const date = new Date(version.createdTimestamp * 1000); // s -> ms
    const now = new Date();

    if (!isNaN(date.getTime())) {
      const diffDays = utils.time.differenceInDays(date, now);
      const diffMonths = utils.time.differenceInMonths(date, now);
      const diffHours = utils.time.differenceInHours(date, now);
      const diffMinutes = utils.time.differenceInMinutes(date, now);

      if (diffMinutes < 60) {
        return `${diffMinutes} minutes ago`;
      } else if (diffHours < 24) {
        return `${diffHours} hours ago`;
      } else if (diffDays < 30) {
        return `${diffDays} days ago`;
      } else if (diffMonths < 12) {
        return `${diffMonths} months ago`;
      } else {
        return utils.time.dateFormatter(date.toISOString());
      }
    }
  }, []);

  const formatVersion = React.useCallback(
    (version: IConceptVersion) => {
      return `${version.title} (v. ${version.revisionId}) ${version.createdTimestamp ? ' - ' + formatVersionDate(version) : ''}`;
    },
    [formatVersionDate],
  );

  return (
    <div
      className={cn(
        'aucctus-bg-secondary aucctus-border-primary mt-1 rounded-md border shadow-lg',
        className,
      )}
    >
      {isLoading ? (
        <span className='flex h-full items-center justify-center'>
          <Loading />
        </span>
      ) : (
        <div className='!max-h-[300px] overflow-auto py-1'>
          {versions && versions.versions.length > 0 ? (
            versions.versions.map((v) => (
              <div
                key={v.versionId}
                onClick={() => handleVersionSelect(v)}
                className='aucctus-text-primary aucctus-bg-secondary-hover cursor-pointer px-4 py-2'
              >
                {formatVersion(v)}
              </div>
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
