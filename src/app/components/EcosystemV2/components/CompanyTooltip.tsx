import React, { useState } from 'react';
import type { Company } from '../hooks/useEcosystem';

interface CompanyTooltipProps {
  company: Company;
  isVisible: boolean;
}

const CompanyTooltip: React.FC<CompanyTooltipProps> = ({
  company,
  isVisible,
}) => {
  const [isImageBroken, setIsImageBroken] = useState(false);

  if (!isVisible) return null;

  const shouldShowImage =
    company.logoType === 'image' && company.logoUrl && !isImageBroken;

  return (
    <div className='aucctus-bg-primary aucctus-border-secondary absolute left-1/2 top-full z-50 mt-3 w-72 -translate-x-1/2 rounded-lg border p-4 shadow-2xl'>
      <div className='mb-2 flex items-center gap-3'>
        <div
          className='flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-white font-bold text-white shadow-md'
          style={{
            backgroundColor: shouldShowImage ? 'white' : company.brandColor,
          }}
        >
          {shouldShowImage ? (
            <img
              src={company.logoUrl}
              alt={company.name}
              className='h-full w-full object-contain'
              onError={() => setIsImageBroken(true)}
            />
          ) : (
            <span className='font-bold text-white'>
              {company.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <p className='aucctus-text-primary text-base font-bold'>
          {company.name}
        </p>
      </div>
      <p className='aucctus-text-sm aucctus-text-secondary mb-2 font-semibold'>
        {company.product}
      </p>
      <p className='aucctus-text-xs aucctus-text-primary mb-3 leading-relaxed'>
        {company.differentiator}
      </p>
      <a
        href={company.website}
        target='_blank'
        rel='noopener noreferrer'
        className='aucctus-text-xs aucctus-text-brand-primary flex items-center gap-1 hover:underline'
      >
        Visit website →
      </a>
    </div>
  );
};

export default CompanyTooltip;
