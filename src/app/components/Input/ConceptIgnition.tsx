import Button from '@components/Button';
import Icon from '@components/Icon';
import { ConceptIncubationQuestion, IDetailQuestion } from '@libs/api/types';
import React from 'react';
import InputField from './InputField/InputField';
import TextArea from './TextArea/TextArea';

interface ConceptIncubationInputProps {
  value?: string;
  details?: string;
  question: ConceptIncubationQuestion;
  onChange?: (value: string) => void; // Callback for single input changes
  onDetailChange?: (value: string) => void;
  onMultiSelectChange?: (value: string) => void; // Callback for multi-select inputs
}

const ConceptIncubation: React.FC<ConceptIncubationInputProps> = ({
  value,
  details,
  question,
  onDetailChange,
  onChange,
  onMultiSelectChange,
}) => {
  const [showDetails, setShowDetails] = React.useState<boolean>(!!details);

  const name = question.label.toLowerCase().replace(' ', '_');

  const renderDetails = (detailsQuestion: IDetailQuestion) => {
    switch (detailsQuestion.fieldType) {
      case 'text':
        return (
          <InputField
            value={details}
            name={`${name}-details`}
            placeholder={detailsQuestion.placeholder}
            width='100%'
            onChange={(e) => onDetailChange?.(e.target.value)}
          />
        );
      case 'textarea':
        return (
          <TextArea
            value={details}
            name={`${name}-details`}
            placeholder={detailsQuestion.placeholder}
            rows={detailsQuestion.rows || 2}
            onChange={(e) => onDetailChange?.(e.target.value)}
          />
        );
    }
  };

  const renderQuestion = () => {
    switch (question.fieldType) {
      case 'text':
        return (
          <InputField
            label={question.label}
            value={value}
            name={name}
            placeholder={question.placeholder}
            width='100%'
            onChange={(e) => onChange?.(e.target.value)}
          />
        );
      case 'textarea':
        return (
          <TextArea
            label={question.label}
            value={value}
            name={name}
            placeholder={question.placeholder}
            rows={question.rows || 2}
            onChange={(e) => onChange?.(e.target.value)}
          />
        );
      case 'multiSelect':
        return (
          <div className='inline-flex w-full flex-col items-start justify-center gap-2.5'>
            <span className='font-base aucctus-text-secondary relative font-medium leading-5'>
              {question.label}
            </span>
            <Button.RadioButtonGroup
              label={question.label}
              value={value}
              options={question.options}
              defaultSelected={question.defaultOption}
              required={question.required}
              onChange={(value) => onMultiSelectChange?.(value)}
            />
            {question.details ? (
              showDetails ? (
                renderDetails(question.details)
              ) : (
                <button
                  className='inline-flex items-center justify-start gap-2 rounded-lg py-2 pr-3.5 text-xs font-bold text-primary-600'
                  onClick={() => setShowDetails(!showDetails)}
                >
                  <Icon
                    variant='plus'
                    className='stroke-primary-800'
                    height={20}
                    width={20}
                  />
                  Add Details
                </button>
              )
            ) : null}
          </div>
        );
      default:
        return null;
    }
  };

  return <div className='flex gap-3.5 self-stretch'>{renderQuestion()}</div>;
};

export default ConceptIncubation;
