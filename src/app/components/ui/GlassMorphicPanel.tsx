import React from 'react';
import { cn } from '@libs/utils/react';

interface GlassMorphicPanelProps {
  children: React.ReactNode;
  className?: string;
}

const GlassMorphicPanel: React.FC<GlassMorphicPanelProps> = ({
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        'shadow-glass rounded-xl border border-white/20 bg-white/70 p-6 backdrop-blur-md',
        className,
      )}
    >
      {children}
    </div>
  );
};

export default GlassMorphicPanel;
