import images from '@assets/img';
import { motion } from 'framer-motion';
import React, { useMemo } from 'react';

/** Node shape variants for the neural network visualization */
type NodeShape = 'circle' | 'diamond' | 'square' | 'hexagon';

/** Configuration for a single neural network node */
interface NodeConfig {
  x: number;
  y: number;
  size: number;
  shape: NodeShape;
  delay: number;
}

/** Connection between two nodes */
interface Connection {
  from: number;
  to: number;
}

export interface NucleusHeroBackgroundProps {
  /**
   * Optional video URL for the background.
   * If provided, displays video instead of brand gradient image.
   */
  videoUrl?: string;
  /**
   * Gradient overlay configuration.
   * Defaults to a dark gradient from bottom to top.
   */
  gradientOverlay?: string;
  /**
   * Whether to show the animated neural network effect.
   * Defaults to true.
   */
  showNeuralNetwork?: boolean;
}

/**
 * Seeded random function for deterministic but organic-looking positions.
 * Ensures consistent layout across renders.
 */
const seededRandom = (seed: number): number => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
};

/**
 * Predefined node positions with varied properties for organic feel.
 * 22 nodes distributed across the viewport with different sizes, shapes, and animation delays.
 */
const NODES: NodeConfig[] = [
  { x: 8, y: 15, size: 10, shape: 'circle', delay: 0 },
  { x: 22, y: 8, size: 6, shape: 'diamond', delay: 0.2 },
  { x: 35, y: 22, size: 14, shape: 'circle', delay: 0.4 },
  { x: 52, y: 12, size: 8, shape: 'hexagon', delay: 0.1 },
  { x: 68, y: 18, size: 12, shape: 'circle', delay: 0.5 },
  { x: 85, y: 10, size: 7, shape: 'square', delay: 0.3 },
  { x: 12, y: 38, size: 9, shape: 'diamond', delay: 0.6 },
  { x: 28, y: 45, size: 16, shape: 'circle', delay: 0.15 },
  { x: 45, y: 35, size: 6, shape: 'circle', delay: 0.45 },
  { x: 62, y: 42, size: 11, shape: 'hexagon', delay: 0.25 },
  { x: 78, y: 38, size: 8, shape: 'circle', delay: 0.7 },
  { x: 92, y: 32, size: 5, shape: 'diamond', delay: 0.35 },
  { x: 5, y: 62, size: 7, shape: 'circle', delay: 0.55 },
  { x: 18, y: 72, size: 13, shape: 'square', delay: 0.8 },
  { x: 38, y: 65, size: 9, shape: 'circle', delay: 0.1 },
  { x: 55, y: 75, size: 15, shape: 'hexagon', delay: 0.4 },
  { x: 72, y: 68, size: 6, shape: 'diamond', delay: 0.65 },
  { x: 88, y: 58, size: 10, shape: 'circle', delay: 0.2 },
  { x: 15, y: 88, size: 8, shape: 'circle', delay: 0.75 },
  { x: 42, y: 85, size: 11, shape: 'square', delay: 0.3 },
  { x: 65, y: 90, size: 7, shape: 'circle', delay: 0.5 },
  { x: 82, y: 82, size: 12, shape: 'diamond', delay: 0.15 },
];

/**
 * Generates connections between nodes based on distance threshold.
 * Uses seeded random for deterministic but organic-looking connections.
 */
const generateConnections = (nodes: NodeConfig[]): Connection[] => {
  const connections: Connection[] = [];
  nodes.forEach((node, i) => {
    nodes.forEach((target, j) => {
      if (i >= j) return;
      const distance = Math.sqrt(
        Math.pow(node.x - target.x, 2) + Math.pow(node.y - target.y, 2),
      );
      // Varied connection threshold based on node sizes for organic feel
      const threshold = 25 + (node.size + target.size) * 0.5;
      if (distance < threshold && seededRandom(i * 100 + j) > 0.3) {
        connections.push({ from: i, to: j });
      }
    });
  });
  return connections;
};

/** Pre-computed connections for consistent renders */
const CONNECTIONS = generateConnections(NODES);

/**
 * Renders a shape based on the node configuration.
 */
const renderShape = (shape: NodeShape, size: number): React.ReactNode => {
  switch (shape) {
    case 'diamond':
      return (
        <div
          className='bg-white/50'
          style={{
            width: size * 0.7,
            height: size * 0.7,
            transform: 'rotate(45deg)',
          }}
        />
      );
    case 'square':
      return (
        <div
          className='rounded-sm bg-white/50'
          style={{ width: size * 0.75, height: size * 0.75 }}
        />
      );
    case 'hexagon':
      return (
        <div
          className='bg-white/50'
          style={{
            width: size,
            height: size * 0.85,
            clipPath:
              'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
          }}
        />
      );
    default:
      return (
        <div
          className='rounded-full bg-white/50'
          style={{ width: size, height: size }}
        />
      );
  }
};

/**
 * Shared hero background component for Nucleus pages.
 *
 * Features a 5-layer visual effect:
 * 1. Brand gradient background image (with blur)
 * 2. Dark overlay
 * 3. Animated neural network connection lines
 * 4. Animated floating nodes with various shapes
 * 5. Vignette gradients for depth
 */
const NucleusHeroBackground: React.FC<NucleusHeroBackgroundProps> = ({
  videoUrl,
  gradientOverlay = 'bg-gradient-to-t from-black/70 via-black/50 to-black/40',
  showNeuralNetwork = true,
}) => {
  // Hide neural network when video is present (video provides its own visual interest)
  const shouldShowNeuralNetwork = showNeuralNetwork && !videoUrl;
  // Memoize connection line rendering for performance
  const connectionLines = useMemo(
    () =>
      CONNECTIONS.map(({ from, to }, idx) => {
        const node = NODES[from];
        const target = NODES[to];
        return (
          <motion.line
            key={`line-${idx}`}
            x1={`${node.x}%`}
            y1={`${node.y}%`}
            x2={`${target.x}%`}
            y2={`${target.y}%`}
            stroke='white'
            strokeOpacity={0.2 + seededRandom(idx) * 0.2}
            strokeWidth={0.5 + seededRandom(idx + 50) * 1}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              duration: 1.5 + seededRandom(idx) * 1,
              delay: node.delay,
            }}
          />
        );
      }),
    [],
  );

  // Memoize node rendering for performance
  const nodeElements = useMemo(
    () =>
      NODES.map((node, i) => (
        <motion.div
          key={i}
          className='absolute flex items-center justify-center'
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
            width: node.size,
            height: node.size,
            transform: 'translate(-50%, -50%)',
            boxShadow: `0 0 ${node.size * 1.5}px rgba(255,255,255,0.25)`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0.3, 0.7, 0.3],
            scale: [0.85, 1.15, 0.85],
          }}
          transition={{
            duration: 2.5 + seededRandom(i) * 2,
            delay: node.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {renderShape(node.shape, node.size)}
        </motion.div>
      )),
    [],
  );

  return (
    <div className='absolute inset-0 overflow-hidden'>
      {/* Layer 1: Background Video or Brand Gradient Image */}
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
          className='absolute -inset-4 bg-cover bg-center bg-no-repeat'
          style={{
            backgroundImage: `url(${images.nucleusBrandGradient})`,
            filter: 'blur(2px)',
            animation: 'moveBackground 30s ease infinite',
            transform: 'scale(1.05)',
          }}
        />
      )}

      {/* Configurable Gradient Overlay (for video mode compatibility) */}
      {videoUrl && <div className={`absolute inset-0 ${gradientOverlay}`} />}

      {/* Neural Network Effect (Layers 3-5) - Hidden when video is present */}
      {shouldShowNeuralNetwork && (
        <>
          {/* Constellation container with slow breathing scale animation */}
          <motion.div
            className='absolute inset-0'
            animate={{
              scale: [1, 1.03, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {/* Layer 3: Neural Network Connection Lines */}
            <svg
              className='absolute inset-0 h-full w-full opacity-25'
              preserveAspectRatio='xMidYMid slice'
            >
              {connectionLines}
            </svg>

            {/* Layer 4: Animated Floating Nodes */}
            <div className='absolute inset-0'>{nodeElements}</div>
          </motion.div>

          {/* Layer 5: Vignette Gradients for Depth */}
          <div className='absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40' />
          <div className='absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50' />
        </>
      )}
    </div>
  );
};

export default NucleusHeroBackground;
