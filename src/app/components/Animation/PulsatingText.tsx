import { FunctionComponent } from 'react';

export interface PulsatingTextProps {
  /**
   * The text to animate with pulsating effect
   */
  text: string;
  /**
   * Delay between each letter's animation start (in ms)
   * @default 80
   */
  delayPerLetter?: number;
  /**
   * Additional className for the container span
   */
  className?: string;
}

/**
 * Renders text with each letter pulsating with a staggered animation delay.
 * Uses the `animate-pulse-slow` tailwind animation class.
 */
const PulsatingText: FunctionComponent<PulsatingTextProps> = ({
  text,
  delayPerLetter = 80,
  className = '',
}) => {
  return (
    <span className={`flex items-center ${className}`}>
      {text.split('').map((letter, index) => (
        <span
          key={index}
          className='inline-block animate-pulse-slow'
          style={{ animationDelay: `${index * delayPerLetter}ms` }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </span>
      ))}
    </span>
  );
};

export default PulsatingText;
