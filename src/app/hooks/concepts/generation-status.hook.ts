import { ConceptReportStatusBySection } from '@libs/api/types';
import { useMemo, useState, useEffect } from 'react';

/**
 * Hook to calculate the generation status of a concept report
 */
const useGenerationStatus = (
  reportStatusBySection?: ConceptReportStatusBySection,
) => {
  const [countdown, setCountdown] = useState({ minutes: 0, seconds: 0 });

  // Calculate the initial status
  const status = useMemo(() => {
    if (!reportStatusBySection) {
      return {
        progressPercentage: 0,
        estimatedTimeRemaining: { minutes: 0, seconds: 0 },
        completedCount: 0,
        totalCount: 0,
        isComplete: false,
      };
    }

    const sections = Object.values(reportStatusBySection);
    const totalCount = sections.length;
    const completedCount = sections.filter(
      (section) => section.status === 'complete',
    ).length;
    const progressPercentage =
      totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // Estimate time remaining (assuming each section takes ~30 seconds)
    const remainingSections = totalCount - completedCount;
    const totalSecondsRemaining = remainingSections * 30;
    const minutes = Math.floor(totalSecondsRemaining / 60);
    const seconds = totalSecondsRemaining % 60;

    return {
      progressPercentage,
      estimatedTimeRemaining: { minutes, seconds },
      completedCount,
      totalCount,
      isComplete: progressPercentage === 100,
    };
  }, [reportStatusBySection]);

  // Set up countdown timer
  useEffect(() => {
    // Initialize countdown with calculated values
    setCountdown(status.estimatedTimeRemaining);

    // Only set up interval if generation is not complete
    if (
      !status.isComplete &&
      (status.estimatedTimeRemaining.minutes > 0 ||
        status.estimatedTimeRemaining.seconds > 0)
    ) {
      const interval = setInterval(() => {
        setCountdown((current) => {
          // Calculate total seconds
          let totalSeconds = current.minutes * 60 + current.seconds;

          // Decrease by 1 second
          totalSeconds = Math.max(0, totalSeconds - 1);

          // Convert back to minutes and seconds
          const minutes = Math.floor(totalSeconds / 60);
          const seconds = totalSeconds % 60;

          return { minutes, seconds };
        });
      }, 1000);

      // Clean up interval
      return () => clearInterval(interval);
    }
  }, [status.estimatedTimeRemaining, status.isComplete]);

  return {
    ...status,
    // Return the countdown time instead of the static calculation
    estimatedTimeRemaining: countdown,
  };
};

export default useGenerationStatus;
