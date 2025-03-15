import React, { useState } from 'react';
import { cn } from '@libs/utils/react';

interface AucctusImgProps {
  src: string;
  alt?: string;
  className?: string;
  width?: number | string;
  height?: number | string;
}

const AucctusImg: React.FC<AucctusImgProps> = ({
  src,
  alt,
  className,
  width,
  height,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <img
      src={src}
      alt={alt}
      className={cn(
        'transition-opacity duration-300',
        isLoaded ? 'opacity-100' : 'opacity-0',
        className,
      )}
      width={width}
      height={height}
      onLoad={() => setIsLoaded(true)}
    />
  );
};

export default AucctusImg;
