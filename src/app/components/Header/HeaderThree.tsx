import React from 'react';

interface HeaderProps {
  text: string;
}

const HeaderThree: React.FC<HeaderProps> = ({ text }) => {
  return (
    <h3 className='text-base font-medium leading-normal text-indigo-900'>
      {text}
    </h3>
  );
};

export default HeaderThree;
