import { Icon } from '@components';
import { AssumptionTestStatus } from '@libs/api/types';
import utils from '@libs/utils';
import {
  TESTING_STATUS_STYLE_MAP,
  VALIDATION_STATUS,
} from '@libs/utils/concepts';
// import { CONCEPT_STATUS_LIST, getConceptStatusStyles } from '@libs/utils/concepts';
import * as Select from '@radix-ui/react-select';
import classNames from 'classnames';
import React from 'react';

interface TestingStatusSelectProps {
  value: AssumptionTestStatus;
  onChange: (value: string) => void;
}

const TestingStatusSelect: React.FC<TestingStatusSelectProps> = ({
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

  const style = TESTING_STATUS_STYLE_MAP[value];

  return (
    <Select.Root
      value={value}
      onValueChange={onChangeEvent}
      open={open}
      onOpenChange={setOpen}
    >
      <Select.Trigger
        className={`inline-flex min-h-8 min-w-32 items-center justify-center gap-2 rounded-md px-2.5 py-1.5 mix-blend-multiply shadow ${style.bg}`}
      >
        <Select.Icon>
          <Icon variant={style.icon} />
        </Select.Icon>
        <Select.Value className={`flex flex-row gap-4`}>
          <span className={`${style.text}`}>
            {utils.string.camelCaseToTitleCase(value)}
          </span>
        </Select.Value>
        <Select.Icon>
          <Icon
            variant={open ? 'chevronup' : 'chevrondown'}
            className={`${style.stroke}`}
          />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          className='min-w-32 rounded-md bg-white p-1 shadow will-change-[transform,opacity] '
          position='popper'
        >
          <Select.Viewport className='flex h-full w-full flex-col justify-start gap-2 px-4 py-2'>
            {VALIDATION_STATUS.map((item) => (
              <Select.Item
                key={`${utils.string.generateRandomString(3)}-${item}`}
                value={item}
                className={classNames(
                  'flex h-8 select-none items-center justify-start gap-2 self-stretch rounded-sm px-4 py-2 text-base leading-none',
                  TESTING_STATUS_STYLE_MAP[item].text,
                )}
              >
                <Icon
                  variant={TESTING_STATUS_STYLE_MAP[item].icon}
                  className={TESTING_STATUS_STYLE_MAP[item].stroke}
                />
                <Select.ItemText
                  className={classNames('inline-flex w-full gap-2', style.text)}
                >
                  {utils.string.camelCaseToTitleCase(item)}
                </Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};

export default TestingStatusSelect;
