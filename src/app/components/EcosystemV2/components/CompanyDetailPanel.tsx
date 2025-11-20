import React from 'react';
import { Company } from '../hooks/useEcosystem';
import { Icon, Badge } from '@components';
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

const getRecommendationIcon = (recommendation: string) => {
  switch (recommendation) {
    case 'partner':
      return 'handshake';
    case 'invest':
      return 'trending-up';
    case 'monitor':
      return 'eye';
    case 'compete':
      return 'swords';
    default:
      return 'lightbulb';
  }
};

const getRecommendationBadgeStyle = (recommendation: string) => {
  switch (recommendation) {
    case 'partner':
      return 'aucctus-bg-info-subtle aucctus-text-info-primary aucctus-border-info-subtle';
    case 'invest':
      return 'aucctus-bg-success-subtle aucctus-text-success-primary aucctus-border-success-subtle';
    case 'monitor':
      return 'aucctus-bg-warning-subtle aucctus-text-warning-primary aucctus-border-warning-subtle';
    case 'compete':
      return 'aucctus-bg-error-subtle aucctus-text-error-primary aucctus-border-error-subtle';
    default:
      return 'aucctus-bg-secondary aucctus-text-secondary aucctus-border-secondary';
  }
};

const getRecommendationIconStrokeClass = (recommendation: string) => {
  switch (recommendation) {
    case 'partner':
      return 'aucctus-stroke-info-primary';
    case 'invest':
      return 'aucctus-stroke-success-primary';
    case 'monitor':
      return 'aucctus-stroke-warning-primary';
    case 'compete':
      return 'aucctus-stroke-error-primary';
    default:
      return 'aucctus-stroke-secondary';
  }
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
                        <div className='aucctus-text-primary text-sm font-bold'>
                          {product.price}
                        </div>
                        <div className='aucctus-text-secondary text-xs'>
                          / {product.format}
                        </div>
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

        {/* Recommended Action */}
        <div className='aucctus-border-primary rounded border p-6'>
          <div className='mb-4 flex items-start justify-between gap-4'>
            <h3 className='aucctus-text-primary flex items-center gap-2 text-sm font-semibold'>
              <Icon
                variant='sparkles'
                className='aucctus-stroke-primary h-4 w-4'
              />
              Recommended Action
            </h3>
            <Badge.WithIcon
              className={getRecommendationBadgeStyle(company.recommendation)}
            >
              <Icon
                variant={getRecommendationIcon(company.recommendation)}
                className={cn(
                  'h-4 w-4',
                  getRecommendationIconStrokeClass(company.recommendation),
                )}
              />
              <span className='text-xs font-medium capitalize'>
                {company.recommendation}
              </span>
            </Badge.WithIcon>
          </div>
          <p className='aucctus-text-secondary text-sm'>
            {company.recommendationReasoning}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetailPanel;
