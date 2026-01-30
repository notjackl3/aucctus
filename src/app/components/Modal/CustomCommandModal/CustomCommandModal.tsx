import { Icon, Input } from '@components';
import {
  useCreateCustomCommand,
  useUpdateCustomCommand,
} from '@hooks/query/customCommands.hook';
import { CustomCommand, CustomCommandCreateRequest } from '@libs/api/types';
import { cn } from '@libs/utils/react';
import React, { useState, useRef, useCallback } from 'react';

// Reserved command names that cannot be used
const RESERVED_NAMES = [
  'edit',
  'web',
  'nucleus',
  'summarize',
  'help',
  'search',
  'find',
  'ask',
  'chat',
  'query',
];

interface CustomCommandModalProps {
  command?: CustomCommand;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  label: string;
  description: string;
  promptModifier: string;
  icon: string;
  enableWebSearch: boolean;
  enableNucleusSearch: boolean;
}

const CustomCommandModal: React.FC<CustomCommandModalProps> = ({
  command,
  onClose,
  onSuccess,
}) => {
  const isEditing = !!command;

  const createMutation = useCreateCustomCommand();
  const updateMutation = useUpdateCustomCommand();

  const [formData, setFormData] = useState<FormData>({
    name: command?.name || '',
    label: command?.label || '',
    description: command?.description || '',
    promptModifier: command?.promptModifier || '',
    icon: command?.icon || 'terminal',
    enableWebSearch: command?.enableWebSearch || false,
    enableNucleusSearch: command?.enableNucleusSearch || false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shakeField, setShakeField] = useState<string | null>(null);

  const nameRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const promptRef = useRef<HTMLDivElement>(null);

  // Validate command name
  const validateName = useCallback((name: string): string | null => {
    if (!name) return 'Command name is required';
    if (name.length < 3) return 'Name must be at least 3 characters';
    if (name.length > 32) return 'Name must be 32 characters or less';
    if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]{1,2}$/.test(name)) {
      return 'Only lowercase letters, numbers, and hyphens allowed';
    }
    if (name.includes('--')) return 'Cannot contain consecutive hyphens';
    if (RESERVED_NAMES.includes(name)) return `"${name}" is a reserved name`;
    return null;
  }, []);

  // Validate entire form
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    const nameError = validateName(formData.name);
    if (nameError) newErrors.name = nameError;

    if (!formData.label || formData.label.length < 2) {
      newErrors.label = 'Label must be at least 2 characters';
    }

    if (!formData.description || formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.promptModifier || formData.promptModifier.length < 10) {
      newErrors.promptModifier = 'Prompt must be at least 10 characters';
    }
    if (formData.promptModifier.length > 2000) {
      newErrors.promptModifier = 'Prompt must be 2000 characters or less';
    }

    setErrors(newErrors);

    // Scroll to first error
    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0];
      const refs: Record<string, React.RefObject<HTMLDivElement>> = {
        name: nameRef,
        label: labelRef,
        description: descriptionRef,
        promptModifier: promptRef,
      };
      refs[firstErrorField]?.current?.scrollIntoView({ behavior: 'smooth' });
      setShakeField(firstErrorField);
      setTimeout(() => setShakeField(null), 500);
    }

    return Object.keys(newErrors).length === 0;
  }, [formData, validateName]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    const payload: CustomCommandCreateRequest = {
      name: formData.name,
      label: formData.label,
      description: formData.description,
      promptModifier: formData.promptModifier,
      icon: formData.icon,
      enableWebSearch: formData.enableWebSearch,
      enableNucleusSearch: formData.enableNucleusSearch,
    };

    if (isEditing && command) {
      updateMutation.mutate(
        { commandUuid: command.uuid, data: payload },
        { onSuccess },
      );
    } else {
      createMutation.mutate(payload, { onSuccess });
    }
  }, [
    formData,
    isEditing,
    command,
    validateForm,
    createMutation,
    updateMutation,
    onSuccess,
  ]);

  const isLoading = createMutation.isLoading || updateMutation.isLoading;

  return (
    <div className='aucctus-bg-primary flex w-[560px] flex-col rounded-xl shadow-xl'>
      {/* Header */}
      <div className='aucctus-border-secondary flex items-center justify-between border-b px-6 py-4'>
        <div className='flex items-center gap-3'>
          <div className='aucctus-bg-brand-secondary flex h-10 w-10 items-center justify-center rounded-lg'>
            <Icon
              variant='filecode'
              className='aucctus-stroke-brand-primary h-5 w-5'
            />
          </div>
          <div>
            <h3 className='aucctus-text-lg-semibold aucctus-text-primary'>
              {isEditing ? 'Edit Command' : 'Create Custom Command'}
            </h3>
            <p className='aucctus-text-sm aucctus-text-tertiary'>
              {isEditing
                ? 'Update your custom Overseer command'
                : 'Create a new slash command for Overseer'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className='aucctus-text-tertiary-hover flex h-8 w-8 items-center justify-center rounded-lg'
        >
          <Icon variant='closeX' className='h-5 w-5' />
        </button>
      </div>

      {/* Form */}
      <div className='flex max-h-[70vh] flex-col gap-5 overflow-y-auto px-6 py-5'>
        {/* Command Name */}
        <div
          ref={nameRef}
          className={cn(shakeField === 'name' && 'animate-shake')}
        >
          <label className='aucctus-text-sm-medium aucctus-text-secondary mb-1.5 block'>
            Command Name <span className='aucctus-text-error-primary'>*</span>
          </label>
          <div className='relative'>
            <span className='aucctus-text-tertiary absolute left-3 top-1/2 -translate-y-1/2'>
              /
            </span>
            <Input.Field
              name='name'
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  name: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                }))
              }
              placeholder='my-command'
              className='pl-7'
              disabled={isEditing}
              error={!!errors.name}
              errorMessage={errors.name}
            />
          </div>
          <p className='aucctus-text-xs aucctus-text-tertiary mt-1'>
            Lowercase letters, numbers, and hyphens only. 3-32 characters.
          </p>
        </div>

        {/* Label */}
        <div
          ref={labelRef}
          className={cn(shakeField === 'label' && 'animate-shake')}
        >
          <label className='aucctus-text-sm-medium aucctus-text-secondary mb-1.5 block'>
            Display Label <span className='aucctus-text-error-primary'>*</span>
          </label>
          <Input.Field
            name='label'
            value={formData.label}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, label: e.target.value }))
            }
            placeholder='My Custom Command'
            error={!!errors.label}
            errorMessage={errors.label}
          />
        </div>

        {/* Description */}
        <div
          ref={descriptionRef}
          className={cn(shakeField === 'description' && 'animate-shake')}
        >
          <label className='aucctus-text-sm-medium aucctus-text-secondary mb-1.5 block'>
            Description <span className='aucctus-text-error-primary'>*</span>
          </label>
          <Input.Field
            name='description'
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder='Describe what this command does...'
            error={!!errors.description}
            errorMessage={errors.description}
          />
          <p className='aucctus-text-xs aucctus-text-tertiary mt-1'>
            Shown in the command picker. 10-256 characters.
          </p>
        </div>

        {/* Prompt Modifier */}
        <div
          ref={promptRef}
          className={cn(shakeField === 'promptModifier' && 'animate-shake')}
        >
          <label className='aucctus-text-sm-medium aucctus-text-secondary mb-1.5 block'>
            Prompt Instructions{' '}
            <span className='aucctus-text-error-primary'>*</span>
          </label>
          <textarea
            value={formData.promptModifier}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                promptModifier: e.target.value,
              }))
            }
            placeholder='When this command is invoked, you should...'
            rows={6}
            className={cn(
              'aucctus-bg-primary aucctus-border-primary aucctus-text-primary w-full resize-none rounded-lg border px-3 py-2 text-sm',
              'focus:aucctus-border-brand focus:ring-brand-500 focus:outline-none focus:ring-1',
              errors.promptModifier && 'aucctus-border-error',
            )}
          />
          {errors.promptModifier && (
            <p className='aucctus-text-xs aucctus-text-error-primary mt-1'>
              {errors.promptModifier}
            </p>
          )}
          <p className='aucctus-text-xs aucctus-text-tertiary mt-1'>
            Instructions for the AI when this command is used. Max 2000
            characters.
            <span className='ml-1'>
              ({formData.promptModifier.length}/2000)
            </span>
          </p>
        </div>

        {/* Tool Options */}
        <div className='flex flex-col gap-3'>
          <label className='aucctus-text-sm-medium aucctus-text-secondary'>
            Enable Tools
          </label>
          <div className='flex flex-col gap-2'>
            <label className='flex cursor-pointer items-center gap-3'>
              <input
                type='checkbox'
                checked={formData.enableWebSearch}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    enableWebSearch: e.target.checked,
                  }))
                }
                className='aucctus-accent-brand h-4 w-4 rounded'
              />
              <div className='flex items-center gap-2'>
                <Icon
                  variant='globe'
                  className='aucctus-stroke-tertiary h-4 w-4'
                />
                <span className='aucctus-text-sm aucctus-text-secondary'>
                  Web Search
                </span>
              </div>
            </label>
            <label className='flex cursor-pointer items-center gap-3'>
              <input
                type='checkbox'
                checked={formData.enableNucleusSearch}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    enableNucleusSearch: e.target.checked,
                  }))
                }
                className='aucctus-accent-brand h-4 w-4 rounded'
              />
              <div className='flex items-center gap-2'>
                <Icon
                  variant='compass-03'
                  className='aucctus-stroke-tertiary h-4 w-4'
                />
                <span className='aucctus-text-sm aucctus-text-secondary'>
                  Nucleus Knowledge Search
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className='aucctus-border-secondary flex items-center justify-end gap-3 border-t px-6 py-4'>
        <button onClick={onClose} className='btn btn-secondary btn-sm'>
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className='btn btn-primary btn-sm flex items-center gap-2'
        >
          {isLoading && (
            <Icon
              variant='loading-02'
              className='h-4 w-4 animate-spin stroke-white'
            />
          )}
          {isEditing ? 'Save Changes' : 'Create Command'}
        </button>
      </div>
    </div>
  );
};

export default CustomCommandModal;
