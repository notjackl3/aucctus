import React from 'react';

interface HeaderProps {
  text: string;
}

const HeaderOne: React.FC<HeaderProps> = ({ text }) => {
  return <h1 className='text-[2rem] font-bold capitalize not-italic text-indigo-900'>{text}</h1>;
};

export default HeaderOne;
