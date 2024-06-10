import { ConceptSeedType } from './api/types';

export const HELP_EMAIL = 'help@aucctus.com';

/**
 * Make sure that if any changes are made to the questions here that changes are also made in the backend.
 * You can find the backend questions in the `libs/base/aucctus/base/concepts/ignitions.py` file.
 *
 */

export const EXPAND_AN_EXISTING_IDEA_QUESTIONS: Record<string, string> = {
  DESCRIBE: 'Describe your idea in one sentence',
  PROBLEM: 'What problem does your idea solve?',
  CUSTOMER: 'Who might your customers be?',
  SUCCESS: 'What will success look like?',
};

export const IDENTIFY_NEW_OPPORTUNITIES_QUESTIONS: Record<string, string> = {
  TARGET: 'What industry are you targeting?',
  PROBLEM: 'Who are you targeting and what problems need to be solved?',
  INTEREST: 'Why is your company interested in this?',
  SUCCESS: 'What will success look like?',
};

export const CONCEPT_SEED_TYPE_QUESTIONS: Record<Exclude<ConceptSeedType, 'UNKNOWN'>, Record<string, string>> = {
  EXPAND_AN_EXISTING_IDEA: EXPAND_AN_EXISTING_IDEA_QUESTIONS,
  IDENTIFY_NEW_OPPORTUNITIES: IDENTIFY_NEW_OPPORTUNITIES_QUESTIONS,
};
