import type { JTBDSocialPlatform } from '@libs/api/types/jtbd';
import React from 'react';

interface PlatformIconConfig {
  glyph: React.ReactNode;
  color: string;
  bg: string;
}

export const platformIcons: Record<JTBDSocialPlatform, PlatformIconConfig> = {
  reddit: {
    glyph: (
      <svg viewBox='0 0 16 16' className='h-3 w-3' fill='currentColor'>
        <path d='M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0Zm4.6 9.2c0 2.1-2.1 3.8-4.6 3.8s-4.6-1.7-4.6-3.8c0-2.1 2.1-3.8 4.6-3.8s4.6 1.7 4.6 3.8Zm-2.3-.5a.8.8 0 1 1 0-1.6.8.8 0 0 1 0 1.6Zm-4.6 0a.8.8 0 1 1 0-1.6.8.8 0 0 1 0 1.6Zm4.4 2a.3.3 0 0 1-.1.4c-.7.5-1.6.7-2.5.7s-1.8-.2-2.5-.7a.3.3 0 0 1 .3-.5c.6.4 1.3.6 2.2.6s1.6-.2 2.2-.6a.3.3 0 0 1 .4.1Z' />
      </svg>
    ),
    color: 'text-orange-400',
    bg: 'bg-orange-500/15 border-orange-500/20',
  },
  x: {
    glyph: (
      <span className='text-[10px] font-black leading-none'>&#120143;</span>
    ),
    color: 'text-white',
    bg: 'bg-white/[0.08] border-white/[0.12]',
  },
  facebook: {
    glyph: <span className='text-[10px] font-bold leading-none'>f</span>,
    color: 'text-blue-400',
    bg: 'bg-blue-500/15 border-blue-500/20',
  },
  linkedin: {
    glyph: <span className='text-[10px] font-bold leading-none'>in</span>,
    color: 'text-sky-400',
    bg: 'bg-sky-500/15 border-sky-500/20',
  },
  tiktok: {
    glyph: (
      <svg viewBox='0 0 16 16' className='h-3 w-3' fill='currentColor'>
        <path d='M11.8 1h-2.4v9.3a1.7 1.7 0 1 1-1.7-1.7v-2.4a4.1 4.1 0 1 0 4.1 4.1V5.8A5.2 5.2 0 0 0 15 6.7V4.3a3.2 3.2 0 0 1-3.2-3.3Z' />
      </svg>
    ),
    color: 'text-pink-400',
    bg: 'bg-pink-500/15 border-pink-500/20',
  },
  other: {
    glyph: <span className='text-[10px] leading-none'>&#9679;</span>,
    color: 'text-white/60',
    bg: 'bg-white/[0.05] border-white/[0.1]',
  },
};
