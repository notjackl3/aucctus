import { cn } from '@libs/utils/react';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const TextInput = ({
  value,
  onChange,
  placeholder = 'Type your answer here...',
}: TextInputProps) => {
  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className={cn(
          'aucctus-bg-primary aucctus-border-primary aucctus-text-primary w-full resize-none rounded-xl border p-4 text-sm transition-colors',
          'placeholder:aucctus-text-tertiary',
          'focus:aucctus-border-brand focus:outline-none focus:ring-1 focus:ring-primary-600/30',
        )}
      />
      <div className='mt-1 text-right'>
        <span className='aucctus-text-tertiary text-xs'>
          {value.length > 0
            ? `${value.length} characters`
            : 'Be as detailed as you like'}
        </span>
      </div>
    </div>
  );
};
