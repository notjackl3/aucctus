import React from 'react';

interface MultiSourceListProps {
  className?: string;
  children: React.ReactNode;
}

const ComponentList: React.FC<MultiSourceListProps> = ({
  children,
  className,
}) => {
  return (
    <div className={`flex flex-col rounded-lg bg-white ${className}`}>
      {children}
    </div>
  );
};

export default ComponentList;
