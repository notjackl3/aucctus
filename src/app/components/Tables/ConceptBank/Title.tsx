import React from 'react';

interface IColHeaderProps {
  title: string;
}

const ColHeader: React.FC<IColHeaderProps> = ({ title }) => {
  return <span className='text-base font-medium text-indigo-900'>{title}</span>;
};

export default ColHeader;
