import React from 'react';

interface IColHeaderProps {
  title: string;
}

const ColHeader: React.FC<IColHeaderProps> = ({ title }) => {
  return <span className=''>{title}</span>;
};

export default ColHeader;
