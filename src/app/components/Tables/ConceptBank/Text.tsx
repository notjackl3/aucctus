import classNames from 'classnames';
import React from 'react';

interface ITextProps {
  value: string;
  className?: string;
}

const Description: React.FC<ITextProps> = ({ value, className }) => {
  return <span className={classNames('text-base font-medium leading-tight text-slate-500', className)}>{value}</span>;
};

export default Description;
