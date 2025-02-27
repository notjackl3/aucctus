import { Icon } from '@components';
import { ConceptStatus } from '@libs/api/types';
import utils from '@libs/utils';
import {
  CONCEPT_STATUS_LIST,
  getConceptStatusStyles,
} from '@libs/utils/concepts';
import * as Select from '@radix-ui/react-select';
import React from 'react';

interface DropdownMenuProps {
  value: ConceptStatus;
  onChange: (value: string) => void;
}

const ConceptStatusSelect: React.FC<DropdownMenuProps> = ({
  value,
  onChange,
}) => {
  const [open, setOpen] = React.useState(false);

  const onChangeEvent = React.useCallback(
    (status: string) => {
      onChange(status);
    },
    [onChange],
  );

  const style = React.useMemo(() => getConceptStatusStyles(value), [value]);

  return (
    <Select.Root
      value={value}
      onValueChange={onChangeEvent}
      open={open}
      onOpenChange={setOpen}
    >
      <Select.Trigger
        className={`inline-flex min-h-8 min-w-32 items-center justify-center gap-2 text-nowrap rounded-md px-2.5 py-1.5 mix-blend-multiply shadow ${style.bg}`}
      >
        <Select.Icon>
          <div className={`0 h-1.5 w-1.5 rounded-full ${style.bullet}`} />
        </Select.Icon>
        <Select.Value className={`flex flex-row gap-4`}>
          <span className={`${style.text}`}>
            {utils.string.camelCaseToTitleCase(value)}
          </span>
        </Select.Value>
        <Select.Icon asChild>
          <Icon.RotatingIcon isUp={open} className={`${style.stroke}`} />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          className='aucctus-bg-primary min-w-32 rounded-md p-1 shadow will-change-[transform,opacity] '
          position='popper'
        >
          <Select.Viewport className='flex h-full w-full flex-col justify-start gap-2 px-4 py-2'>
            {CONCEPT_STATUS_LIST.map((item) => {
              const itemStyles = getConceptStatusStyles(item);

              return (
                // Change highlight color example: data-[highlighted]:outline-gray-300
                <Select.Item
                  key={item}
                  value={item}
                  className={`flex h-8 select-none flex-row items-center justify-between gap-2 self-stretch rounded-sm px-4 py-2 text-base leading-none ${itemStyles.text} ${itemStyles.bg}`}
                >
                  <Select.ItemText>
                    {utils.string.camelCaseToTitleCase(item)}
                  </Select.ItemText>
                  <Select.ItemIndicator>
                    <div
                      className={`h-1.5 w-1.5 ${itemStyles.bullet} rounded-full`}
                    />
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

export default ConceptStatusSelect;
