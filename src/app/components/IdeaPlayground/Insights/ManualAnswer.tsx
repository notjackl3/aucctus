/* eslint-disable react/prop-types */
import React, { useState, memo, useCallback } from 'react';
import { useSpring, animated } from 'react-spring';
import { Icon } from '@components';
import ManualAnswerEdit from './ManualAnswerEdit';

interface ManualAnswerProps {
  answer?: string;
  onDelete?: () => Promise<void>;
  onSubmit?: (answer: string) => Promise<void>;
  onAnimationComplete?: () => void;
}

// Memoized view component to prevent re-renders
const ManualAnswerView = memo<{
  answer: string;
  onEdit: () => void;
}>(({ answer, onEdit }) => (
  <>
    <div className='mb-2 flex items-start gap-2'>
      <Icon
        variant='target'
        className='aucctus-stroke-white mt-0.5 flex-shrink-0'
        height={16}
        width={16}
      />
      <span className='aucctus-text-sm-medium leading-tight'>Your Answer</span>
    </div>

    <p
      onClick={(e) => {
        e.stopPropagation();
        onEdit();
      }}
      className='aucctus-text-xs mt-2 cursor-pointer leading-relaxed transition-opacity duration-200 hover:opacity-75'
    >
      {answer}
    </p>

    <div className='mt-2 flex justify-end'>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        className='inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-2 py-1 transition-colors hover:bg-white/15'
        title='Edit answer'
      >
        <Icon
          variant='edit'
          className='aucctus-stroke-white'
          height={12}
          width={12}
        />
        <span className='aucctus-text-xs-medium max-w-[80px] truncate'>
          Edit
        </span>
      </button>
    </div>
  </>
));

ManualAnswerView.displayName = 'ManualAnswerView';

const ManualAnswer: React.FC<ManualAnswerProps> = ({
  answer,
  onDelete,
  onSubmit,
  onAnimationComplete,
}) => {
  // Start in edit mode if no answer exists, otherwise start in view mode
  const [isEditing, setIsEditing] = useState(!answer);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingRequest, setIsDeletingRequest] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Local state for editing - sync with prop when switching to edit mode
  const [localAnswer, setLocalAnswer] = useState(answer || '');

  // Animation for deletion - loading state (0.8 opacity) then fade out
  const fadeOutAnimation = useSpring({
    opacity: isDeleting ? 0 : isDeletingRequest ? 0.8 : 1,
    transform: isDeleting ? 'scale(0.95)' : 'scale(1)',
    config: { duration: 300 },
    onRest: () => {
      if (isDeleting) {
        onAnimationComplete?.();
      }
    },
  });

  // Sync local state when answer prop changes (e.g., after save)
  React.useEffect(() => {
    if (!isEditing) {
      setLocalAnswer(answer || '');
    }
  }, [answer, isEditing]);

  const handleEdit = useCallback(() => {
    // Sync local state with current answer when entering edit mode
    setLocalAnswer(answer || '');
    setIsEditing(true);
  }, [answer]);

  const handleCancel = useCallback(() => {
    // Return to view mode without saving
    setLocalAnswer(answer || '');
    setIsEditing(false);
  }, [answer]);

  const handleSubmit = useCallback(
    async (submittedAnswer: string) => {
      if (!onSubmit) return;

      setIsSubmitting(true);
      try {
        await onSubmit(submittedAnswer);
        // Only switch to view mode after successful submission
        setLocalAnswer(submittedAnswer);
        setIsEditing(false);
      } catch (error) {
        // Keep in edit mode if submission fails
        // Error is already logged by telemetry in the parent component
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmit],
  );

  const handleAnswerChange = useCallback((newAnswer: string) => {
    setLocalAnswer(newAnswer);
  }, []);

  const handleDelete = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!onDelete || isDeletingRequest || isDeleting) return;

      setIsDeletingRequest(true);
      try {
        await onDelete();
        // If successful, start the fade-out animation
        setIsDeleting(true);
      } catch (error) {
        // If unsuccessful, reset loading state
        setIsDeletingRequest(false);
        // Error is already handled by parent/telemetry
      }
    },
    [onDelete, isDeletingRequest, isDeleting],
  );

  return (
    <animated.div
      style={fadeOutAnimation}
      className='aucctus-text-white relative min-w-[350px] max-w-[350px] select-none rounded-xl border border-white/30 bg-white/10 p-3 shadow-lg backdrop-blur-md transition-all duration-200 hover:bg-white/15'
    >
      {onDelete && !isSubmitting && !isDeletingRequest && !isDeleting && (
        <button
          onClick={handleDelete}
          className='aucctus-bg-error-solid hover:aucctus-bg-error-solid-hover absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full transition-colors duration-200'
          title='Delete answer'
        >
          <Icon
            variant='closeX'
            className='aucctus-stroke-white'
            height={12}
            width={12}
          />
        </button>
      )}

      {isDeletingRequest && (
        <div className='absolute inset-0 flex items-center justify-center rounded-xl bg-black/20'>
          <Icon
            variant='loading-02'
            className='aucctus-stroke-white animate-spin'
            height={24}
            width={24}
          />
        </div>
      )}

      {isEditing ? (
        <ManualAnswerEdit
          answer={localAnswer}
          originalAnswer={answer}
          isSubmitting={isSubmitting}
          onAnswerChange={handleAnswerChange}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      ) : (
        <ManualAnswerView answer={answer || ''} onEdit={handleEdit} />
      )}
    </animated.div>
  );
};

export default ManualAnswer;
