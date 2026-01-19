import images from '@assets/img';
import { Badge, Button, ComponentTooltip, Icon } from '@components';
import { SkeletonBlock } from '@components/Skeleton/ConceptReport';
import { cn } from '@libs/utils/react';
import { getLogoUrl } from '@libs/utils/source';
import type { ProductSearchStatus } from '@libs/api/types';
import React, { useRef } from 'react';
import ComponentCarousel, {
  ComponentCarouselRef,
} from '../../Carousel/ComponentCarousel';
import type { Company, Product } from '../hooks/useEcosystem';
import CompanyTooltip from './CompanyTooltip';
import ProductImage from './ProductImage';

interface ProductCarouselProps {
  ecosystemData: Company[];
  productSearchStatus: ProductSearchStatus;
}

const getCompanyLogoUrl = (websiteUrl: string | undefined): string => {
  if (!websiteUrl) return '';
  try {
    const hostname = new URL(websiteUrl).hostname.replace('www.', '');
    return getLogoUrl(hostname);
  } catch {
    return '';
  }
};

/**
 * Animated scanning icon with orbiting effect
 */
const ScanningIcon: React.FC = () => (
  <>
    <style>{`
      @keyframes orbit {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      @keyframes pulse-glow {
        0%, 100% {
          opacity: 0.4;
          transform: scale(1);
        }
        50% {
          opacity: 0.8;
          transform: scale(1.05);
        }
      }

      .scanning-orbit {
        animation: orbit 2s linear infinite;
      }

      .scanning-pulse {
        animation: pulse-glow 2s ease-in-out infinite;
      }
    `}</style>
    <div className='relative flex h-6 w-6 items-center justify-center'>
      {/* Outer orbiting ring */}
      <div className='scanning-orbit absolute inset-0'>
        <svg viewBox='0 0 24 24' className='h-full w-full'>
          <circle
            cx='12'
            cy='12'
            r='10'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.5'
            strokeDasharray='8 12'
            className='aucctus-stroke-brand-primary opacity-60'
          />
        </svg>
      </div>
      {/* Inner pulsing dot */}
      <div className='scanning-pulse aucctus-bg-brand-primary h-2 w-2 rounded-full' />
    </div>
  </>
);

/**
 * Skeleton card that matches the real product card structure
 */
const ProductCardSkeleton: React.FC = () => (
  <div className='aucctus-bg-primary aucctus-border-secondary flex h-[320px] w-[280px] flex-shrink-0 flex-col overflow-hidden rounded-lg border'>
    {/* Image placeholder */}
    <SkeletonBlock className='h-[180px] w-full rounded-none' />

    {/* Product Info */}
    <div className='flex flex-1 flex-col space-y-2 p-3'>
      {/* Title and Price */}
      <div className='flex items-start justify-between gap-2'>
        <SkeletonBlock className='h-4 w-32' />
        <div className='flex flex-col items-end gap-1'>
          <SkeletonBlock className='h-4 w-16' />
          <SkeletonBlock className='h-3 w-12' />
        </div>
      </div>

      {/* Company Badge */}
      <SkeletonBlock className='h-6 w-28 rounded-full' />

      {/* Description */}
      <SkeletonBlock className='h-8 w-full' />

      {/* Tags */}
      <div className='flex gap-1'>
        <SkeletonBlock className='h-5 w-16 rounded' />
        <SkeletonBlock className='h-5 w-20 rounded' />
      </div>
    </div>
  </div>
);

/**
 * Loading state skeleton showing product card placeholders in a carousel layout
 */
const ProductCarouselSkeleton: React.FC = () => (
  <>
    {/* Header */}
    <div className='px-0 pt-4'>
      <div className='flex items-center justify-between'>
        <div className='flex-1'>
          <h3 className='aucctus-text-primary flex items-center gap-2 text-xl font-semibold tracking-tight'>
            <div className='aucctus-text-primary h-5 w-5'>
              <Icon variant='map-02' />
            </div>
            Competitive Product Scan
          </h3>
          <div className='mt-1 flex items-center gap-2'>
            <ScanningIcon />
            <p className='aucctus-text-secondary text-base'>
              Scanning competitor products
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Skeleton Carousel */}
    <div className='mt-4 flex gap-4 overflow-hidden'>
      {[1, 2, 3, 4].map((i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  </>
);

const ProductCarousel: React.FC<ProductCarouselProps> = ({
  ecosystemData,
  productSearchStatus,
}) => {
  const carouselRef = useRef<ComponentCarouselRef>(null);

  const hasProducts = ecosystemData.some(
    (company) => company.relevantProducts.length > 0,
  );
  const isSearchingProducts =
    productSearchStatus === 'pending' || productSearchStatus === 'in_progress';

  // Show skeleton carousel when searching for products
  if (isSearchingProducts) {
    return <ProductCarouselSkeleton />;
  }

  // Hide section entirely if no products found after search completes
  if (!hasProducts) {
    return <></>;
  }

  return (
    <>
      {/* Header with Navigation */}
      <div className='px-0 pt-4'>
        <div className='flex items-center justify-between'>
          <div className='flex-1'>
            <h3 className='aucctus-text-primary flex items-center gap-2 text-xl font-semibold tracking-tight'>
              <div className='aucctus-text-primary h-5 w-5'>
                <Icon variant='map-02' />
              </div>
              Competitive Product Scan
            </h3>
            <p className='aucctus-text-secondary mt-1 text-base'>
              Products that directly compete with concept
            </p>
          </div>
          <div className='flex gap-2'>
            <Button
              onClick={() => carouselRef.current?.scrollPrev()}
              size='sm'
              color='light'
            >
              <Icon
                variant='chevronleft'
                className='aucctus-stroke-secondary h-4 w-4'
              />
            </Button>
            <Button
              onClick={() => carouselRef.current?.scrollNext()}
              size='sm'
              color='light'
            >
              <Icon
                variant='chevron-right'
                className='aucctus-stroke-secondary h-4 w-4'
              />
            </Button>
          </div>
        </div>
      </div>

      {/* Carousel */}
      <div className='rounded-lg' style={{ marginTop: '1rem' }}>
        <ComponentCarousel
          ref={carouselRef}
          cardWidth='280px'
          gap='16px'
          showNavigation={false}
        >
          {ecosystemData.map((company) =>
            company.relevantProducts.map((product: Product) => (
              <div
                key={product.id}
                className='aucctus-bg-primary aucctus-border-secondary flex h-[320px] flex-col overflow-hidden rounded-lg border transition-shadow hover:shadow-lg'
              >
                {/* Product Image with View Product Button */}
                <div
                  className='group relative overflow-hidden'
                  style={{ height: '180px' }}
                >
                  <ProductImage src={product.image} alt={product.name} />
                  {/* View Product Button */}
                  <Button
                    size='sm'
                    color='primary-light'
                    className='absolute right-2 top-2 gap-1.5 border border-white/60 bg-black/40 text-xs font-medium text-white shadow-xl backdrop-blur-md transition-all hover:bg-black/50'
                    onClick={() => {
                      if (product.url) {
                        window.open(product.url, '_blank');
                        return;
                      }

                      const companyData = ecosystemData.find(
                        (c) => c.name === product.company,
                      );
                      if (companyData?.website) {
                        window.open(companyData.website, '_blank');
                      }
                    }}
                  >
                    <Icon
                      variant='link-external'
                      className='h-3.5 w-3.5 stroke-white'
                    />
                    View Product
                  </Button>
                </div>

                {/* Product Info */}
                <div className='flex flex-1 flex-col space-y-2 p-3'>
                  {/* Title and Price */}
                  <div className='flex items-start justify-between gap-2'>
                    <h4 className='aucctus-text-primary truncate text-sm font-semibold'>
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

                  {/* Company Badge */}
                  <ComponentTooltip
                    tip={
                      <CompanyTooltip
                        company={company}
                        isVisible={true}
                        productDifferentiator={product.differentiator}
                      />
                    }
                    preferredPosition='below'
                  >
                    <div
                      className={cn(
                        'aucctus-border-primary flex w-fit items-center gap-2 rounded-full border px-2 py-1',
                        'aucctus-bg-primary-hover cursor-pointer transition-all !duration-200',
                      )}
                    >
                      <div className='flex h-4 w-4 items-center justify-center overflow-hidden rounded-full border border-transparent'>
                        {company.website ? (
                          <img
                            className='h-full w-full object-contain'
                            alt='company-logo'
                            src={getCompanyLogoUrl(company.website)}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                images['link'];
                            }}
                          />
                        ) : (
                          <span className='aucctus-text-primary text-xs font-bold'>
                            {product.company.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <span className='aucctus-text-primary line-clamp-1 pr-1 text-xs font-medium'>
                        {product.company}
                      </span>
                    </div>
                  </ComponentTooltip>

                  {/* Description */}
                  <p className='aucctus-text-secondary line-clamp-2 truncate text-xs leading-relaxed'>
                    {product.differentiator}
                  </p>

                  {/* Category Tags */}
                  {product.tags && product.tags.length > 0 && (
                    <div className='flex flex-wrap gap-1'>
                      {product.tags.slice(0, 2).map((tag) => (
                        <Badge.Default
                          key={tag}
                          value={tag}
                          classNameBadge='aucctus-bg-secondary-subtle aucctus-border-secondary capitalize'
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )),
          )}
        </ComponentCarousel>
      </div>
    </>
  );
};

export default ProductCarousel;
