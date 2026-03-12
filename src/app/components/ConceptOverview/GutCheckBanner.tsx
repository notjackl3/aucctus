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
    <div className='aucctus-bg-primary relative w-full overflow-hidden rounded-lg border border-gray-light-200 px-6 py-4 shadow-sm dark:border-gray-light-800'>
      {/* Liquid glass left edge */}
      <div className='absolute bottom-0 left-0 top-0 z-10 w-[10px] overflow-hidden'>
        {/* Base frosted glass layer */}
        <div
          className='absolute inset-0'
          style={{
            background:
              'linear-gradient(180deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.08) 50%, rgba(255, 255, 255, 0.18) 100%)',
            backdropFilter: 'blur(30px) saturate(2.4)',
            WebkitBackdropFilter: 'blur(30px) saturate(2.4)',
            boxShadow:
              'inset -2px 0 4px rgba(255, 255, 255, 0.2), 2px 0 8px rgba(0, 0, 0, 0.04), inset 1px 0 1px rgba(255, 255, 255, 0.3)',
          }}
        />
        {/* Green orb — top corner */}
        <div
          className='absolute -left-6 -top-6 h-20 w-20 animate-pulse rounded-full'
          style={{
            background:
              'radial-gradient(circle, var(--nav-brand-1, hsla(152, 100%, 33%, 0.45)) 0%, transparent 50%, transparent 70%)',
            filter: 'blur(10px)',
            animationDuration: '4s',
          }}
        />
        {/* Yellow-green orb — bottom corner */}
        <div
          className='absolute -bottom-6 -left-6 h-20 w-20 animate-pulse rounded-full'
          style={{
            background:
              'radial-gradient(circle, var(--nav-brand-2, hsla(75, 75%, 43%, 0.40)) 0%, transparent 50%, transparent 70%)',
            filter: 'blur(10px)',
            animationDuration: '5s',
            animationDelay: '1.5s',
          }}
        />
        {/* Orange mid-glow */}
        <div
          className='absolute left-0 top-1/2 h-20 w-14 -translate-y-1/2 rounded-full'
          style={{
            background:
              'radial-gradient(ellipse, var(--nav-brand-3, hsla(27, 94%, 55%, 0.30)) 0%, transparent 70%)',
            filter: 'blur(12px)',
          }}
        />
        {/* Specular highlight */}
        <div
          className='absolute inset-x-0 top-0 h-12'
          style={{
            background:
              'linear-gradient(180deg, rgba(255, 255, 255, 0.55) 0%, rgba(255, 255, 255, 0.1) 40%, transparent 100%)',
          }}
        />
        {/* Bottom curvature shadow */}
        <div
          className='absolute inset-x-0 bottom-0 h-8'
          style={{
            background:
              'linear-gradient(0deg, rgba(0, 0, 0, 0.06) 0%, transparent 100%)',
          }}
        />
        {/* Soft fade-out edge */}
        <div
          className='absolute bottom-0 right-0 top-0 w-[3px]'
          style={{
            background:
              'linear-gradient(to right, transparent, hsl(var(--card)))',
          }}
        />
      </div>

      <div className='mb-3 flex items-center gap-3 pl-4'>
        <HelpCircle
          size={20}
          className='aucctus-stroke-tertiary flex-shrink-0'
        />
        <h3 className='aucctus-text-tertiary aucctus-text-sm font-medium uppercase tracking-wider'>
          GUT CHECK: DOES THIS SOUND PROMISING?
        </h3>
      </div>
      <p className='aucctus-text-primary aucctus-text-xl-semibold pl-4 leading-relaxed'>
        {recommendation}
      </p>
    </div>
  );
};

export default React.memo(GutCheckBanner);
