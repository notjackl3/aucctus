import { useSocketEvent } from '@hooks/sockets/aucctus';
import { useDebounce } from '@hooks/utility.hook';
import api from '@libs/api';
import type {
  IAISuggestion,
  IConceptIncubationMultiSelectOption,
  IConceptIncubationMultiSelectQuestion,
} from '@libs/api/types';
import { AiSuggestionEvent } from '@libs/events';
import { IncubationAnswerEvent } from '@libs/events/IncumbentAnswerEvent';
import telemetry from '@libs/telemetry';
import { cn } from '@libs/utils/react';
import { AnswerItem } from '@stores/concept-incubation/actions';
import { useConceptIncubationStore } from '@stores/concept-incubation/enhancedStore';
import React, { useCallback, useEffect, useMemo } from 'react';
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
    activeGeneratedConcept,
  } = useConceptIncubationStore();

  const question = useMemo(
    () =>
      activeClarifyingQuestion
        ? activeClarifyingQuestion.question
        : activeQuestion,
    [activeClarifyingQuestion, activeQuestion],
  );

  const allowAiSuggestions = useMemo(() => {
    return question && !activeClarifyingQuestion?.isFreeForm;
  }, [question, activeClarifyingQuestion]);

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
        const options = (question as IConceptIncubationMultiSelectQuestion)
          .options;
        const answerValueSearchStrings = options.map(
          (option: IConceptIncubationMultiSelectOption) => option.value,
        );
        const answerLabelSearchStrings = options.map(
          (option: IConceptIncubationMultiSelectOption) => option.label,
        );
        const valueRegex = new RegExp(
          `\\b(${answerValueSearchStrings.join('|')})\\b`,
          'i',
        );
        const labelRegex = new RegExp(
          `\\b(${answerLabelSearchStrings.join('|')})\\b`,
          'i',
        );

        // Try to match by value first
        const valueMatch = suggestion.title.toLowerCase().match(valueRegex);
        if (valueMatch) {
          setCurrentMultiSelectAnswerList([
            {
              answer: valueMatch[0],
              uuid: uuidv4(),
            },
          ]);
          return;
        }

        // If no value match, try to match by label and map back to value
        const labelMatch = suggestion.title.toLowerCase().match(labelRegex);
        if (labelMatch) {
          // Find the option with the matching label
          const matchedLabel = labelMatch[0];
          const matchedOption = options.find(
            (option) => option.label.toLowerCase() === matchedLabel,
          );

          if (matchedOption) {
            setCurrentMultiSelectAnswerList([
              {
                answer: matchedOption.value, // Use the value, not the label
                uuid: uuidv4(),
              },
            ]);
          }
        }
      }
    },
    [isMultiSelectQuestion, question, setCurrentMultiSelectAnswerList],
  );

  const dispatchAnswerUpdateEvent = useCallback((suggestion: IAISuggestion) => {
    IncubationAnswerEvent.dispatch({
      answer: suggestion.title + ': ' + suggestion.description,
    });
  }, []);

  // --- API interactions ---
  const sendAiSuggestionsRequest = useDebounce(
    (questionId: number, answer: string[]) => {
      if (allowAiSuggestions && question?.id === questionId && draftSeedUuid) {
        setSuggestions(question.id, []);

        api.aucctusSocket.send({
          type: 'incubation.ai.suggestions.request',
          seedUuid: draftSeedUuid,
          questionId: question.id,
          answer: answer.length ? answer : undefined,
          conceptUuid: activeGeneratedConcept?.uuid ?? undefined,
        });
      }
    },

    500,
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
    if ('done' === data.stage || 'delta' === data.stage) {
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
    if (!question || !allowAiSuggestions) return;

    sendAiSuggestionsRequest(question.id, [
      ...currentMultiSelectAnswerList.map((answer: AnswerItem) =>
        answer.answer.trim(),
      ),
      ...currentTextAnswerList.map((answer: AnswerItem) =>
        answer.answer.trim(),
      ),
    ]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);

  // --- Render component ---
  return (
    <div
      className={cn('flex h-full flex-col gap-4 transition-all duration-300', {
        'opacity-1': allowAiSuggestions,
        'opacity-0': !allowAiSuggestions,
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
