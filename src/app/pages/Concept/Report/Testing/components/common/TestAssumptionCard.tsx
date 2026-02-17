import React, { useState, useRef, useEffect } from 'react';
import { AssumptionCategory } from '@libs/api/types';
import CategoryIcon from '../../../Assumptions/components/cards/category-progress-card/CategoryIcon';
import { Pencil, Target } from 'lucide-react';

interface TestAssumptionCardProps {
  category: AssumptionCategory;
  statement: string;
  benchmark?: string;
  onBenchmarkChange?: (newBenchmark: string) => void;
}

const TestAssumptionCard: React.FC<TestAssumptionCardProps> = ({
  category,
  statement,
  benchmark,
  onBenchmarkChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(benchmark || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditValue(benchmark || '');
  }, [benchmark]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editValue.trim() && onBenchmarkChange) {
      onBenchmarkChange(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(benchmark || '');
      setIsEditing(false);
    }
  };

  return (
    <div className='aucctus-bg-primary aucctus-border-secondary flex overflow-hidden rounded-lg border shadow-sm'>
      {/* Left side - The Assumption */}
      <div className='flex-1 p-5'>
        {/* Category row */}
        <div className='mb-4 flex items-center space-x-2'>
          <CategoryIcon category={category} />
          <span className='aucctus-text-sm-medium aucctus-text-primary capitalize'>
            {category}
          </span>
        </div>

        {/* Assumption statement */}
        <h3 className='aucctus-text-lg-bold aucctus-text-primary'>
          {statement}
        </h3>
      </div>

      {/* Right side - Validation Benchmark/Threshold */}
      {benchmark && (
        <div className='aucctus-bg-success-secondary flex w-72 flex-col justify-center border-l border-emerald-200 p-4'>
          <div className='mb-2 flex items-center gap-2'>
            <div className='aucctus-bg-success-primary rounded-full p-1'>
              <Target className='aucctus-stroke-success-primary h-3 w-3' />
            </div>
            <div className='flex flex-1 items-center justify-between'>
              <span className='aucctus-text-xs-medium aucctus-text-success-primary uppercase'>
                Threshold
              </span>
              {!isEditing && onBenchmarkChange && (
                <button
                  onClick={() => setIsEditing(true)}
                  className='aucctus-bg-success-primary-hover rounded p-0.5 transition-colors'
                >
                  <Pencil className='aucctus-stroke-success-primary h-2.5 w-2.5' />
                </button>
              )}
            </div>
          </div>
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className='aucctus-text-xs aucctus-text-success-primary aucctus-bg-primary w-full resize-none rounded border border-emerald-300 px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500/50'
              rows={2}
            />
          ) : (
            <div
              className={`aucctus-text-xs aucctus-text-success-primary ${onBenchmarkChange ? 'aucctus-bg-success-primary-hover -mx-1 cursor-pointer rounded px-1 py-0.5 transition-colors' : ''}`}
              onDoubleClick={() => onBenchmarkChange && setIsEditing(true)}
            >
              {benchmark}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TestAssumptionCard;
