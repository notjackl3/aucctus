import React from 'react';
import { Company } from '../hooks/useEcosystem';
import { cn } from '@libs/utils/react';
import { Badge } from '@components';

interface CompanyListPanelProps {
  companies: Company[];
  selectedCompany: Company | null;
  onSelectCompany: (company: Company) => void;
}

const getRecommendationStyle = (
  recommendation: 'partner' | 'invest' | 'monitor' | 'compete',
) => {
  switch (recommendation) {
    case 'partner':
      return 'bg-blue-50 text-blue-700 border-blue-200 border';
    case 'invest':
      return 'bg-green-50 text-green-700 border-green-200 border';
    case 'monitor':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200 border';
    case 'compete':
      return 'bg-red-50 text-red-700 border-red-200 border';
  }
};

const CompanyListPanel: React.FC<CompanyListPanelProps> = ({
  companies,
  selectedCompany,
  onSelectCompany,
}) => {
  return (
    <div className='h-full overflow-y-auto'>
      <div className='space-y-2 p-4'>
        {companies.map((company) => (
          <button
            key={company.id}
            onClick={() => onSelectCompany(company)}
            className={cn(
              'w-full rounded-lg border p-3 text-left transition-colors',
              selectedCompany?.id === company.id
                ? 'bg-primary/10 border-black/60'
                : 'bg-background border-border/50 hover:bg-muted/50',
            )}
          >
            <div className='flex items-center gap-3'>
              {company.logoType === 'image' && company.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt={company.name}
                  className='h-8 w-8 flex-shrink-0 rounded-full object-contain'
                />
              ) : (
                <div
                  className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white'
                  style={{ backgroundColor: company.brandColor }}
                >
                  {company.logoText}
                </div>
              )}
              <div className='min-w-0 flex-1'>
                <div className='mb-1 flex items-start justify-between gap-2'>
                  <div className='min-w-0 flex-1'>
                    <h3 className='aucctus-text-primary truncate text-sm font-semibold'>
                      {company.name}
                    </h3>
                    <p className='aucctus-text-secondary text-xs'>
                      Founded {company.foundedYear}
                    </p>
                  </div>
                  <Badge.Default
                    value={company.recommendation}
                    classNameBadge={`flex-shrink-0 ${getRecommendationStyle(company.recommendation)}`}
                    classNameLabel='capitalize font-bold'
                  />
                </div>
                <p className='aucctus-text-secondary line-clamp-2 truncate text-xs'>
                  {company.product}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CompanyListPanel;
