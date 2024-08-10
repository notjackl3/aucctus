import { camelCaseToTitleCase } from '@libs/utils';
import * as Radio from '@radix-ui/react-radio-group';
import React from 'react';

interface IRadioGroup {
  value?: string;
  defaultValue?: string;
  labels: string[];
  onSelect: (value: string) => void;
  ariaLabel?: string;
}

const RadioGroup: React.FC<IRadioGroup> = ({ value, defaultValue, labels, onSelect, ariaLabel }) => (
  <Radio.Root
    className='flex flex-col gap-2.5'
    value={value}
    defaultValue={defaultValue}
    aria-label={ariaLabel}
    onValueChange={onSelect}
  >
    {labels.map((value, index) => (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Radio.Item
          className='h-[25px] w-[25px] cursor-default rounded-full border border-gray-200 bg-gray-100 shadow-md outline-none hover:outline-primary-400 focus:shadow-lg'
          value={value}
          id={`r${index + 1}`}
        >
          <Radio.Indicator className="relative flex h-full w-full items-center justify-center after:block after:h-[11px] after:w-[11px] after:rounded-[50%] after:bg-primary-400 after:content-['']" />
        </Radio.Item>
        <label className='pl-2 text-base font-medium capitalize leading-tight text-slate-500' htmlFor={`r${index + 1}`}>
          {camelCaseToTitleCase(value)}
        </label>
      </div>
    ))}
  </Radio.Root>
);

export default RadioGroup;
