import { useSocketEvent } from '@hooks/sockets/aucctus';
import api from '@libs/api';
import { IConceptIncubationMultiSelectQuestion } from '@libs/api/types';

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
    activeClarifyingQuestion,
    setSuggestions,
    draftSeedUuid,
    currentMultiSelectAnswerList,
    currentTextAnswerList,
    setCurrentMultiSelectAnswerList,
  } = useConceptIncubationStore();

  const activeQuestionIdRef = useRef<number | null>(null);
  const question = useMemo(
    () =>
      activeClarifyingQuestion
        ? activeClarifyingQuestion.question
        : activeQuestion,
    [activeClarifyingQuestion, activeQuestion],
  );

  // --- Derived state ---
  const isMultiSelectQuestion = useMemo(
    () =>
      !!question && ['multiSelect', 'radioButton'].includes(question.fieldType),
    [question],
  );

  const activeSuggestions = useMemo<IAISuggestion[]>(() => {
    if (question && question.id in suggestions) {
      return suggestions[question.id];
    }
    return [];
  }, [suggestions, question]);

  // --- Helper functions ---
  const setMultiSelectFromSuggestion = useCallback(
    (suggestion: IAISuggestion) => {
      if (isMultiSelectQuestion && question) {
        const answerValueSearchStrings = (
          question as IConceptIncubationMultiSelectQuestion
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
    [isMultiSelectQuestion, question, setCurrentMultiSelectAnswerList],
  );

  const dispatchAnswerUpdateEvent = useCallback((suggestion: IAISuggestion) => {
    IncubationAnswerEvent.dispatch({
      answer: suggestion.description,
    });
  }, []);

  // --- API interactions ---
  const sendAiSuggestionsRequest = useCallback(
    (questionId: number, answer: string[]) => {
      telemetry.log('sendAiSuggestionsRequest called', questionId, answer);
      if (question && question.id === questionId && draftSeedUuid) {
        telemetry.log('sendAiSuggestionsRequest 2', question.id, answer);
        setSuggestions(question.id, []);

        api.aucctusSocket.send({
          type: 'incubation.ai.suggestions.request',
          seedUuid: draftSeedUuid,
          questionId: question.id,
          answer: answer.length ? answer : undefined,
        });
      }
    },
    [draftSeedUuid, question, setSuggestions],
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
  }, [question, draftSeedUuid, setSuggestions, sendAiSuggestionsRequest]);

  // Generate suggestions when active question changes
  useEffect(() => {
    if (!question || question.id === activeQuestionIdRef.current) return;

    activeQuestionIdRef.current = question.id;

    sendAiSuggestionsRequest(question.id, [
      ...currentMultiSelectAnswerList.map((answer) => answer.answer.trim()),
      ...currentTextAnswerList.map((answer) => answer.answer.trim()),
    ]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question, activeQuestionIdRef]);

  // --- Render component ---
  return (
    <div
      className={cn('flex h-full flex-col gap-4 transition-all duration-300', {
        'opacity-1': !!question,
        'opacity-0': !question,
      })}
    >
      <div className='aucctus-text-xl text-white'>{title}</div>
      <div className='no-scrollbar flex flex-1 flex-col gap-4 overflow-y-auto'>
        {activeSuggestions.map((suggestion, index) => (
          <div
            onClick={() => handleSuggestionClick(suggestion)}
            className='aucctus-border-primary flex animate-fade-in cursor-pointer flex-col gap-2 rounded-lg border border-opacity-50 bg-white bg-opacity-25 p-4 backdrop-blur-lg transition-all duration-200 hover:brightness-125'
            key={`${question?.label}-${index}`}
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
