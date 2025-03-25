import {
  ConceptIncubationQuestion,
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
