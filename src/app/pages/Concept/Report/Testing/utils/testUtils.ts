/**
 * Utilities for testing components
 */

import { ITestParticipant } from '../types';

/** Get the source UUID from a polymorphic test participant. */
export function getParticipantSourceUuid(
  participant: ITestParticipant,
): string | undefined {
  return participant.sourceType === 'persona'
    ? (participant.personaUuid ?? undefined)
    : (participant.customerProfileUuid ?? undefined);
}

/** Get display fields (name, segment, description, avatar) from a polymorphic participant. */
export function getParticipantDisplayInfo(participant: ITestParticipant) {
  const isPersona = participant.sourceType === 'persona';
  return {
    name: isPersona
      ? (participant.persona?.name ?? '')
      : (participant.customerProfile?.name ?? ''),
    segment: isPersona
      ? (participant.persona?.segment ?? '')
      : (participant.customerProfile?.segment ?? ''),
    description: isPersona
      ? (participant.persona?.overview ?? '')
      : (participant.customerProfile?.description ?? ''),
    avatarUrl: isPersona
      ? (participant.persona?.avatarUrl ?? undefined)
      : (participant.customerProfile?.avatarUrl ?? undefined),
  };
}

/**
 * Format test type for display
 */
export const formatTestType = (testType: string): string => {
  const typeMap: Record<string, string> = {
    interview: 'Interview',
    survey: 'Survey',
    usability: 'Usability Test',
    ab: 'A/B Test',
    focus_group: 'Focus Group',
    prototype: 'Prototype Test',
    other: 'Other',
  };
  return typeMap[testType] || testType;
};

/**
 * Handle apply recommendations placeholder
 * TODO: Implement actual recommendations application logic
 */
export const handleApplyRecommendations = (): void => {
  // eslint-disable-next-line no-alert
  alert('Apply Recommendations feature is coming soon!');
};

/**
 * Convert risk level to numeric value for processing
 */
export const riskLevelToNumber = (
  riskLevel: 'high' | 'medium' | 'low',
): number => {
  switch (riskLevel) {
    case 'high':
      return 80;
    case 'medium':
      return 50;
    case 'low':
      return 20;
    default:
      return 50;
  }
};
