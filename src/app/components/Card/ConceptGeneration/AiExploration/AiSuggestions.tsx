import { useSocketEvent } from '@hooks/sockets/aucctus';
import api from '@libs/api';
import {
  IAISuggestion,
  IConceptIncubationMultiSelectQuestion,
} from '@libs/api/types';
import { AiSuggestionEvent } from '@libs/events';
import { IncubationAnswerEvent } from '@libs/events/IncumbentAnswerEvent';
import telemetry from '@libs/telemetry';
import { cn } from '@libs/utils/react';
import { useConceptIncubationStore } from '@stores/concept-incubation.store';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
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

  const activeQuestionIdRef = useRef<number | null>(null);

  // --- Derived state ---
  const isMultiSelectQuestion = useMemo(
    () =>
      !!activeQuestion &&
      ['multiSelect', 'radioButton'].includes(activeQuestion.fieldType),
    [activeQuestion],
  );

  const activeSuggestions = useMemo<IAISuggestion[]>(() => {
    if (activeQuestion && activeQuestion.id in suggestions) {
      return suggestions[activeQuestion.id];
    }
    return [];
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
    IncubationAnswerEvent.dispatch({
      answer: suggestion.description,
    });
  }, []);

  // --- API interactions ---
  const sendAiSuggestionsRequest = useCallback(
    (questionId: number, answer: string[]) => {
      if (activeQuestion && activeQuestion.id === questionId && draftSeedUuid) {
        setSuggestions(activeQuestion.id, []);

        api.aucctusSocket.send({
          type: 'incubation.ai.suggestions.request',
          seedUuid: draftSeedUuid,
          questionId: activeQuestion.id,
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
      telemetry.log(
        'aiSuggestions',
        data.context,
        data.content.suggestions ?? [],
      );
      setSuggestions(data.context.questionId, data.content.suggestions ?? []);
    }
  });

  // --- Side effects ---
  // Listen for custom event to generate AI suggestions
  useEffect(() => {
    const handleGenerateAiSuggestions = (event: AiSuggestionEvent) =>
      sendAiSuggestionsRequest(event.detail.questionId, event.detail.answer);

    window.addEventListener(
      AiSuggestionEvent.eventName,
      handleGenerateAiSuggestions,
    );

    return () =>
      window.removeEventListener(
        AiSuggestionEvent.eventName,
        handleGenerateAiSuggestions,
      );
  }, [activeQuestion, draftSeedUuid, setSuggestions, sendAiSuggestionsRequest]);

  // Generate suggestions when active question changes
  useEffect(() => {
    if (activeQuestion && activeQuestionIdRef.current !== activeQuestion.id) {
      activeQuestionIdRef.current = activeQuestion.id;
      sendAiSuggestionsRequest(activeQuestion.id, [
        ...currentMultiSelectAnswerList.map((answer) => answer.answer.trim()),
        ...currentTextAnswerList.map((answer) => answer.answer.trim()),
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeQuestion, activeQuestionIdRef]);

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
