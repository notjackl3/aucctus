import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useConceptIncubationStore } from '@stores/concept-incubation.store';
import { useSocketEvent } from '@hooks/sockets/aucctus';
import api from '@libs/api';
import { cn } from '@libs/utils/react';
import { IAISuggestion } from '@libs/api/types/conceptIncubation';
import { IConceptIncubationMultiSelectQuestion } from '@libs/api/types';
import { v4 as uuidv4 } from 'uuid';

// Component props interface
interface AiSuggestionsProps {
  title?: string;
}

const AiSuggestions: React.FC<AiSuggestionsProps> = ({
  title = 'AI Suggestions',
}) => {
  // --- Store state and refs ---
  const {
    suggestions,
    activeQuestion,
    setSuggestions,
    draftSeedUuid,
    currentMultiSelectAnswerList,
    currentTextAnswerList,
    currentQuestionOrder,
    setCurrentMultiSelectAnswerList,
  } = useConceptIncubationStore();

  const activeQuestionIdentifierRef = useRef<string | null>(null);

  // --- Derived state ---
  const isMultiSelectQuestion = useMemo(
    () =>
      ['multiSelect', 'radioButton'].includes(activeQuestion?.fieldType ?? ''),
    [activeQuestion],
  );

  const activeSuggestions = useMemo<IAISuggestion[]>(() => {
    return suggestions[activeQuestion?.identifier ?? ''] ?? [];
  }, [suggestions, activeQuestion]);

  // --- Helper functions ---
  const setMultiSelectFromSuggestion = useCallback(
    (suggestion: IAISuggestion) => {
      if (isMultiSelectQuestion && activeQuestion) {
        const answerValueSearchStrings = (
          activeQuestion as IConceptIncubationMultiSelectQuestion
        ).options.map((option) => option.value);
        const regex = new RegExp(
          `\\b(${answerValueSearchStrings.join('|')})\\b`,
          'i',
        );
        const match = suggestion.title.toLowerCase().match(regex);

        if (match) {
          setCurrentMultiSelectAnswerList([
            {
              answer: match[0],
              uuid: uuidv4(),
            },
          ]);
        }
      }
    },
    [isMultiSelectQuestion, activeQuestion, setCurrentMultiSelectAnswerList],
  );

  const dispatchAnswerUpdateEvent = useCallback((suggestion: IAISuggestion) => {
    const event = new CustomEvent('aucctus-incubation-answer-update', {
      detail: { answer: suggestion.description },
    });
    window.dispatchEvent(event);
  }, []);

  // --- API interactions ---
  const sendAiSuggestionsRequest = useCallback(
    (identifier: string, answer: string[]) => {
      if (activeQuestion?.identifier === identifier && draftSeedUuid) {
        setSuggestions(activeQuestion.identifier, []);

        api.aucctusSocket.send({
          type: 'incubation.ai.suggestions.request',
          seed_uuid: draftSeedUuid,
          identifier: activeQuestion.identifier,
          answer: answer.length ? answer : undefined,
        });
      }
    },
    [draftSeedUuid, activeQuestion, setSuggestions],
  );

  // --- Event handlers ---
  const handleSuggestionClick = useCallback(
    (suggestion: IAISuggestion) => {
      if (suggestion.description.length === 0) return;

      setMultiSelectFromSuggestion(suggestion);
      dispatchAnswerUpdateEvent(suggestion);
    },
    [setMultiSelectFromSuggestion, dispatchAnswerUpdateEvent],
  );

  // --- Socket event handling ---
  useSocketEvent('stream.structured.ai.suggestions', (data) => {
    if (['done', 'delta'].includes(data.stage)) {
      setSuggestions(data.context.identifier, data.content.suggestions ?? []);
    }
  });

  // --- Side effects ---
  // Listen for custom event to generate AI suggestions
  useEffect(() => {
    const handleGenerateAiSuggestions = (event: CustomEvent) =>
      sendAiSuggestionsRequest(event.detail.identifier, event.detail.answer);

    window.addEventListener(
      'aucctus-generate-ai-suggestions',
      handleGenerateAiSuggestions as EventListener,
    );

    return () =>
      window.removeEventListener(
        'aucctus-generate-ai-suggestions',
        handleGenerateAiSuggestions as EventListener,
      );
  }, [activeQuestion, draftSeedUuid, setSuggestions, sendAiSuggestionsRequest]);

  // Generate suggestions when active question changes
  useEffect(() => {
    if (
      activeQuestion &&
      activeQuestionIdentifierRef.current !== activeQuestion.identifier
    ) {
      activeQuestionIdentifierRef.current = activeQuestion.identifier;
      sendAiSuggestionsRequest(activeQuestion.identifier, [
        ...currentMultiSelectAnswerList.map((answer) => answer.answer.trim()),
        ...currentTextAnswerList.map((answer) => answer.answer.trim()),
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeQuestion, activeQuestionIdentifierRef]);

  // --- Render component ---
  return (
    <div
      className={cn('flex h-full flex-col gap-4 transition-all duration-300', {
        'opacity-1': (currentQuestionOrder ?? 0) < Infinity,
        'opacity-0': currentQuestionOrder === Infinity,
      })}
    >
      <div className='aucctus-text-xl text-white'>{title}</div>
      <div className='no-scrollbar flex flex-1 flex-col gap-4 overflow-y-auto'>
        {activeSuggestions.map((suggestion, index) => (
          <div
            onClick={() => handleSuggestionClick(suggestion)}
            className='aucctus-border-primary flex animate-fade-in cursor-pointer flex-col gap-2 rounded-lg border border-opacity-50 bg-white bg-opacity-25 p-4 backdrop-blur-lg transition-all duration-200 hover:brightness-125'
            key={`${activeQuestion?.id}-${index}`}
          >
            <div className='aucctus-text-md-medium text-gray-light-100'>
              {suggestion.title}
            </div>
            <div className='aucctus-text-sm text-gray-light-200'>
              {suggestion.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AiSuggestions;
