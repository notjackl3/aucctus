import React, { useCallback, useEffect, useMemo } from 'react';
import { useConceptIncubationStore } from '@stores/concept-incubation.store';
import { useSocketEvent } from '@hooks/sockets/aucctus';
import api from '@libs/api';
import { cn } from '@libs/utils/react';

interface AiSuggestionsProps {
  title?: string;
}

const AiSuggestions: React.FC<AiSuggestionsProps> = ({
  title = 'AI Suggestions',
}) => {
  const {
    suggestions,
    activeQuestion,
    setSuggestions,
    draftSeedUuid,
    currentMultiSelectAnswerList,
    currentTextAnswerList,
    currentQuestionOrder,
  } = useConceptIncubationStore();

  const activeSuggestions = useMemo<IAISuggestion[]>(() => {
    return suggestions[activeQuestion?.identifier ?? ''] ?? [];
  }, [suggestions, activeQuestion]);

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

  useEffect(() => {
    if (activeQuestion) {
      sendAiSuggestionsRequest(activeQuestion.identifier, [
        ...currentMultiSelectAnswerList.map((answer) => answer.answer.trim()),
        ...currentTextAnswerList.map((answer) => answer.answer.trim()),
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeQuestion]);

  useSocketEvent('stream.structured.ai.suggestions', (data) => {
    if (['done', 'delta'].includes(data.stage)) {
      setSuggestions(data.context.identifier, data.content.suggestions ?? []);
    }
  });

  const dispatchAnswerUpdateEvent = useCallback((suggestion: IAISuggestion) => {
    const event = new CustomEvent('aucctus-incubation-answer-update', {
      detail: { answer: suggestion.description },
    });
    window.dispatchEvent(event);
  }, []);

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
            onClick={() => dispatchAnswerUpdateEvent(suggestion)}
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
