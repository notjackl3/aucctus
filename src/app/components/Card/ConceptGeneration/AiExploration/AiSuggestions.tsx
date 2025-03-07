import React, { useEffect, useMemo } from 'react';
import { useConceptIncubationStore } from '@stores/concept-incubation.store';
import { QuestionEntry } from '../UserExploration/types/question';
import { useSocketEvent } from '@hooks/sockets/aucctus';
import api from '@libs/api';
import { ConceptIgnitionQuestion } from '@libs/api/types/conceptSeedQuestionnaire';

interface AiSuggestionsProps {
  title?: string;
  children?: React.ReactNode;
}

const AiSuggestions: React.FC<AiSuggestionsProps> = ({
  title = 'AI Suggestions',
  children,
}) => {
  const {
    suggestions,
    setSuggestions,
    currentQuestionIndex,
    activeQuestionnaire,
    draftSeedUuid,
  } = useConceptIncubationStore();

  useSocketEvent('stream.structured.ai.suggestions', (data) => {
    if (data.stage === 'delta') {
      setSuggestions(data.id, data.content.suggestions ?? []);
    }
  });

  const activeQuestion = useMemo<ConceptIgnitionQuestion | undefined>(() => {
    return Object.values(activeQuestionnaire?.questions ?? {})[
      currentQuestionIndex ?? 0
    ];
  }, [activeQuestionnaire, currentQuestionIndex]);

  useEffect(() => {
    if (!activeQuestion || !activeQuestion.id) return;

    setSuggestions(activeQuestion.id.toString(), []);

    api.aucctusSocket.send({
      type: 'incubation.ai.suggestions.request',
      seed_uuid: draftSeedUuid,
      identifier: activeQuestion.id.toString(),
      answer: [],
    });
  }, [activeQuestion, setSuggestions, draftSeedUuid]);

  return (
    <div className='flex flex-col gap-4'>
      <div className='aucctus-text-xl text-white'>{title}</div>
      <div className='flex flex-col gap-4'>{children}</div>
    </div>
  );
};

export default AiSuggestions;
