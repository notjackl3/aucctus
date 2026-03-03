import {
  ConceptIncubationQuestion,
  IConceptIncubationMultiSelectQuestion,
  IConceptIncubationTextareaQuestion,
  IConceptIncubationTextQuestion,
  ICustomerProfileInboundChatMessage,
  CustomerProfileStreamEvent,
} from '../types';

// Incubation question type guards
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

// Customer Profile message type guards
export const isCustomerProfileDirectMessage = (
  message: ICustomerProfileInboundChatMessage | CustomerProfileStreamEvent,
): message is ICustomerProfileInboundChatMessage => {
  return 'sessionId' in message && !('context' in message);
};

export const isCustomerProfileStreamEvent = (
  message: ICustomerProfileInboundChatMessage | CustomerProfileStreamEvent,
): message is CustomerProfileStreamEvent => {
  return (
    'context' in message && 'stage' in message && 'sessionId' in message.context
  );
};
