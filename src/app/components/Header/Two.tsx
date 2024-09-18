import React from 'react';

interface TwoProps {
  text: string;
}

const Two: React.FC<TwoProps> = ({ text }) => {
  return (
    <h2 className='text-2xl font-semibold capitalize not-italic text-indigo-900'>
      {text}
    </h2>
  );
};

export default Two;
