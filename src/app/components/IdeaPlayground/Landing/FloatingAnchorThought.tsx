import React from 'react';
import { getAnimationStyle } from '@components/Card/ConceptGeneration/UserExploration/components/util/animation-keyframes';
import type { IAnchorThought } from '../types';
import { Lightbulb } from 'lucide-react';

interface FloatingAnchorThoughtProps {
  thoughts: IAnchorThought[];
  onCardClick: (thought: IAnchorThought) => void;
  isVisible: boolean;
}

const FloatingAnchorThought: React.FC<FloatingAnchorThoughtProps> = ({
  thoughts,
  onCardClick,
  isVisible,
}) => {
  if (!isVisible) return null;

  // Position configurations for each thought card
  const positionConfigs = [
    { top: '10%', left: '50%', needsCentering: true }, // Top center
    { top: '25%', left: '5%', needsCentering: false }, // Left upper
    { top: '75%', left: '5%', needsCentering: false }, // Left lower
    { bottom: '10%', left: '50%', needsCentering: true }, // Bottom center
    { top: '75%', right: '5%', needsCentering: false }, // Right lower
    { top: '25%', right: '5%', needsCentering: false }, // Right upper
  ];

  return (
    <div className='pointer-events-none absolute inset-0 z-10'>
      {thoughts.map((thought, index) => {
        const config = positionConfigs[index];
        const { needsCentering, ...position } = config;

        return (
          <div
            key={thought.uuid || `thought-${index}`}
            className={`pointer-events-auto absolute cursor-pointer transition-transform duration-150 hover:scale-105 active:scale-95 ${needsCentering ? '-translate-x-1/2' : ''}`}
            style={position}
            onClick={() => onCardClick(thought)}
          >
            <div
              className='transition-transform duration-150 hover:scale-105'
              style={getAnimationStyle('scaleIn', 600, 800 + index * 120)}
            >
              <div
                className='aucctus-text-white flex items-center gap-2 whitespace-nowrap rounded-full border border-white/20 bg-white/10 px-4 py-2 shadow-lg backdrop-blur-md transition-all duration-200 hover:border-white/30 hover:bg-white/15'
                style={{
                  animation: `float ${3 + (index % 3) * 0.5}s ease-in-out infinite`,
                  animationDelay: `${index * 0.15}s`,
                }}
              >
                <Lightbulb
                  size={16}
                  className='aucctus-stroke-warning-tertiary flex-shrink-0'
                />
                <span className='aucctus-text-sm-medium'>
                  {thought.thought}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FloatingAnchorThought;
