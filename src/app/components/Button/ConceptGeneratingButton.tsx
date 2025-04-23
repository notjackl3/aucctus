import { ConceptReportStatusBySection } from '@libs/api/types';
import { FunctionComponent, useRef, useEffect, useCallback } from 'react';
import images from '@assets/img';
import { ComponentTooltip } from '@components';
import { ConceptStatusTooltip } from '../ToolTip/ConceptStatusTooltip';
import useGenerationStatus from '@hooks/concepts/generation-status.hook';

type ConceptGeneratingButtonProps = {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  reportStatusBySection?: ConceptReportStatusBySection;
  dateReportStarted?: string;
  dateReportCompleted?: string;
};

const ConceptGeneratingButton: FunctionComponent<
  ConceptGeneratingButtonProps
> = ({
  onClick,
  disabled,
  reportStatusBySection,
  dateReportStarted,
  dateReportCompleted,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { completedCount, totalCount } = useGenerationStatus(
    reportStatusBySection,
  );

  const updatePlaybackSpeed = useCallback(() => {
    if (!videoRef.current) return;

    if (totalCount > 0) {
      const speed = completedCount / totalCount;
      videoRef.current.playbackRate = Math.max(1, speed);
    } else {
      videoRef.current.playbackRate = 1;
    }
  }, [completedCount, totalCount]);

  useEffect(() => {
    updatePlaybackSpeed();
  }, [updatePlaybackSpeed]);

  return (
    <ComponentTooltip
      tip={
        reportStatusBySection && (
          <ConceptStatusTooltip
            reportStatusBySection={reportStatusBySection}
            dateReportStarted={dateReportStarted}
            dateReportCompleted={dateReportCompleted}
          />
        )
      }
      hideDelay={0}
    >
      <button
        onClick={onClick}
        disabled={disabled}
        className='min-w-[150px] overflow-hidden'
        aria-label='Generate concept'
      >
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className='h-full w-full origin-center transform object-cover'
          style={{ transform: 'scale(1.75)' }}
        >
          <source src={images.generatingAnimated} type='video/webm' />
          Your browser does not support the video tag.
        </video>
      </button>
    </ComponentTooltip>
  );
};

export default ConceptGeneratingButton;
