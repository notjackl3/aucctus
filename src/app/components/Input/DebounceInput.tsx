import React from 'react';

interface DebouncedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  debounce?: number;
}

const DebouncedInput: React.FC<DebouncedInputProps> = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
  const [value, setValue] = React.useState(initialValue);

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (onChange) {
        const event = {
          target: {
            value: value,
          },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(event);
      }
    }, debounce);

    return () => {
      clearTimeout(handler);
    };
  }, [value, debounce, onChange]);

  return <input {...props} value={value} onChange={(e) => setValue(e.target.value)} />;
};

export default DebouncedInput;
