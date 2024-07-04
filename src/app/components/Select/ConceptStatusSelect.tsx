import React from 'react';
import * as Select from '@radix-ui/react-select';
import { Icon } from '@components';
import { CONCEPT_STATUS_LIST, ConceptStatusColor, getConceptStatusColor } from '@libs/concepts';
import { camelCaseToTitleCase } from '@libs/utils';
import { ConceptStatus } from '@libs/api/types';

interface DropdownMenuProps {
  value: ConceptStatus;
  onChange: (value: string) => void;
}

const ConceptStatusSelect: React.FC<DropdownMenuProps> = ({ value, onChange }) => {
  const [open, setOpen] = React.useState(false);

  const onChangeEvent = React.useCallback(
    (status: string) => {
      onChange(status);
    },
    [onChange],
  );

  const selectedStatusColor = React.useMemo(() => getConceptStatusColor(value), [value]);

  return (
    <Select.Root value={value} onValueChange={onChangeEvent} open={open} onOpenChange={setOpen}>
      <Select.Trigger
        className={`inline-flex min-h-8 min-w-32 items-center justify-center gap-2 rounded-md px-2.5 py-1.5 mix-blend-multiply shadow ${CONCEPT_STATUS_MAP[selectedStatusColor].bg}`}
      >
        <Select.Icon>
          <div className={`0 h-1.5 w-1.5 rounded-full ${CONCEPT_STATUS_MAP[selectedStatusColor].bullet}`} />
        </Select.Icon>
        <Select.Value className={`flex flex-row gap-4`}>
          <span className={`${CONCEPT_STATUS_MAP[selectedStatusColor].text}`}>{camelCaseToTitleCase(value)}</span>
        </Select.Value>
        <Select.Icon>
          <Icon.Variant
            variant={open ? 'chevronup' : 'chevrondown'}
            className={`${CONCEPT_STATUS_MAP[selectedStatusColor].stroke}`}
          />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          className='min-w-32 rounded-md bg-white p-1 shadow will-change-[transform,opacity] '
          position='popper'
        >
          <Select.Viewport className='flex h-full w-full flex-col justify-start gap-2 px-4 py-2'>
            {CONCEPT_STATUS_LIST.map((item) => {
              const itemStyles = CONCEPT_STATUS_MAP[getConceptStatusColor(item)];

              return (
                // Change highlight color example: data-[highlighted]:outline-gray-300
                <Select.Item
                  value={item}
                  className={`flex h-8 select-none flex-row items-center justify-between gap-2 self-stretch rounded-sm px-4 py-2 text-base leading-none ${itemStyles.text} ${itemStyles.bg}`}
                >
                  <Select.ItemText>{camelCaseToTitleCase(item)}</Select.ItemText>
                  <Select.ItemIndicator>
                    <div className={`h-1.5 w-1.5 ${itemStyles.bullet} rounded-full`} />
                  </Select.ItemIndicator>
                </Select.Item>
              );
            })}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};

const CONCEPT_STATUS_MAP: Record<ConceptStatusColor, { bg: string; bullet: string; text: string; stroke: string }> = {
  blue: {
    bg: 'bg-[#f8f9fc]',
    bullet: 'bg-[#4e5ba6]',
    text: 'text-[#4e5ba6]',
    stroke: 'stroke-[#4e5ba6]',
  },
  green: {
    bg: 'bg-success-50',
    bullet: 'bg-success-500',
    text: 'text-success-500',
    stroke: 'stroke-success-500',
  },
  purple: {
    bg: 'bg-primary-25',
    bullet: 'bg-primary-500',
    text: 'text-primary-500',
    stroke: 'stroke-primary-500',
  },
  pink: {
    bg: 'bg-[#fdf2fa]',
    bullet: 'bg-[#ee46bc]',
    text: 'text-[#ee46bc]',
    stroke: 'stroke-[#ee46bc]',
  },
  red: {
    bg: 'bg-error-50',
    bullet: 'bg-error-500',
    text: 'text-error-500',
    stroke: 'stroke-error-500',
  },
};

export default ConceptStatusSelect;
