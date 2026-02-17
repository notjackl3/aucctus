import React, { useState } from 'react';
import { cn } from '@libs/utils/react';
import { Box } from 'lucide-react';

interface ProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackIconClassName?: string;
}

const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  className,
  fallbackIconClassName = 'aucctus-stroke-secondary h-8 w-8',
}) => {
  const [hasError, setHasError] = useState(false);

  const showFallback = !src || hasError;

  if (showFallback) {
    return (
      <div
        className={cn(
          'flex h-full w-full items-center justify-center',
          className,
        )}
      >
        <Box className={fallbackIconClassName} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={cn('h-full w-full object-cover', className)}
      onError={() => setHasError(true)}
    />
  );
};

export default ProductImage;
