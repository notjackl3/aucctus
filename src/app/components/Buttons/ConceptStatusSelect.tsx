import React from 'react';
import * as Select from '@radix-ui/react-select';
import { Icon } from '@components';
import { CONCEPT_STATUS_LIST } from '@libs/concepts';
import { camelCaseToTitleCase } from '@libs/utils';
import { ConceptStatus } from '@libs/api/types';
import * as ScrollArea from '@radix-ui/react-scroll-area';

interface DropdownMenuProps {
  value: ConceptStatus;
  onChange: (value: string) => void;
}

const CONCEPT_STATUS_MAP: Record<ConceptStatus, { bg: string; bullet: string; text: string; stroke: string }> = {
  new: {
    bg: 'bg-[#f8f9fc]',
    bullet: 'bg-[#4e5ba6]',
    text: 'text-[#4e5ba6]',
    stroke: 'stroke-[#4e5ba6]',
  },
  ideating: {
    bg: 'bg-[#f8f9fc]',
    bullet: 'bg-[#4e5ba6]',
    text: 'text-[#4e5ba6]',
    stroke: 'stroke-[#4e5ba6]',
  },
  inReview: {
    bg: 'bg-[#f8f9fc]',
    bullet: 'bg-[#4e5ba6]',
    text: 'text-[#4e5ba6]',
    stroke: 'stroke-[#4e5ba6]',
  },
  commercialized: {
    bg: 'bg-success-50',
    bullet: 'bg-success-500',
    text: 'text-success-500',
    stroke: 'stroke-success-500',
  },
  prototyping: {
    bg: 'bg-primary-25',
    bullet: 'bg-primary-500',
    text: 'text-primary-500',
    stroke: 'stroke-primary-500',
  },
  proofOfConcept: {
    bg: 'bg-primary-25',
    bullet: 'bg-primary-500',
    text: 'text-primary-500',
    stroke: 'stroke-primary-500',
  },
  minimumViableProduct: {
    bg: 'bg-[#fdf2fa]',
    bullet: 'bg-[#ee46bc]',
    text: 'text-[#ee46bc]',
    stroke: 'stroke-[#ee46bc]',
  },
  archived: {
    bg: 'bg-error-50',
    bullet: 'bg-error-500',
    text: 'text-error-500',
    stroke: 'stroke-error-500',
  },
};

const ConceptStatusSelect: React.FC<DropdownMenuProps> = ({ value, onChange }) => {
  const [open, setOpen] = React.useState(true);

  const onChangeEvent = React.useCallback(
    (status: string) => {
      onChange(status);
    },
    [onChange],
  );

  return (
    <Select.Root value={value} onValueChange={onChangeEvent} open={open} onOpenChange={setOpen}>
      <Select.Trigger
        className={`inline-flex min-h-8 min-w-32 items-center justify-center gap-2 rounded-md px-2.5 py-1.5 mix-blend-multiply shadow ${CONCEPT_STATUS_MAP[value].bg}`}
      >
        <Select.Icon>
          <Icon.Variant
            variant={open ? 'chevronup' : 'chevrondown'}
            className={`${CONCEPT_STATUS_MAP[value].stroke}`}
          />
        </Select.Icon>
        <Select.Value className={`flex flex-row gap-4`}>
          <span className={`${CONCEPT_STATUS_MAP[value].text}`}>{camelCaseToTitleCase(value)}</span>
        </Select.Value>
        <Select.Icon>
          <div className={`0 h-1.5 w-1.5 rounded-full ${CONCEPT_STATUS_MAP[value].bullet}`} />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          className='min-w-32 rounded-md bg-white p-1 shadow will-change-[transform,opacity] '
          position='popper'
        >
          <ScrollArea.Root className='h-full w-full' type='scroll'>
            <Select.Viewport className='h-full w-full px-4 py-2'>
              {CONCEPT_STATUS_LIST.map((item) => (
                // Change highlight color example: data-[highlighted]:outline-gray-300
                <Select.Item
                  value={item}
                  className={`flex h-8 select-none items-center justify-between gap-2 self-stretch px-4 py-2 text-base leading-none ${CONCEPT_STATUS_MAP[item].text}`}
                >
                  <Select.ItemText className={`text-base leading-none ${CONCEPT_STATUS_MAP[item].text}`}>
                    {camelCaseToTitleCase(item)}
                  </Select.ItemText>
                  <Select.ItemIndicator>
                    <div className={`h-1.5 w-1.5 ${CONCEPT_STATUS_MAP[item].bullet} rounded-full`} />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
            <ScrollArea.Scrollbar className='w-1 px-[2px] py-1' orientation='vertical'>
              <ScrollArea.Thumb className='rounded-sm' />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};

export default ConceptStatusSelect;
