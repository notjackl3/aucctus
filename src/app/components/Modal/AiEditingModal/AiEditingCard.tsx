import { Icon } from '@components';
import AucctusMessageInput from '@components/Input/AucctusMessageInput';
import React, { useState } from 'react';
import IntroMessage from './IntroMessage';
import { useTransition } from 'react-spring';
import { animated } from 'react-spring';

interface AiEditingCardProps {
  onClose: () => void;
}

const AiEditingCard: React.FC<AiEditingCardProps> = ({ onClose }) => {
  const [currentMessage, setCurrentMessage] = useState('');

  const [userMessages, setUserMessages] = useState<string[]>([]);

  const transition = useTransition(userMessages.length === 0, {
    from: { opacity: 0, transform: 'translateY(20px)' },
    enter: { opacity: 1, transform: 'translateY(0px)' },
    leave: { opacity: 0, transform: 'translateY(20px)' },
    config: { tension: 280, friction: 60 },
  });

  return (
    <div className='flex h-full w-full flex-col'>
      <div className='m-4 flex flex-row gap-4'>
        <span className='flex-1' />
        <button
          onClick={onClose}
          className='aspect-square w-6 rounded-lg transition-all duration-200 hover:bg-gray-light-100 hover:bg-opacity-20'
        >
          <span className='flex items-center justify-center'>
            <Icon
              variant='closeX'
              width={20}
              height={20}
              className='stroke-gray-light-100'
            />
          </span>
        </button>
      </div>
      {transition(
        (style, item) =>
          item && (
            <animated.div
              style={style}
              className='flex flex-1 flex-col items-center justify-center'
            >
              <IntroMessage />
            </animated.div>
          ),
      )}
      <span className='flex-1' />
      <div className='relative m-4 w-auto'>
        <AucctusMessageInput
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          onSubmitMessage={() => {
            setUserMessages([...userMessages, currentMessage]);
            setCurrentMessage('');
          }}
          allowSubmitMessage={true}
          className='!max-h-[150px]'
        />
      </div>
    </div>
  );
};

export default AiEditingCard;
