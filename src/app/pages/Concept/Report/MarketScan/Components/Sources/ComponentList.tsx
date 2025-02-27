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
    <div className={`aucctus-bg-primary flex flex-col rounded-lg ${className}`}>
      {children}
    </div>
  );
};

export default ComponentList;
