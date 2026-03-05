import * as Slider from '@radix-ui/react-slider';

interface ScaleInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
}

export const ScaleInput = ({
  value,
  onChange,
  min = 1,
  max = 10,
  minLabel = 'Low',
  maxLabel = 'High',
}: ScaleInputProps) => {
  return (
    <div className='px-2 py-4'>
      <div className='mb-4 text-center'>
        <span className='aucctus-text-brand-primary text-3xl font-bold'>
          {value}
        </span>
        <span className='aucctus-text-tertiary text-sm'> / {max}</span>
      </div>
      <Slider.Root
        className='relative flex h-5 w-full touch-none select-none items-center'
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={1}
      >
        <Slider.Track className='aucctus-bg-tertiary relative h-2 w-full grow rounded-full'>
          <Slider.Range className='absolute h-full rounded-full bg-primary-600' />
        </Slider.Track>
        <Slider.Thumb className='block h-5 w-5 cursor-pointer rounded-full border-2 border-primary-600 bg-white shadow-md transition-transform focus:outline-none focus:ring-2 focus:ring-primary-600/30' />
      </Slider.Root>
      <div className='mt-2 flex justify-between'>
        <span className='aucctus-text-tertiary text-xs'>{minLabel}</span>
        <span className='aucctus-text-tertiary text-xs'>{maxLabel}</span>
      </div>
    </div>
  );
};
