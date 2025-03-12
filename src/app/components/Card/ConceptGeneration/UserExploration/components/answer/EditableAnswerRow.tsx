import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '@components';
import { cn } from '@libs/utils/react';
import { useAnswerList } from '../../hooks/answer-list.hook';
import { useConceptIncubationStore } from '@stores/concept-incubation.store';

interface Answer {
  uuid: string;
  answer: string;
}

interface EditableAnswerRowProps {
  answer: Answer;
  handleUpdateAnswer: (uuid: string, newAnswer: string) => void;
  handleRemoveAnswer: (
    e: React.MouseEvent<HTMLButtonElement>,
    uuid: string,
  ) => void;
}

const EditableAnswerRow: React.FC<EditableAnswerRowProps> = ({
  answer,
  handleUpdateAnswer,
  handleRemoveAnswer,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAnswer, setEditedAnswer] = useState(answer.answer);
  const inputRef = useRef<HTMLInputElement>(null);
  const isBlurFromSaveButton = useRef(false);
  const { currentTextAnswerList } = useConceptIncubationStore();
  const { allowUpdateAnswer } = useAnswerList(currentTextAnswerList, () => {});

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (editedAnswer.trim() && allowUpdateAnswer(editedAnswer)) {
      handleUpdateAnswer(answer.uuid, editedAnswer);
      setIsEditing(false);
    }
  };

  const handleCancel = (
    e: React.MouseEvent | React.KeyboardEvent | React.FocusEvent,
  ) => {
    e.stopPropagation();
    if (e.type === 'blur' && isBlurFromSaveButton.current) {
      isBlurFromSaveButton.current = false;
      return;
    }
    setEditedAnswer(answer.answer);
    setIsEditing(false);
  };

  const renderEditMode = () => (
    <>
      <input
        ref={inputRef}
        type='text'
        value={editedAnswer}
        onBlur={handleCancel}
        maxLength={500}
        placeholder='*Required'
        onChange={(e) => setEditedAnswer(e.target.value)}
        className={cn(
          'aucctus-text-sm aucctus-text-primary flex-1 break-words rounded-md px-2 py-1',
          {
            'aucctus-text-disabled': !allowUpdateAnswer(editedAnswer),
            'aucctus-bg-error-primary': !allowUpdateAnswer(editedAnswer),
            'aucctus-bg-tertiary': editedAnswer.trim(),
          },
        )}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && editedAnswer.trim()) handleSave(e);
          if (e.key === 'Escape') handleCancel(e);
        }}
      />
      <span className='flex-1' />
      <button
        className={cn(
          'aucctus-bg-tertiary-hover cursor-pointer rounded-lg p-2',
          {
            'cursor-not-allowed opacity-50': !allowUpdateAnswer(editedAnswer),
          },
        )}
        onMouseDown={(e) => {
          e.preventDefault();
          isBlurFromSaveButton.current = true;
        }}
        onClick={handleSave}
        aria-label='Save answer'
        disabled={!editedAnswer.trim()}
      >
        <Icon variant='check' />
      </button>
    </>
  );

  const renderViewMode = () => (
    <>
      <span
        className={cn('aucctus-text-primary whitespace-pre-wrap break-all', {
          'aucctus-text-xs': answer.answer.length >= 300,
          'aucctus-text-sm': answer.answer.length < 300,
        })}
      >
        {answer.answer}
      </span>
      <span className='flex-1' />
      <button
        className='aucctus-bg-tertiary-hover cursor-pointer rounded-lg p-2'
        onClick={() => setIsEditing(true)}
        aria-label='Edit answer'
      >
        <Icon variant='edit' />
      </button>
      <button
        className='aucctus-bg-tertiary-hover cursor-pointer rounded-lg p-2'
        onClick={(e) => handleRemoveAnswer(e, answer.uuid)}
        aria-label='Remove answer'
      >
        <Icon variant='closeX' />
      </button>
    </>
  );

  return (
    <div className='aucctus-incubation-answer-row aucctus-border-secondary aucctus-bg-secondary flex flex-1 animate-incubation-answer-expand flex-row items-center gap-3 rounded-lg border-2 p-2'>
      {isEditing ? renderEditMode() : renderViewMode()}
    </div>
  );
};

export default EditableAnswerRow;
