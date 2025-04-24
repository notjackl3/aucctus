import images from '@assets/img';
import { ComponentTooltip } from '@components';
import useGenerationStatus from '@hooks/concepts/generation-status.hook';
import { ConceptReportStatusBySection } from '@libs/api/types';
import * as browser from '@libs/utils/browser';
import { FunctionComponent, useCallback, useEffect, useRef } from 'react';
import { ConceptStatusTooltip } from '../ToolTip/ConceptStatusTooltip';

type ConceptGeneratingButtonProps = {
  reportStatusBySection?: ConceptReportStatusBySection;
  dateReportStarted?: string;
  dateReportCompleted?: string;
};

const ConceptGeneratingButton: FunctionComponent<
  ConceptGeneratingButtonProps
> = ({ reportStatusBySection, dateReportStarted, dateReportCompleted }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { completedCount, totalCount } = useGenerationStatus(
    reportStatusBySection,
  );

  const videoConfig = browser.isBrowser('Safari')
    ? {
        src: images.generatingAnimated.mp4,
        type: 'video/mp4',
      }
    : {
        src: images.generatingAnimated.webm,
        type: 'video/webm',
      };

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
      <span className='flex h-[62px] min-w-[140px] items-end justify-end bg-transparent'>
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className='mr-[-2px] h-full w-full transform object-cover'
        >
          <source src={videoConfig.src} type={videoConfig.type} />
          Your browser does not support the video tag.
        </video>
      </span>
    </ComponentTooltip>
  );
};

export default ConceptGeneratingButton;
