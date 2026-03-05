import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@libs/utils/react';
import { DynamicIcon } from '@libs/utils/iconMap';
import type { IQuestion } from '@libs/api/types/valueDiscovery';
import { MultipleChoiceInput } from './inputs/MultipleChoiceInput';
import { MultiSelectInput } from './inputs/MultiSelectInput';
import { TextInput } from './inputs/TextInput';
import { ScaleInput } from './inputs/ScaleInput';
import { ProgressBar } from './ProgressBar';

interface QuestionScreenProps {
  question: IQuestion | null;
  questionNumber: number;
  onSubmit: (answerText: string, answerSelections?: string[]) => void;
  isLoading: boolean;
}

export const QuestionScreen = ({
  question,
  questionNumber,
  onSubmit,
  isLoading,
}: QuestionScreenProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [textValue, setTextValue] = useState('');
  const [scaleValue, setScaleValue] = useState(5);

  // Reset input state when a new question arrives
  useEffect(() => {
    setSelectedOption(null);
    setSelectedOptions([]);
    setTextValue('');
    setScaleValue(5);
  }, [question?.questionText]);

  const canSubmit = () => {
    if (!question) return false;
    switch (question.questionType) {
      case 'multiple_choice':
        return selectedOption !== null;
      case 'multi_select':
        return selectedOptions.length > 0;
      case 'text_input':
        return textValue.trim().length > 0;
      case 'scale':
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = () => {
    if (!question || !canSubmit() || isLoading) return;

    switch (question.questionType) {
      case 'multiple_choice':
        onSubmit(selectedOption!, [selectedOption!]);
        break;
      case 'multi_select':
        onSubmit(selectedOptions.join(', '), selectedOptions);
        break;
      case 'text_input':
        onSubmit(textValue.trim());
        break;
      case 'scale':
        onSubmit(String(scaleValue), [String(scaleValue)]);
        break;
    }
  };

  // Loading state while waiting for question from Celery worker
  if (!question || isLoading) {
    return (
      <div className='aucctus-bg-secondary aucctus-border-secondary rounded-2xl border p-8 shadow-2xl backdrop-blur-2xl'>
        <ProgressBar questionNumber={questionNumber} />

        <div className='flex flex-col items-center justify-center py-16'>
          <div className='mb-4 flex gap-1.5'>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className='aucctus-bg-brand-solid h-2.5 w-2.5 rounded-full'
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
          <p className='aucctus-text-secondary text-sm'>
            Generating your next question...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='aucctus-bg-secondary aucctus-border-secondary rounded-2xl border p-8 shadow-2xl backdrop-blur-2xl'>
      <ProgressBar questionNumber={questionNumber} />

      <motion.h2
        key={question.questionText}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className='aucctus-text-primary mb-8 text-xl font-semibold'
      >
        {question.questionText}
      </motion.h2>

      <div className='mb-8'>
        {question.questionType === 'multiple_choice' &&
          question.questionOptions && (
            <MultipleChoiceInput
              options={question.questionOptions}
              value={selectedOption}
              onChange={setSelectedOption}
            />
          )}

        {question.questionType === 'multi_select' &&
          question.questionOptions && (
            <MultiSelectInput
              options={question.questionOptions}
              value={selectedOptions}
              onChange={setSelectedOptions}
            />
          )}

        {question.questionType === 'text_input' && (
          <TextInput value={textValue} onChange={setTextValue} />
        )}

        {question.questionType === 'scale' && (
          <ScaleInput value={scaleValue} onChange={setScaleValue} />
        )}
      </div>

      <div className='flex justify-end'>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit() || isLoading}
          className={cn(
            'btn btn-primary btn-lg flex items-center gap-2',
            (!canSubmit() || isLoading) && 'cursor-not-allowed opacity-50',
          )}
        >
          <span>Continue</span>
          <DynamicIcon
            variant='arrow-right'
            height={18}
            width={18}
            className='stroke-current'
          />
        </button>
      </div>
    </div>
  );
};
