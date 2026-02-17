import React from 'react';
import { BookOpen } from 'lucide-react';
export interface CalculatorHeaderProps {
  title: string;
  description: string;
}

export const CalculatorHeader: React.FC<CalculatorHeaderProps> = ({
  title,
  description,
}) => (
  <div className='aucctus-bg-secondary-subtle aucctus-border-primary rounded-lg border bg-opacity-50 p-4'>
    <div className='flex items-start gap-3'>
      <BookOpen className='aucctus-stroke-brand-primary mt-2 h-5 w-5' />
      <div>
        <h3 className='aucctus-text-md-semibold aucctus-text-primary mb-1'>
          {title}
        </h3>
        <p className='aucctus-text-xs aucctus-text-secondary'>{description}</p>
      </div>
    </div>
  </div>
);
