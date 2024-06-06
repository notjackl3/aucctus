import { ConceptSeedType } from './api/types';

export const HELP_EMAIL = 'help@aucctus.com';

// TODO: Add typings to records
export const EXPAND_AN_EXISTING_IDEA_QUESTIONS: Record<string, string> = {
  DESCRIBE: 'Describe your idea in one sentence',
  PROBLEM: 'What problem does your idea solve?',
  CUSTOMER: 'Who might your customers be?',
  SUCCESS: 'What will success look like?',
};

export const IDENTIFY_NEW_OPPORTUNITIES_QUESTIONS: Record<string, string> = {
  TARGET: 'What industry are you targeting?',
  PROBLEM: 'What customer problems do you wish to solve?',
  INTEREST: 'Why is your company interested in this?',
  SUCCESS: 'What will success look like?',
};

export const CONCEPT_SEED_TYPE_QUESTIONS: Record<Exclude<ConceptSeedType, 'UNKNOWN'>, Record<string, string>> = {
  EXPAND_AN_EXISTING_IDEA: EXPAND_AN_EXISTING_IDEA_QUESTIONS,
  IDENTIFY_NEW_OPPORTUNITIES: IDENTIFY_NEW_OPPORTUNITIES_QUESTIONS,
};
