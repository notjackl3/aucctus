import { Icon } from '@components';
import { cn } from '@libs/utils/react';
import {
  CustomCommandFlowStep,
  ICustomCommandFlow,
} from '@stores/overseer/types';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useRef, useEffect } from 'react';

interface CustomCommandCreationFlowProps {
  flow: ICustomCommandFlow;
  currentMessage: string;
  onMessageChange: (value: string) => void;
  onSubmitStep: (value: string) => void;
  onGoBack: () => void;
  onCancel: () => void;
  onToggleTool: (tool: 'webSearch' | 'nucleusSearch') => void;
  onConfirm: () => void;
  onEditField: (step: CustomCommandFlowStep) => void;
}

/**
 * Question configuration for each step
 */
const STEP_CONFIG: Record<
  CustomCommandFlowStep,
  {
    question: string;
    placeholder: string;
    helpText?: string;
  }
> = {
  name: {
    question: "Let's create a custom command! What would you like to name it?",
    placeholder: 'e.g., my-command',
    helpText: 'Use lowercase letters, numbers, and hyphens. 3-32 characters.',
  },
  label: {
    question: 'Great! Now give it a display label that users will see.',
    placeholder: 'e.g., My Custom Command',
    helpText: 'This appears in the command picker dropdown.',
  },
  description: {
    question: 'Add a short description explaining what this command does.',
    placeholder: 'e.g., Analyzes market trends and provides insights...',
    helpText: 'At least 10 characters. Shown in the command picker.',
  },
  promptModifier: {
    question:
      'Now, write the instructions that tell me how to behave when this command is used.',
    placeholder:
      'When this command is invoked, you should focus on... You must always...',
    helpText: 'Be specific! Max 2000 characters.',
  },
  tools: {
    question: 'Would you like to enable any tools for this command?',
    placeholder: '',
    helpText: 'These tools give the command additional capabilities.',
  },
  confirm: {
    question: "Perfect! Here's a summary of your custom command:",
    placeholder: '',
  },
};

/**
 * Get step number for progress
 */
const STEP_ORDER: CustomCommandFlowStep[] = [
  'name',
  'label',
  'description',
  'promptModifier',
  'tools',
  'confirm',
];

/**
 * Conversational flow for creating custom commands
 */
const CustomCommandCreationFlow: React.FC<CustomCommandCreationFlowProps> = ({
  flow,
  currentMessage,
  onMessageChange,
  onSubmitStep,
  onGoBack,
  onCancel,
  onToggleTool,
  onConfirm,
  onEditField,
}) => {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { currentStep, data, error, isSubmitting } = flow;
  const stepConfig = STEP_CONFIG[currentStep];
  const currentStepIndex = STEP_ORDER.indexOf(currentStep);
  const totalSteps = STEP_ORDER.length;

  // Auto-scroll to bottom when step changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentStep]);

  // Focus input when step changes
  useEffect(() => {
    if (
      inputRef.current &&
      currentStep !== 'tools' &&
      currentStep !== 'confirm'
    ) {
      inputRef.current.focus();
    }
  }, [currentStep]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (currentStep === 'promptModifier') {
        // For textarea, allow shift+enter for newlines
        return;
      }
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (currentStep === 'tools') {
      onSubmitStep(''); // Just advance
    } else if (currentStep === 'confirm') {
      onConfirm();
    } else {
      onSubmitStep(currentMessage);
    }
  };

  const renderCompletedAnswers = () => {
    const completedSteps = STEP_ORDER.slice(0, currentStepIndex);

    return completedSteps.map((step) => {
      let value = '';
      let label = '';

      switch (step) {
        case 'name':
          value = data.name ? `/${data.name}` : '';
          label = 'Command Name';
          break;
        case 'label':
          value = data.label;
          label = 'Display Label';
          break;
        case 'description':
          value = data.description;
          label = 'Description';
          break;
        case 'promptModifier':
          value =
            data.promptModifier.length > 100
              ? data.promptModifier.substring(0, 100) + '...'
              : data.promptModifier;
          label = 'Prompt Instructions';
          break;
        case 'tools':
          const tools = [];
          if (data.enableWebSearch) tools.push('Web Search');
          if (data.enableNucleusSearch) tools.push('Nucleus Search');
          value = tools.length > 0 ? tools.join(', ') : 'None';
          label = 'Tools';
          break;
      }

      if (!value && step !== 'tools') return null;

      return (
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-3'
        >
          {/* User's answer */}
          <div className='flex justify-end'>
            <div className='max-w-[85%] rounded-lg rounded-br-sm bg-white/10 px-3 py-2'>
              <p className='text-xs text-white/50'>{label}</p>
              <p className='text-sm text-white'>{value}</p>
            </div>
          </div>
          {/* Edit button */}
          {currentStep !== 'confirm' && (
            <div className='mt-1 flex justify-end'>
              <button
                onClick={() => onEditField(step)}
                className='text-xs text-white/40 hover:text-white/70'
              >
                Edit
              </button>
            </div>
          )}
        </motion.div>
      );
    });
  };

  const renderToolsSelection = () => (
    <div className='mt-4 space-y-3'>
      <button
        type='button'
        onClick={() => onToggleTool('webSearch')}
        aria-pressed={data.enableWebSearch}
        className={cn(
          'flex w-full items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 text-left transition-all duration-200 hover:bg-white/10',
          'ring-2 ring-offset-2 ring-offset-transparent',
          data.enableWebSearch
            ? 'ring-primary-500'
            : 'opacity-80 ring-transparent hover:opacity-100',
        )}
      >
        <div className='flex items-center gap-2'>
          <Icon
            variant='globe'
            width={16}
            height={16}
            className='stroke-white/70'
          />
          <div>
            <span className='text-sm font-medium text-white'>Web Search</span>
            <p className='text-xs text-white/50'>
              Allow searching the web for information
            </p>
          </div>
        </div>
      </button>

      <button
        type='button'
        onClick={() => onToggleTool('nucleusSearch')}
        aria-pressed={data.enableNucleusSearch}
        className={cn(
          'flex w-full items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 text-left transition-all duration-200 hover:bg-white/10',
          'ring-2 ring-offset-2 ring-offset-transparent',
          data.enableNucleusSearch
            ? 'ring-primary-500'
            : 'opacity-80 ring-transparent hover:opacity-100',
        )}
      >
        <div className='flex items-center gap-2'>
          <Icon
            variant='compass-03'
            width={16}
            height={16}
            className='stroke-white/70'
          />
          <div>
            <span className='text-sm font-medium text-white'>
              Nucleus Knowledge Search
            </span>
            <p className='text-xs text-white/50'>
              Search your company&apos;s knowledge base
            </p>
          </div>
        </div>
      </button>

      <button
        onClick={() => onSubmitStep('')}
        className='btn btn-primary btn-sm mt-2 w-full'
      >
        Continue
      </button>
    </div>
  );

  const renderConfirmationSummary = () => (
    <div className='mt-4 space-y-4'>
      {/* Summary */}
      <div className='rounded-lg border border-white/10 bg-white/5 p-4'>
        <div className='space-y-3'>
          <div>
            <p className='text-xs text-white/50'>Command</p>
            <p className='font-mono text-sm text-white'>/{data.name}</p>
          </div>
          <div>
            <p className='text-xs text-white/50'>Label</p>
            <p className='text-sm text-white'>{data.label}</p>
          </div>
          <div>
            <p className='text-xs text-white/50'>Description</p>
            <p className='text-sm text-white'>{data.description}</p>
          </div>
          <div>
            <p className='text-xs text-white/50'>Prompt Instructions</p>
            <p className='whitespace-pre-wrap text-sm text-white/80'>
              {data.promptModifier.length > 200
                ? data.promptModifier.substring(0, 200) + '...'
                : data.promptModifier}
            </p>
          </div>
          <div>
            <p className='text-xs text-white/50'>Tools</p>
            <div className='flex gap-2'>
              {data.enableWebSearch && (
                <span className='rounded bg-white/10 px-2 py-0.5 text-xs text-white/80'>
                  Web Search
                </span>
              )}
              {data.enableNucleusSearch && (
                <span className='rounded bg-white/10 px-2 py-0.5 text-xs text-white/80'>
                  Nucleus
                </span>
              )}
              {!data.enableWebSearch && !data.enableNucleusSearch && (
                <span className='text-xs text-white/50'>None</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className='rounded-lg border border-red-500/30 bg-red-900/20 p-3'>
          <p className='text-xs text-red-400'>{error}</p>
        </div>
      )}

      <div className='flex gap-2'>
        <button
          onClick={onGoBack}
          className='btn btn-secondary btn-sm flex-1'
          disabled={isSubmitting}
        >
          Go Back
        </button>
        <button
          onClick={onConfirm}
          className='btn btn-primary btn-sm flex-1'
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Icon
                variant='loading-02'
                width={14}
                height={14}
                className='mr-2 animate-spin stroke-white'
              />
              Creating...
            </>
          ) : (
            'Create Command'
          )}
        </button>
      </div>
    </div>
  );

  const renderCurrentQuestion = () => {
    return (
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className='mb-4'
      >
        {/* Overseer's question */}
        <div className='flex gap-2'>
          <div className='flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white/10'>
            <Icon
              variant='sparkles'
              width={14}
              height={14}
              className='stroke-white/80'
            />
          </div>
          <div className='flex-1'>
            <p className='text-sm text-white'>{stepConfig.question}</p>
            {stepConfig.helpText && (
              <p className='mt-1 text-xs text-white/50'>
                {stepConfig.helpText}
              </p>
            )}

            {currentStep === 'tools' && renderToolsSelection()}
            {currentStep === 'confirm' && renderConfirmationSummary()}
          </div>
        </div>
      </motion.div>
    );
  };

  const renderInput = () => {
    // Text input or textarea for other steps
    const isTextArea = currentStep === 'promptModifier';

    return (
      <div className='space-y-2'>
        {error && currentStep !== 'confirm' && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className='text-xs text-red-400'
          >
            {error}
          </motion.p>
        )}
        <div className='relative'>
          {currentStep === 'name' && (
            <span className='absolute left-3 top-1/2 -translate-y-1/2 text-white/50'>
              /
            </span>
          )}
          {isTextArea ? (
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={currentMessage}
              onChange={(e) => onMessageChange(e.target.value)}
              placeholder={stepConfig.placeholder}
              rows={4}
              className={cn(
                'w-full resize-none rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white',
                'placeholder:text-white/30 focus:border-white/40 focus:outline-none',
              )}
            />
          ) : (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type='text'
              value={currentMessage}
              onChange={(e) =>
                onMessageChange(
                  currentStep === 'name'
                    ? e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                    : e.target.value,
                )
              }
              onKeyDown={handleKeyDown}
              placeholder={stepConfig.placeholder}
              disabled={isSubmitting}
              className={cn(
                'w-full rounded-lg border border-white/20 bg-white/5 py-2 pr-3 text-sm text-white',
                'placeholder:text-white/30 focus:border-white/40 focus:outline-none',
                currentStep === 'name' ? 'pl-7' : 'pl-3',
              )}
            />
          )}
          <button
            onClick={handleSubmit}
            disabled={!currentMessage.trim() || isSubmitting}
            className={cn(
              'absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded-md transition-all',
              currentMessage.trim()
                ? 'bg-white text-black hover:bg-white/90'
                : 'bg-white/10 text-white/30',
            )}
          >
            <Icon
              variant='arrowup'
              width={12}
              height={12}
              className={
                currentMessage.trim() ? 'stroke-black' : 'stroke-white/30'
              }
            />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className='flex h-full min-h-0 flex-col'>
      {/* Header with progress */}
      <div className='flex items-center justify-between border-b border-white/10 px-4 py-2'>
        <div className='flex items-center gap-2'>
          <button
            onClick={onCancel}
            className='flex h-7 w-7 items-center justify-center rounded-md text-white/50 transition-colors hover:bg-white/10 hover:text-white'
          >
            <Icon variant='closeX' width={14} height={14} />
          </button>
          <span className='text-sm font-medium text-white'>
            Create Custom Command
          </span>
        </div>
        <div className='flex items-center gap-2'>
          <span className='text-xs text-white/50'>
            Step {currentStepIndex + 1} of {totalSteps}
          </span>
          <div className='flex gap-1'>
            {STEP_ORDER.map((step, index) => (
              <div
                key={step}
                className={cn(
                  'h-1.5 w-4 rounded-full transition-colors',
                  index <= currentStepIndex ? 'bg-primary-500' : 'bg-white/20',
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Conversation area */}
      <div
        ref={scrollRef}
        className='no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-4'
      >
        <AnimatePresence mode='wait'>
          {renderCompletedAnswers()}
          {renderCurrentQuestion()}
        </AnimatePresence>
      </div>

      {/* Input area */}
      <div className='border-t border-white/10 px-4 py-3'>
        {renderInput()}
        {currentStep !== 'confirm' && (
          <button
            onClick={currentStepIndex === 0 ? onCancel : onGoBack}
            className='mt-2 text-xs text-white/40 hover:text-white/70'
          >
            ← Go back
          </button>
        )}
      </div>
    </div>
  );
};

export default CustomCommandCreationFlow;
