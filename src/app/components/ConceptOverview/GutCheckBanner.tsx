import React from 'react';
import { ConceptReportSkeletons } from '@components';
import { HelpCircle } from 'lucide-react';
const { ExecutiveSummarySkeleton } = ConceptReportSkeletons;

interface GutCheckBannerProps {
  recommendation?: string;
  isLoading?: boolean;
}

const GutCheckBanner: React.FC<GutCheckBannerProps> = ({
  recommendation,
  isLoading = false,
}) => {
  // Don't render if no recommendation and not loading
  if (!recommendation && !isLoading) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return <ExecutiveSummarySkeleton />;
  }

  return (
    <div className='aucctus-bg-primary w-full rounded-lg border-b border-l-4 border-r border-t border-gray-light-200 border-l-primary-500 px-6 py-4 shadow-sm dark:border-gray-light-800 dark:border-l-primary-400'>
      <div className='mb-3 flex items-center gap-3'>
        <HelpCircle
          size={20}
          className='aucctus-stroke-tertiary flex-shrink-0'
        />
        <h3 className='aucctus-text-tertiary aucctus-text-sm font-medium uppercase tracking-wider'>
          GUT CHECK: DOES THIS SOUND PROMISING?
        </h3>
      </div>
      <p className='aucctus-text-primary aucctus-text-xl-semibold leading-relaxed'>
        {recommendation}
      </p>
    </div>
  );
};

export default React.memo(GutCheckBanner);
