import React from 'react';
import images from '@assets/img';

export interface NucleusHeroBackgroundProps {
  /**
   * Optional video URL for the background.
   * If not provided, falls back to static image with animation.
   */
  videoUrl?: string;
  /**
   * Gradient overlay configuration.
   * Defaults to a dark gradient from bottom to top.
   */
  gradientOverlay?: string;
}

/**
 * Shared hero background component for Nucleus pages.
 * Displays either a video background (if URL provided) or animated image fallback.
 * Includes configurable gradient overlay for content readability.
 */
const NucleusHeroBackground: React.FC<NucleusHeroBackgroundProps> = ({
  videoUrl,
  gradientOverlay = 'bg-gradient-to-t from-black/70 via-black/50 to-black/40',
}) => {
  return (
    <>
      {/* Background Video or Image */}
      {videoUrl ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          className='absolute inset-0 h-full w-full object-cover'
          onLoadedMetadata={(e) => {
            e.currentTarget.playbackRate = 0.75;
          }}
        >
          <source src={videoUrl} type='video/mp4' />
        </video>
      ) : (
        <div
          className='absolute inset-0 bg-cover bg-center'
          style={{
            backgroundImage: `url(${images.aiExplorationsBackground})`,
            backgroundSize: 'cover',
            animation: 'moveBackground 30s ease infinite',
          }}
        />
      )}

      {/* Gradient Overlay */}
      {videoUrl && <div className={`absolute inset-0 ${gradientOverlay}`} />}
    </>
  );
};

export default NucleusHeroBackground;
