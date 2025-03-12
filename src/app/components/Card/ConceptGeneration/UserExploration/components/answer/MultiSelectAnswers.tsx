import { Icon } from '@components';
import { Input } from '@components';
import React from 'react';
import { QuestionEntry } from '../../types/question';
import { boxShadowStyle } from '../question/QuestionIcons';
import { v4 as uuidv4 } from 'uuid';
import {
  useConceptIncubationStore,
  AnswerItem,
} from '@stores/concept-incubation.store';

/**
 * MultiSelectAnswers component handles rendering and interaction for multiple choice questions
 */
const MultiSelectAnswers: React.FC<{
  answersRef?: React.RefObject<HTMLDivElement>;
}> = ({ answersRef }) => {
  const {
    currentMultiSelectAnswerList,
    setCurrentMultiSelectAnswerList,
    activeQuestion,
  } = useConceptIncubationStore();

  if (
    !activeQuestion ||
    (activeQuestion.fieldType !== 'multiSelect' &&
      activeQuestion.fieldType !== 'radioButton')
  ) {
    return null;
  }

  const handleOptionSelect = (optionValue: string) => {
    if (activeQuestion.fieldType === 'radioButton') {
      // For radio buttons, replace the entire selection with just the clicked option
      setCurrentMultiSelectAnswerList([
        { uuid: uuidv4(), answer: optionValue },
      ]);
    } else {
      // For multiSelect, toggle the selection
      const isAlreadySelected = currentMultiSelectAnswerList.some(
        (item: AnswerItem) => item.answer === optionValue,
      );

      if (isAlreadySelected) {
        // Remove the option if already selected
        setCurrentMultiSelectAnswerList(
          currentMultiSelectAnswerList.filter(
            (item: AnswerItem) => item.answer !== optionValue,
          ),
        );
      } else {
        // Add the option if not selected
        setCurrentMultiSelectAnswerList([
          ...currentMultiSelectAnswerList,
          { uuid: uuidv4(), answer: optionValue },
        ]);
      }
    }
  };

  return (
    <div
      ref={answersRef}
      className='flex max-h-[50vh] flex-1 flex-col gap-2 overflow-y-auto'
    >
      {activeQuestion.options.map((option) => {
        const isSelected = currentMultiSelectAnswerList.some(
          (item: AnswerItem) => item.answer === option.value,
        );

        return (
          <div
            className='aucctus-border-primary aucctus-bg-primary flex animate-incubation-answer-expand cursor-pointer flex-row items-center gap-1 rounded-xl border p-2'
            key={option.value}
            onClick={() => handleOptionSelect(option.value)}
          >
            <span
              style={boxShadowStyle}
              className='aucctus-bg-primary aucctus-border-secondary mr-2 flex h-8 w-8 items-center justify-center rounded-lg border-2'
            >
              <Icon
                variant={option.icon as IconVariant}
                height={16}
                width={16}
              />
            </span>
            <div className='flex flex-1 flex-col gap-1'>
              <span className='aucctus-text-sm aucctus-text-primary'>
                {option.label}
              </span>
              <span className='aucctus-text-xs aucctus-text-secondary'>
                {option.description}
              </span>
            </div>
            <Input.CheckBox
              checked={isSelected}
              onChange={() => handleOptionSelect(option.value)}
            />
          </div>
        );
      })}
    </div>
  );
};

export default MultiSelectAnswers;
