import React from 'react';

interface CountProps {
  value: number | string;
  classNameBadge?: string; // Custom classes for the badge container
  classNameLabel?: string; // Custom classes for the label inside the badge
}

const Count: React.FC<CountProps> = ({
  value,
  classNameBadge = '',
  classNameLabel = '',
}) => {
  const defaultBadgeStyles =
    'inline-flex h-6 items-center justify-center gap-0.5 rounded-full p-2 bg-violet-50';
  const defaultLabelStyles =
    "font-['DM Sans'] text-center text-xs font-medium leading-[18px] text-indigo-600";

  return (
    <div className={`${defaultBadgeStyles} ${classNameBadge}`}>
      <span className={`${defaultLabelStyles} ${classNameLabel}`}>{value}</span>
    </div>
  );
};

export default Count;
