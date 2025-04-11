import {
  AiEditingChatStreamEvent,
  ConceptIncubationQuestion,
  IAiEditingInboundChatMessage,
  IAiEditingSuggestionsEvent,
  IAiEditingSuggestionsStreamEvent,
  IConceptIncubationMultiSelectQuestion,
  IConceptIncubationTextareaQuestion,
  IConceptIncubationTextQuestion,
} from '../types';

export const isMultiSelectQuestion = (
  question: ConceptIncubationQuestion,
): question is IConceptIncubationMultiSelectQuestion => {
  return ['multiSelect', 'radioButton'].includes(question.fieldType);
};

export const isTextQuestion = (
  question: ConceptIncubationQuestion,
): question is IConceptIncubationTextQuestion => {
  return question.fieldType === 'text';
};

export const isTextareaQuestion = (
  question: ConceptIncubationQuestion,
): question is IConceptIncubationTextareaQuestion => {
  return question.fieldType === 'textarea';
};

export const isDirectMessage = (
  message:
    | IAiEditingSuggestionsEvent
    | IAiEditingInboundChatMessage
    | IAiEditingSuggestionsStreamEvent
    | AiEditingChatStreamEvent,
): message is IAiEditingSuggestionsEvent | IAiEditingInboundChatMessage => {
  return 'conceptUuid' in message;
};

export const isStreamEvent = (
  message:
    | IAiEditingSuggestionsEvent
    | IAiEditingInboundChatMessage
    | IAiEditingSuggestionsStreamEvent
    | AiEditingChatStreamEvent,
): message is IAiEditingSuggestionsStreamEvent | AiEditingChatStreamEvent => {
  return 'context' in message && 'stage' in message;
};
