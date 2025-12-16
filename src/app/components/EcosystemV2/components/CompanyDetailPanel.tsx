import React from 'react';
import { Company } from '../hooks/useEcosystem';
import { Icon, Badge } from '@components';
import ComponentTooltip from '../../ToolTip/ComponentTooltip';
import type { IconProps } from '@components/Icon/Icon/Icon';
import ComponentCarousel from '../../Carousel/ComponentCarousel';
import { cn } from '@libs/utils/react';
import images from '@assets/img';
import { getLogoUrl } from '@libs/utils/source';

interface CompanyDetailPanelProps {
  company: Company | null;
}

const extractSources = (text: string) => {
  const sources: { name: string; url: string; domain: string }[] = [];

  // Extract website sources from "Sources:" section
  const sourcesMatch = text.match(/Sources:\s*([^\n]+)/i);
  if (sourcesMatch) {
    const websites = sourcesMatch[1].split(',').map((s) => s.trim());
    websites.forEach((site) => {
      if (site) {
        // Extract domain from URL
        const domain = site
          .replace(/^(https?:\/\/)?(www\.)?/, '')
          .split('/')[0];
        const name = domain.split('.')[0];

        sources.push({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          url: site.startsWith('http') ? site : `https://${site}`,
          domain,
        });
      }
    });
  }

  return sources;
};

type SourceDisplay = {
  label: string;
  iconUrl?: string;
  iconVariant?: IconProps['variant'];
};

const SOURCE_MAP: Record<string, SourceDisplay> = {
  linkedin: {
    label: 'LinkedIn',
    iconUrl: getLogoUrl('linkedin.com'),
  },
  pitchbook: {
    label: 'PitchBook',
    iconUrl: getLogoUrl('pitchbook.com'),
  },
  crunchbase: {
    label: 'Crunchbase',
    iconUrl: getLogoUrl('crunchbase.com'),
  },
  'cb insights': {
    label: 'CB Insights',
    iconUrl: getLogoUrl('cbinsights.com'),
  },
  growjo: {
    label: 'Growjo',
    iconUrl: getLogoUrl('growjo.com'),
  },
  'seamless.ai': {
    label: 'Seamless.AI',
    iconUrl: getLogoUrl('seamless.ai'),
  },
  'press coverage': {
    label: 'Press Coverage',
    iconVariant: 'file-attachment',
  },
  'public reporting': {
    label: 'Public Reporting',
    iconVariant: 'file-attachment',
  },
  'company report': {
    label: 'Company Report',
    iconVariant: 'file-attachment',
  },
};

const getSourceDisplay = (
  sourceLabel?: string | null,
  sourceType?: string | null,
): SourceDisplay | null => {
  if (!sourceLabel) return null;

  if (sourceType === 'ai_reasoning') {
    return {
      label: 'AI Reasoning',
      iconVariant: 'sparkles',
    };
  }

  const normalized = sourceLabel.toLowerCase();
  const key = normalized.split('/')[0].trim();
  const mapped = SOURCE_MAP[key];

  if (mapped) return mapped;

  // Fallback: use the label as-is (not clickable)
  return {
    label: sourceLabel,
    iconVariant: 'file-attachment',
  };
};

const CompanyDetailPanel: React.FC<CompanyDetailPanelProps> = ({ company }) => {
  if (!company) {
    return (
      <div className='text-muted-foreground flex h-full items-center justify-center'>
        Select a company to view details
      </div>
    );
  }

  const sources = extractSources(company.competitiveAdvantage);
  const cleanedAdvantage = company.competitiveAdvantage
    .replace(/Sources:.*$/i, '')
    .trim();
  const revenueSource = getSourceDisplay(
    company.revenueSourceLabel,
    company.revenueSourceType,
  );
  const employeesSource = getSourceDisplay(
    company.employeesSourceLabel,
    company.employeesSourceType,
  );
  const fundingSource = getSourceDisplay(
    company.fundingSourceLabel,
    company.fundingSourceType,
  );

  // Helper function to render source badge with optional tooltip for AI reasoning
  const renderSourceBadge = (
    source: SourceDisplay | null,
    sourceUrl?: string | null,
    aiExplanation?: string | null,
  ) => {
    if (!source) return null;

    const handleClick = () => {
      if (sourceUrl) {
        window.open(sourceUrl, '_blank');
      }
    };

    const badgeContent = (
      <div
        className={cn('inline-flex', sourceUrl && 'cursor-pointer')}
        onClick={sourceUrl ? handleClick : undefined}
      >
        <Badge.WithIcon
          className={cn(
            'aucctus-border-primary aucctus-text-primary w-fit max-w-[200px] gap-1.5',
            sourceUrl && 'transition-colors hover:bg-gray-100',
          )}
        >
          {source.iconUrl ? (
            <img
              src={source.iconUrl as string}
              alt={source.label}
              className='h-4 w-4 flex-shrink-0 rounded'
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <Icon
              variant={source.iconVariant || 'link-external'}
              className='aucctus-stroke-primary h-4 w-4 flex-shrink-0'
            />
          )}
          <span className='line-clamp-1 text-xs font-medium'>
            {source.label}
          </span>
        </Badge.WithIcon>
      </div>
    );

    // Always wrap in tooltip to show full label
    const tooltipContent = aiExplanation ? (
      <div className='aucctus-bg-primary aucctus-border-secondary max-w-xs rounded border px-3 py-2 shadow-lg'>
        <p className='aucctus-text-primary aucctus-text-xs mb-2 font-semibold'>
          {source.label}
        </p>
        <p className='aucctus-text-secondary aucctus-text-xs'>
          {aiExplanation}
        </p>
      </div>
    ) : (
      <div className='aucctus-bg-primary aucctus-border-secondary rounded border px-2 py-1 shadow-lg'>
        <p className='aucctus-text-primary aucctus-text-xs'>{source.label}</p>
      </div>
    );

    return (
      <ComponentTooltip tip={tooltipContent}>
        <span className='inline-flex'>{badgeContent}</span>
      </ComponentTooltip>
    );
  };

  return (
    <div className='h-full overflow-y-auto p-6'>
      <div className='space-y-6'>
        {/* Header with logo, name, and location/actions */}
        <div className='flex items-start justify-between gap-4'>
          {/* Left side - Logo and company info */}
          <div className='flex items-start gap-4'>
            {company.logoType === 'image' && company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={company.name}
                className='h-16 w-16 flex-shrink-0 rounded-lg object-contain'
              />
            ) : (
              <div
                className='flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg text-2xl font-bold text-white'
                style={{ backgroundColor: company.brandColor }}
              >
                {company.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className='flex-1'>
              <h2 className='aucctus-text-primary text-xl font-bold'>
                {company.name}
              </h2>
              <p className='aucctus-text-secondary mt-1 text-sm'>
                {company.product}
              </p>

              {/* Strategic Tags */}
              {company.strategicTags && company.strategicTags.length > 0 && (
                <div className='mt-3 flex flex-wrap gap-2'>
                  {company.strategicTags.map((tag, idx) => (
                    <Badge.WithIcon
                      key={idx}
                      className='aucctus-bg-data-subtle aucctus-text-data-primary aucctus-border-data-subtle'
                    >
                      <span className='text-xs font-medium'>{tag.tag}</span>
                    </Badge.WithIcon>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right side - Location info */}
          <div className='flex flex-col items-end gap-2'>
            <Badge.WithIcon className='aucctus-border-primary aucctus-text-primary'>
              <Icon variant='map-pin' />
              <span className='whitespace-nowrap text-sm'>
                {company.headquarters}
              </span>
            </Badge.WithIcon>
            <div className='flex items-center gap-2'>
              {company.website && (
                <a
                  href={company.website}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex h-8 w-8 items-center justify-center rounded bg-black hover:bg-black/90'
                >
                  <Icon
                    variant='link-external'
                    className='aucctus-stroke-white h-4 w-4'
                  />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className='aucctus-border-primary rounded border p-6'>
          <h3 className='text-foreground mb-2 text-sm font-semibold'>
            Overview
          </h3>
          <p className='text-muted-foreground text-sm leading-relaxed'>
            {company.description}
          </p>
        </div>

        {/* Metrics Cards */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          {/* Revenue Card */}
          <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border p-4'>
            <div className='aucctus-text-secondary mb-2 text-sm'>Revenue</div>
            <div className='aucctus-text-primary mb-3 text-2xl font-bold'>
              {company.revenue
                ? new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    maximumFractionDigits: 1,
                    notation: 'compact',
                    compactDisplay: 'short',
                  }).format(company.revenue)
                : 'N/A'}
            </div>
            {renderSourceBadge(
              revenueSource,
              company.revenueSourceUrl,
              company.revenueAiExplanation,
            )}
          </div>

          {/* Employees Card */}
          <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border p-4'>
            <div className='aucctus-text-secondary mb-2 text-sm'>Employees</div>
            <div className='aucctus-text-primary mb-3 text-2xl font-bold'>
              {company.employees?.toLocaleString() || 'N/A'}
            </div>
            {renderSourceBadge(
              employeesSource,
              company.employeesSourceUrl,
              company.employeesAiExplanation,
            )}
          </div>

          {/* Funding Raised / Parent Company Card */}
          <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border p-4'>
            <div className='aucctus-text-secondary mb-2 text-sm'>
              {company.type === 'startup' ? 'Funding Raised' : 'Parent Company'}
            </div>
            <div className='aucctus-text-primary mb-3 text-2xl font-bold'>
              {company.type === 'startup'
                ? company.funding
                  ? company.funding >= 1_000_000
                    ? `$${(company.funding / 1_000_000).toFixed(1)}M`
                    : `$${(company.funding / 1_000).toFixed(0)}K`
                  : 'N/A'
                : company.parentCompany || 'Independent'}
            </div>
            {company.type === 'startup' &&
              renderSourceBadge(
                fundingSource,
                company.fundingSourceUrl,
                company.fundingAiExplanation,
              )}
          </div>
        </div>

        {/* Competitive Advantage */}
        <div className='aucctus-border-primary rounded border p-6'>
          <h3 className='text-foreground mb-3 text-sm font-semibold'>
            Competitive Advantage
          </h3>
          <p className='text-muted-foreground mb-4 text-sm leading-relaxed'>
            {cleanedAdvantage}
          </p>
          {sources.length > 0 && (
            <div className='flex flex-wrap gap-2'>
              {sources.map((source, index) => (
                <a
                  key={index}
                  href={source.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className={cn(
                    'aucctus-border-primary flex items-center gap-2 rounded-full border px-2 py-1',
                    'aucctus-bg-primary-hover cursor-pointer transition-all !duration-200',
                  )}
                >
                  <div className='flex h-4 w-4 items-center justify-center overflow-hidden rounded-full border border-transparent'>
                    <img
                      className='h-80 w-80 object-contain'
                      alt='source-logo'
                      src={getLogoUrl(source.domain)}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = images.link;
                      }}
                    />
                  </div>
                  <span className='aucctus-text-primary pr-1 text-xs font-medium'>
                    {source.name}
                  </span>
                  <Icon
                    variant='link-external'
                    className='aucctus-stroke-primary h-4 w-4'
                  />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Relevant Products */}
        <div className='aucctus-border-primary rounded border p-6'>
          <h3 className='text-foreground mb-4 text-sm font-semibold'>
            Relevant Products
          </h3>

          {company.relevantProducts.length > 0 ? (
            <ComponentCarousel
              cardWidth='280px'
              gap='16px'
              showNavigation={true}
              arrowPlacement='middle-float'
            >
              {company.relevantProducts.map((product, idx) => (
                <div
                  key={idx}
                  className='aucctus-border-secondary flex flex-col overflow-hidden rounded-lg border transition-shadow hover:shadow-lg'
                >
                  {/* Product Image - Wider, full width */}
                  <div
                    className='aucctus-bg-secondary group relative overflow-hidden'
                    style={{ height: '180px' }}
                  >
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className='h-full w-full object-cover'
                      />
                    ) : (
                      <div className='flex h-full w-full items-center justify-center'>
                        <Icon
                          variant='cube'
                          className='aucctus-stroke-secondary h-8 w-8'
                        />
                      </div>
                    )}
                    {/* View Product Button */}
                    <button
                      className='absolute right-2 top-2 flex items-center gap-1.5 rounded border border-white/60 bg-black/40 px-2 py-1 text-xs font-medium text-white shadow-xl backdrop-blur-md transition-all hover:bg-black/50'
                      onClick={() => {
                        if (product.url) {
                          window.open(product.url, '_blank');
                          return;
                        }
                        if (company.website) {
                          window.open(company.website, '_blank');
                        }
                      }}
                    >
                      <Icon
                        variant='link-external'
                        className='h-3.5 w-3.5 stroke-white'
                      />
                      View Product
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className='flex flex-1 flex-col space-y-2 p-3'>
                    <div className='flex items-start justify-between gap-2'>
                      <h4 className='aucctus-text-primary text-sm font-semibold'>
                        {product.name}
                      </h4>
                      <div className='flex-shrink-0 text-right'>
                        {product.price &&
                        product.price !== 'Price not available' ? (
                          <>
                            <div className='aucctus-text-primary text-sm font-bold'>
                              {product.price}
                            </div>
                            <div className='aucctus-text-secondary text-xs'>
                              / {product.format}
                            </div>
                          </>
                        ) : (
                          <div className='aucctus-text-tertiary text-xs italic'>
                            Price not available
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </ComponentCarousel>
          ) : (
            <p className='aucctus-text-secondary text-sm'>
              No products available
            </p>
          )}
        </div>

        {/* Possible Next Steps */}
        {company.nextSteps && company.nextSteps.length > 0 && (
          <div className='aucctus-border-primary rounded border p-6'>
            <h3 className='text-foreground mb-4 flex items-center gap-2 text-sm font-semibold'>
              <Icon
                variant='sparkles'
                className='aucctus-stroke-primary h-4 w-4'
              />
              Possible Next Steps
            </h3>

            <ul className='aucctus-text-primary space-y-3 text-sm'>
              {company.nextSteps.map((step, idx) => (
                <li key={idx} className='flex items-start gap-3'>
                  <span className='aucctus-text-brand-primary mt-1 text-xs'>
                    •
                  </span>
                  <span className='flex-1'>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDetailPanel;
