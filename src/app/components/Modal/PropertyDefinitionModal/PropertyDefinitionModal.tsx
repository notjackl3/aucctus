import { Icon, Input } from '@components';
import {
  IPropertyDefinition,
  PropertyType,
  IPropertyConfig,
  IPropertyOption,
} from '@libs/api/types';
import { cn } from '@libs/utils/react';
import React, { useEffect, useState, useRef } from 'react';
import { normalizePropertyOptions } from '@libs/utils/propertyColors';
import { getPropertyTypeIcon } from '@libs/utils/propertyIcons';
import { IconPickerDropdown } from '@components/Dropdown';

// Softer color palette from Tailwind config (non-branded colors)
// Each color has background, text (foreground), and border colors for proper contrast
const COLOR_PALETTE = [
  {
    name: 'Gray',
    bg: '#F5F3F3', // gray.light.50 - Default
    text: '#514141', // gray.light.700
    border: '#DAD5D5', // gray.light.300
  },
  {
    name: 'Red',
    bg: '#FEF3F2', // error.50
    text: '#C1051C', // error.700
    border: '#FECDCA', // error.200
  },
  {
    name: 'Orange',
    bg: '#FEF6EE', // orange.50
    text: '#B93815', // orange.700
    border: '#F9DBAF', // orange.200
  },
  {
    name: 'Amber',
    bg: '#FFFAEB', // warning.50
    text: '#B54708', // warning.700
    border: '#FEDF89', // warning.200
  },
  {
    name: 'Green',
    bg: '#ECFDF3', // success.50
    text: '#067647', // success.700
    border: '#ABEFC6', // success.200
  },
  {
    name: 'Teal',
    bg: '#F0F9FF', // blueLight.50
    text: '#026AA2', // blueLight.700
    border: '#B9E6FE', // blueLight.200
  },
  {
    name: 'Blue',
    bg: '#EFF8FF', // blue.50
    text: '#175CD3', // blue.700
    border: '#B2DDFF', // blue.200
  },
  {
    name: 'Indigo',
    bg: '#EEF4FF', // indigo.50
    text: '#3538CD', // indigo.700
    border: '#C7D7FE', // indigo.200
  },
  {
    name: 'Purple',
    bg: '#F4F3FF', // purple.50
    text: '#5925DC', // purple.700
    border: '#D9D6FE', // purple.200
  },
  {
    name: 'Pink',
    bg: '#FDF2FA', // pink.50
    text: '#C11574', // pink.700
    border: '#FCCEEE', // pink.200
  },
];

interface IPropertyDefinitionModalProps {
  existingProperty?: IPropertyDefinition;
  onSave: (data: IPropertyFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface IPropertyFormData {
  name: string;
  key: string; // Auto-generated from name, not shown to user
  property_type: PropertyType;
  description?: string;
  is_required: boolean;
  default_value?: any;
  config: IPropertyConfig;
  icon?: string;
}

const PropertyDefinitionModal: React.FC<IPropertyDefinitionModalProps> = ({
  existingProperty,
  onSave,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<IPropertyFormData>({
    name: existingProperty?.name || '',
    key: existingProperty?.key || '',
    property_type: existingProperty?.propertyType || 'text',
    description: existingProperty?.description || '',
    is_required: existingProperty?.isRequired || false,
    default_value: existingProperty?.defaultValue,
    config: existingProperty?.config || {},
    icon: existingProperty?.icon,
  });

  // Normalize options to IPropertyOption[] format (handles both string[] and IPropertyOption[] formats)
  const [selectOptions, setSelectOptions] = useState<IPropertyOption[]>(
    normalizePropertyOptions(existingProperty?.config?.options),
  );
  const [newOption, setNewOption] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [colorPickerOpen, setColorPickerOpen] = useState<string | null>(null); // Track which option's color picker is open
  const [shakeField, setShakeField] = useState<string | null>(null);

  // Refs for scrolling to error fields
  const nameRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const rangeRef = useRef<HTMLDivElement>(null);

  // Auto-generate key from name (always, even when name changes)
  useEffect(() => {
    if (!existingProperty && formData.name) {
      const generatedKey = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
      setFormData((prev) => ({ ...prev, key: generatedKey }));
    }
  }, [formData.name, existingProperty]);

  // Close color picker when clicking outside
  useEffect(() => {
    if (!colorPickerOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.color-picker-container')) {
        setColorPickerOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [colorPickerOpen]);

  // Update config when selectOptions change
  useEffect(() => {
    if (
      formData.property_type === 'select' ||
      formData.property_type === 'multi_select'
    ) {
      setFormData((prev) => ({
        ...prev,
        config: { ...prev.config, options: selectOptions },
      }));
    }
  }, [selectOptions, formData.property_type]);

  const handleTypeChange = (type: PropertyType) => {
    setFormData((prev) => ({
      ...prev,
      property_type: type,
      config: {},
      default_value: undefined,
      // Reset icon to default for new type
      icon: getPropertyTypeIcon(type),
    }));
    setSelectOptions([]);
  };

  const handleIconSelect = (icon: string) => {
    setFormData((prev) => ({ ...prev, icon }));
  };

  const handleAddOption = () => {
    const trimmedValue = newOption.trim();
    if (
      trimmedValue &&
      !selectOptions.some((opt) => opt.value === trimmedValue)
    ) {
      // Assign default color from palette based on current index
      // Default is #F5F3F3 (gray) for first option
      const colorIndex = selectOptions.length % COLOR_PALETTE.length;
      const defaultColor = COLOR_PALETTE[colorIndex].bg;

      setSelectOptions([
        ...selectOptions,
        { value: trimmedValue, color: defaultColor },
      ]);
      setNewOption('');
    }
  };

  const handleRemoveOption = (optionValue: string) => {
    setSelectOptions(selectOptions.filter((opt) => opt.value !== optionValue));
  };

  const handleColorChange = (optionValue: string, newColor: string) => {
    setSelectOptions(
      selectOptions.map((opt) =>
        opt.value === optionValue ? { ...opt, color: newColor } : opt,
      ),
    );
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Property name is required';
    }

    // Key is auto-generated, but still validate it exists
    if (!formData.key.trim()) {
      newErrors.name =
        'Property name must contain at least one alphanumeric character';
    }

    if (
      (formData.property_type === 'select' ||
        formData.property_type === 'multi_select') &&
      selectOptions.length === 0
    ) {
      newErrors.options =
        'At least one option is required for select/multi-select type';
    }

    if (
      formData.property_type === 'number' &&
      formData.config.min !== undefined &&
      formData.config.max !== undefined &&
      formData.config.min > formData.config.max
    ) {
      newErrors.range = 'Minimum value cannot be greater than maximum value';
    }

    setErrors(newErrors);

    // Scroll to first error and shake it
    if (Object.keys(newErrors).length > 0) {
      const firstErrorKey = Object.keys(newErrors)[0];
      let targetRef: React.RefObject<HTMLDivElement> | null = null;

      if (firstErrorKey === 'name') targetRef = nameRef;
      else if (firstErrorKey === 'options') targetRef = optionsRef;
      else if (firstErrorKey === 'range') targetRef = rangeRef;

      if (targetRef?.current) {
        targetRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
        setShakeField(firstErrorKey);
        setTimeout(() => setShakeField(null), 500);
      }
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <div
      className='aucctus-bg-primary relative flex w-full max-w-2xl flex-col rounded-md shadow-xl'
      style={{ minWidth: '500px' }}
    >
      {/* Loading Overlay */}
      {isLoading && (
        <div className='absolute inset-0 z-50 flex items-center justify-center rounded-lg bg-black/30 backdrop-blur-sm'>
          <div className='aucctus-bg-primary flex flex-col items-center gap-3 rounded-lg px-8 py-6 shadow-xl'>
            <Icon
              variant='loading-02'
              className='aucctus-stroke-brand-primary h-8 w-8 animate-spin'
            />
            <p className='aucctus-text-sm-medium aucctus-text-secondary'>
              {existingProperty
                ? 'Updating property...'
                : 'Creating property...'}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className='aucctus-border-secondary flex items-center justify-between border-b px-6 py-4'>
        <h2 className='aucctus-text-lg-semibold aucctus-text-primary'>
          {existingProperty ? 'Edit Property' : 'Create New Property'}
        </h2>
        <button
          onClick={onCancel}
          className='aucctus-bg-secondary-hover rounded-full p-2 transition-colors'
          disabled={isLoading}
        >
          <Icon variant='closeX' className='aucctus-stroke-secondary h-5 w-5' />
        </button>
      </div>

      {/* Content */}
      <div className='max-h-[70vh] space-y-6 overflow-y-auto px-6 py-4'>
        {/* Property Name with Icon */}
        <div
          ref={nameRef}
          className={cn('space-y-2', shakeField === 'name' && 'animate-shake')}
          style={{
            animation: shakeField === 'name' ? 'shake 0.5s' : undefined,
          }}
        >
          <label className='aucctus-text-sm-medium aucctus-text-secondary block'>
            Property Name <span className='aucctus-text-error-primary'>*</span>
          </label>
          <div className='flex items-center gap-2'>
            {/* Icon Selector */}
            <IconPickerDropdown
              currentIcon={
                formData.icon || getPropertyTypeIcon(formData.property_type)
              }
              onSelect={handleIconSelect}
              trigger={
                <button
                  type='button'
                  disabled={isLoading}
                  className='aucctus-bg-secondary aucctus-border-secondary hover:aucctus-bg-secondary-hover flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border transition-all disabled:cursor-not-allowed disabled:opacity-50'
                >
                  <Icon
                    variant={
                      (formData.icon ||
                        getPropertyTypeIcon(
                          formData.property_type,
                        )) as IconVariant
                    }
                    className='aucctus-stroke-secondary h-5 w-5'
                  />
                </button>
              }
            />
            {/* Property Name Input - Flexes to fill remaining space */}
            <div className='flex-1'>
              <Input.Field
                name='propertyName'
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder='e.g., Priority, Status, Budget'
                disabled={isLoading}
                className={cn(errors.name && 'aucctus-border-error')}
              />
            </div>
          </div>
          {errors.name && (
            <p className='aucctus-text-xs aucctus-text-error-primary'>
              {errors.name}
            </p>
          )}
        </div>

        {/* Property Type (disabled for existing) */}
        <div className='space-y-2'>
          <label className='aucctus-text-sm-medium aucctus-text-secondary block'>
            Property Type <span className='aucctus-text-error-primary'>*</span>
          </label>
          <div className='grid grid-cols-2 gap-3'>
            {(
              [
                'text',
                'number',
                'select',
                'multi_select',
                'checkbox',
              ] as PropertyType[]
            ).map((type) => (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
                disabled={isLoading || !!existingProperty}
                className={cn(
                  'aucctus-border-secondary flex items-center gap-3 rounded-lg border p-3 transition-all',
                  formData.property_type === type
                    ? 'aucctus-bg-brand-primary aucctus-border-brand'
                    : 'aucctus-bg-secondary hover:aucctus-bg-secondary-hover',
                  (isLoading || !!existingProperty) &&
                    'cursor-not-allowed opacity-50',
                )}
              >
                <Icon
                  variant={
                    type === 'text'
                      ? 'file'
                      : type === 'number'
                        ? 'barchart'
                        : type === 'select'
                          ? 'list'
                          : type === 'multi_select'
                            ? 'columns'
                            : 'check-circle-broken'
                  }
                  className={cn(
                    'h-5 w-5',
                    formData.property_type === type
                      ? 'aucctus-stroke-brand-primary'
                      : 'aucctus-stroke-tertiary',
                  )}
                />
                <span
                  className={cn(
                    'aucctus-text-sm-medium',
                    formData.property_type === type
                      ? 'aucctus-text-brand-primary'
                      : 'aucctus-text-secondary',
                  )}
                >
                  {type === 'multi_select'
                    ? 'Multi-Select'
                    : type.charAt(0).toUpperCase() + type.slice(1)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Type-specific configuration */}
        {(formData.property_type === 'select' ||
          formData.property_type === 'multi_select') && (
          <div
            ref={optionsRef}
            className={cn(
              'space-y-2',
              shakeField === 'options' && 'animate-shake',
            )}
            style={{
              animation: shakeField === 'options' ? 'shake 0.5s' : undefined,
            }}
          >
            <label className='aucctus-text-sm-medium aucctus-text-secondary block'>
              Options <span className='aucctus-text-error-primary'>*</span>
            </label>
            <div className='flex gap-2'>
              <Input.Field
                name='newOption'
                value={newOption}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewOption(e.target.value)
                }
                placeholder='Add option...'
                onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  const trimmedValue = newOption.trim();
                  const isDuplicate = selectOptions.some(
                    (opt) => opt.value === trimmedValue,
                  );
                  if (e.key === 'Enter' && trimmedValue && !isDuplicate) {
                    e.preventDefault();
                    handleAddOption();
                  }
                }}
                disabled={isLoading}
              />
              <button
                onClick={handleAddOption}
                disabled={
                  !newOption.trim() ||
                  isLoading ||
                  selectOptions.some((opt) => opt.value === newOption.trim())
                }
                className={cn(
                  'btn btn-secondary',
                  (!newOption.trim() ||
                    selectOptions.some(
                      (opt) => opt.value === newOption.trim(),
                    )) &&
                    'cursor-not-allowed opacity-50',
                )}
                title={
                  !newOption.trim()
                    ? 'Enter at least one character'
                    : selectOptions.some(
                          (opt) => opt.value === newOption.trim(),
                        )
                      ? 'This option already exists'
                      : 'Add option'
                }
              >
                <Icon
                  variant='plus'
                  className='aucctus-stroke-secondary h-4 w-4'
                />
              </button>
            </div>
            <div className='relative max-h-[500px] space-y-3 overflow-y-auto'>
              {selectOptions.map((option) => {
                // Find the color scheme from palette
                const colorScheme =
                  COLOR_PALETTE.find((c) => c.bg === option.color) ||
                  COLOR_PALETTE[0];
                const isPickerOpen = colorPickerOpen === option.value;

                return (
                  <div
                    key={option.value}
                    className='aucctus-bg-secondary aucctus-border-secondary flex items-center gap-3 rounded-lg border p-3'
                  >
                    {/* Color preview and picker */}
                    <div className='color-picker-container relative'>
                      <button
                        type='button'
                        onClick={() =>
                          setColorPickerOpen(isPickerOpen ? null : option.value)
                        }
                        disabled={isLoading}
                        className='h-8 w-8 flex-shrink-0 cursor-pointer rounded-full border-2 shadow-sm transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50'
                        style={{
                          backgroundColor: colorScheme.bg,
                          borderColor: colorScheme.border,
                        }}
                        title='Click to change color'
                      />

                      {/* Color picker popup - 3x3 grid with fixed positioning */}
                      {isPickerOpen && (
                        <>
                          {/* Backdrop */}
                          <div
                            className='fixed inset-0 z-[99] bg-black/20'
                            onClick={() => setColorPickerOpen(null)}
                          />

                          {/* Color picker */}
                          <div
                            className='aucctus-bg-primary aucctus-border-secondary fixed z-[100] rounded-lg border p-4 shadow-2xl'
                            style={{
                              left: '50%',
                              top: '50%',
                              transform: 'translate(-50%, -50%)',
                            }}
                          >
                            <div className='grid grid-cols-3 gap-2.5'>
                              {COLOR_PALETTE.map((color) => {
                                const isSelected = color.bg === option.color;
                                return (
                                  <button
                                    key={color.bg}
                                    type='button'
                                    onClick={() => {
                                      handleColorChange(option.value, color.bg);
                                      setColorPickerOpen(null);
                                    }}
                                    className={cn(
                                      'h-10 w-10 flex-shrink-0 rounded-full border-2 transition-all hover:scale-110',
                                      isSelected
                                        ? 'ring-2 ring-blue-500 ring-offset-2'
                                        : '',
                                    )}
                                    style={{
                                      backgroundColor: color.bg,
                                      borderColor: color.border,
                                    }}
                                    title={color.name}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Option value with colored background and border */}
                    <div
                      className='flex-1 rounded-full border px-3 py-1'
                      style={{
                        backgroundColor: colorScheme.bg,
                        color: colorScheme.text,
                        borderColor: colorScheme.border,
                      }}
                    >
                      <span className='aucctus-text-sm font-medium'>
                        {option.value}
                      </span>
                    </div>

                    {/* Remove button */}
                    <button
                      type='button'
                      onClick={() => handleRemoveOption(option.value)}
                      disabled={isLoading}
                      className='aucctus-bg-error-subtle hover:aucctus-bg-error-secondary flex-shrink-0 rounded-full p-1.5 transition-colors'
                      title='Remove option'
                    >
                      <Icon
                        variant='closeX'
                        className='aucctus-stroke-error-primary h-4 w-4'
                      />
                    </button>
                  </div>
                );
              })}
            </div>
            {errors.options && (
              <p className='aucctus-text-xs aucctus-text-error-primary'>
                {errors.options}
              </p>
            )}
          </div>
        )}

        {formData.property_type === 'number' && (
          <div
            ref={rangeRef}
            className={cn(
              'grid grid-cols-2 gap-4',
              shakeField === 'range' && 'animate-shake',
            )}
            style={{
              animation: shakeField === 'range' ? 'shake 0.5s' : undefined,
            }}
          >
            <div className='space-y-2'>
              <label className='aucctus-text-sm-medium aucctus-text-secondary block'>
                Minimum Value
              </label>
              <Input.Field
                name='minValue'
                type='number'
                value={formData.config.min ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({
                    ...formData,
                    config: {
                      ...formData.config,
                      min: e.target.value
                        ? parseFloat(e.target.value)
                        : undefined,
                    },
                  })
                }
                placeholder='No minimum'
                disabled={isLoading}
              />
            </div>
            <div className='space-y-2'>
              <label className='aucctus-text-sm-medium aucctus-text-secondary block'>
                Maximum Value
              </label>
              <Input.Field
                name='maxValue'
                type='number'
                value={formData.config.max ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({
                    ...formData,
                    config: {
                      ...formData.config,
                      max: e.target.value
                        ? parseFloat(e.target.value)
                        : undefined,
                    },
                  })
                }
                placeholder='No maximum'
                disabled={isLoading}
              />
            </div>
            {errors.range && (
              <p className='aucctus-text-xs aucctus-text-error-primary col-span-2'>
                {errors.range}
              </p>
            )}
          </div>
        )}

        {/* Description */}
        <div className='space-y-2'>
          <label className='aucctus-text-sm-medium aucctus-text-secondary block'>
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder='Describe what this property is used for...'
            disabled={isLoading}
            rows={3}
            className='aucctus-bg-secondary aucctus-border-secondary aucctus-text-primary focus:aucctus-border-brand w-full rounded-lg border p-3 text-sm focus:outline-none'
          />
        </div>

        {/* Required checkbox */}
        <div className='flex items-center gap-2'>
          <Input.CheckBox
            id='is-required'
            checked={formData.is_required}
            onChange={(e) =>
              setFormData({ ...formData, is_required: e.target.checked })
            }
            disabled={isLoading}
          />
          <label
            htmlFor='is-required'
            className='aucctus-text-sm-medium aucctus-text-secondary cursor-pointer'
          >
            Required property
          </label>
        </div>
      </div>

      {/* Footer */}
      <div className='aucctus-border-secondary flex items-center justify-end gap-3 border-t px-6 py-4'>
        <button
          onClick={onCancel}
          disabled={isLoading}
          className='btn btn-secondary'
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className='btn btn-primary flex items-center gap-2'
        >
          {isLoading && (
            <Icon variant='loading-02' className='h-4 w-4 animate-spin' />
          )}
          {existingProperty ? 'Update Property' : 'Create Property'}
        </button>
      </div>
    </div>
  );
};

export default PropertyDefinitionModal;
