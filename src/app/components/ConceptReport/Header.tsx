import React from 'react';

interface HeaderProps {
  text: string;
}

const Header: React.FC<HeaderProps> = ({ text }) => {
  return <h3 className='w-96 text-base font-medium leading-normal text-indigo-900'>{text}</h3>;
};

export default Header;
