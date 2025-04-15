/* eslint-disable no-console */
import { IConceptVersion } from '@libs/api/types/concept/concept_versions';
import useStore from '@stores/store';
import React, { useMemo } from 'react';
import utils from '@libs/utils';
import { Badge } from '@components';
import VersionComment from './VersionComment';

interface ConceptVersionCardProps {
  version: IConceptVersion;
  onSelect: (version: IConceptVersion) => void;
}

const ConceptVersionCard: React.FC<ConceptVersionCardProps> = ({
  version,
  onSelect,
}) => {
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

      if (diffMinutes <= 2) {
        return 'Just now';
      } else if (diffMinutes < 60) {
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

  const activeConceptVersion = useStore(
    (state) => state.conceptReport.conceptVersionId,
  );

  const isActiveVersion = useMemo(
    () => activeConceptVersion === version.versionId,
    [activeConceptVersion, version.versionId],
  );

  return (
    <div
      key={version.revisionId}
      onClick={() => !isActiveVersion && onSelect(version)}
      className='aucctus-text-primary aucctus-bg-primary-hover flex cursor-pointer flex-col p-3'
    >
      <div className='flex flex-col gap-2'>
        <div className='flex flex-row items-center gap-2'>
          <Badge.Default
            value={`V${version.conceptVersionNumber}`}
            classNameBadge='aucctus-border-secondary border items-center justify-center'
            classNameLabel='aucctus-text-secondary'
          />
          <span className='aucctus-text-secondary aucctus-text-sm items-center justify-center'>
            {formatVersionDate(version)}
          </span>
          <span className='flex-1' />
          {activeConceptVersion === version.versionId && (
            <Badge.Default
              value={'Current'}
              classNameBadge='aucctus-border-success aucctus-bg-success-primary border rounded-full items-center justify-center ml-3'
              classNameLabel='aucctus-text-success-primary'
            />
          )}
        </div>
        {version.comment && (
          <VersionComment
            comment={version.comment}
            sections={version.conceptAffectedSections}
          />
        )}
      </div>
    </div>
  );
};

export default ConceptVersionCard;
