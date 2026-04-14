import { motion } from 'framer-motion';
import React from 'react';

const JTBDBackground: React.FC = () => {
  const dots = [
    { x: 20, y: 25, delay: 0 },
    { x: 65, y: 20, delay: 0.4 },
    { x: 40, y: 55, delay: 0.8 },
    { x: 78, y: 50, delay: 1.2 },
    { x: 28, y: 72, delay: 1.6 },
    { x: 55, y: 35, delay: 2.0 },
    { x: 85, y: 68, delay: 2.4 },
  ];

  const colors = ['#34d399', '#60a5fa', '#a78bfa', '#fbbf24'];

  return (
    <div className='absolute inset-0 overflow-hidden'>
      {/* Radial glow */}
      <div
        className='absolute inset-0 opacity-30'
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(52,211,153,0.15), transparent 70%)',
        }}
      />

      {/* Grid lines */}
      <svg
        className='absolute inset-0 h-full w-full opacity-20'
        style={{ filter: 'blur(1px)' }}
        preserveAspectRatio='xMidYMid slice'
      >
        {/* Concentric rings */}
        <ellipse
          cx='50%'
          cy='50%'
          rx='40%'
          ry='35%'
          fill='none'
          stroke='white'
          strokeOpacity='0.3'
          strokeWidth='1'
          strokeDasharray='6 4'
        />
        <ellipse
          cx='50%'
          cy='50%'
          rx='25%'
          ry='22%'
          fill='none'
          stroke='white'
          strokeOpacity='0.2'
          strokeWidth='1'
          strokeDasharray='6 4'
        />
        {/* Cross lines */}
        <line
          x1='50%'
          y1='15%'
          x2='50%'
          y2='85%'
          stroke='white'
          strokeOpacity='0.1'
          strokeWidth='1'
        />
        <line
          x1='10%'
          y1='50%'
          x2='90%'
          y2='50%'
          stroke='white'
          strokeOpacity='0.1'
          strokeWidth='1'
        />
      </svg>

      {/* Animated signal dots */}
      <div className='absolute inset-0' style={{ filter: 'blur(2px)' }}>
        {dots.map((dot, i) => (
          <motion.div
            key={i}
            className='absolute h-3 w-3 rounded-full'
            style={{
              left: `${dot.x}%`,
              top: `${dot.y}%`,
              background: colors[i % colors.length],
              boxShadow: `0 0 20px ${colors[i % colors.length]}`,
            }}
            animate={{
              opacity: [0.4, 0.8, 0.4],
              scale: [0.7, 1.2, 0.7],
            }}
            transition={{
              duration: 3,
              delay: dot.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Sweep line */}
      <motion.div
        className='absolute left-1/2 top-1/2 h-px w-[40%] origin-left'
        style={{
          background:
            'linear-gradient(90deg, rgba(52,211,153,0.3) 0%, transparent 100%)',
          filter: 'blur(2px)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
};

export default JTBDBackground;
