import { ICustomerProfile } from '@libs/api/types/concept/concepts';

export interface ISyntheticLoadingUIProps {
  // Progress data
  progress?: number; // Made optional to handle initialization state
  status: 'running' | 'completed' | 'error' | 'cancelled';
  message?: string;
  currentStage?: string;

  // Customer profiles for interview progress
  profiles: ICustomerProfile[];
  currentPersona?: string;
  totalPersonas?: number;

  // Results data for completion state
  resultsCount?: number;

  // Initialization state
  isInitializing?: boolean;

  // Live quotes from interviews
  quotes?: Array<{ text: string; profileUuid: string }>;

  // Track which profiles have completed
  completedProfileUuids?: Set<string>;

  // Estimated execution time
  estimatedSeconds?: number | null;

  // Start time (Unix timestamp) for progress calculation
  startTime?: number;

  // Concept UUID for agent timing
  conceptUuid?: string;
  testUuid?: string;
  plannedParticipantCounts?: Record<string, number>;

  // Navigation callback
  onViewResults?: () => void;
}

export interface IPersonaProgressItem {
  profile: ICustomerProfile;
  status: 'pending' | 'processing' | 'completed';
}
