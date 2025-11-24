import React from 'react';
import { Company } from '../hooks/useEcosystem';
import { Icon, Badge } from '@components';
import ComponentTooltip from '../../ToolTip/ComponentTooltip';
import type { IconProps } from '@components/Icon/Icon/Icon';
import ComponentCarousel from '../../Carousel/ComponentCarousel';
import { cn } from '@libs/utils/react';
import images from '@assets/img';

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
    iconUrl: 'https://logo.clearbit.com/linkedin.com',
  },
  pitchbook: {
    label: 'PitchBook',
    iconUrl: 'https://logo.clearbit.com/pitchbook.com',
  },
  crunchbase: {
    label: 'Crunchbase',
    iconUrl: 'https://logo.clearbit.com/crunchbase.com',
  },
  'cb insights': {
    label: 'CB Insights',
    iconUrl: 'https://logo.clearbit.com/cbinsights.com',
  },
  growjo: {
    label: 'Growjo',
    iconUrl: 'https://logo.clearbit.com/growjo.com',
  },
  'seamless.ai': {
    label: 'Seamless.AI',
    iconUrl: 'https://logo.clearbit.com/seamless.ai',
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
    aiExplanation?: string | null,
  ) => {
    if (!source) return null;

    const badgeContent = (
      <Badge.WithIcon className='aucctus-border-primary aucctus-text-primary w-fit gap-1.5'>
        {source.iconUrl ? (
          <img
            src={source.iconUrl as string}
            alt={source.label}
            className='h-4 w-4 rounded'
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <Icon
            variant={source.iconVariant || 'link-external'}
            className='aucctus-stroke-primary h-4 w-4'
          />
        )}
        <span className='text-xs font-medium'>{source.label}</span>
      </Badge.WithIcon>
    );

    // If it's AI reasoning and we have an explanation, wrap in tooltip
    if (source.label === 'AI Reasoning' && aiExplanation) {
      return (
        <ComponentTooltip
          tip={
            <div className='aucctus-bg-primary aucctus-border-secondary max-w-xs rounded border px-3 py-2 shadow-lg'>
              <p className='aucctus-text-primary aucctus-text-xs'>
                {aiExplanation}
              </p>
            </div>
          }
        >
          <span className='inline-flex'>{badgeContent}</span>
        </ComponentTooltip>
      );
    }

    return badgeContent;
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
              <a
                href={`mailto:contact@${company.website?.replace('https://', '').replace('http://', '').replace('www.', '')}`}
                target='_blank'
                rel='noopener noreferrer'
                className='flex h-8 w-8 items-center justify-center rounded bg-black hover:bg-black/90'
              >
                <Icon variant='mail' className='aucctus-stroke-white h-4 w-4' />
              </a>
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
            {renderSourceBadge(revenueSource, company.revenueAiExplanation)}
          </div>

          {/* Employees Card */}
          <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border p-4'>
            <div className='aucctus-text-secondary mb-2 text-sm'>Employees</div>
            <div className='aucctus-text-primary mb-3 text-2xl font-bold'>
              {company.employees?.toLocaleString() || 'N/A'}
            </div>
            {renderSourceBadge(employeesSource, company.employeesAiExplanation)}
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
              renderSourceBadge(fundingSource, company.fundingAiExplanation)}
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
                      src={`https://logo.clearbit.com/${source.domain}`}
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
                    className='aucctus-bg-secondary relative overflow-hidden'
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
