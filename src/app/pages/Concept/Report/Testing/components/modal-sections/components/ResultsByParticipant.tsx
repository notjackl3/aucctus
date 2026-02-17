import React, { useMemo, useState } from 'react';
import { ITestResult, ITestLearning } from '@libs/api/types/concept/testing';
import { ITestParticipant } from '../../../types';
import { cn } from '@libs/utils/react';
import SourceBadges from './SourceBadges';
import { ChevronDown, ChevronUp, MessageCircle, User } from 'lucide-react';

// Persona colors matching the participants tab
const PERSONA_COLORS = ['#FF8A00', '#00C853', '#00B0FF', '#AA00FF'];

interface ResultsByParticipantProps {
  participants: ITestParticipant[];
  results: ITestResult[];
  learningsMap: Map<string, ITestLearning>;
  onSourceClick?: (source: string) => void;
}

interface ParticipantFinding {
  id: string;
  title: string;
  impact: string;
  sources?: string[];
}

interface ParticipantQuote {
  id: string;
  quote: string;
  context: string;
}

const ResultsByParticipant: React.FC<ResultsByParticipantProps> = ({
  participants,
  results,
  onSourceClick,
}) => {
  // Normalization helpers
  const normalizeUuid = (value?: string | null) =>
    value ? value.replace(/_/g, '-').toLowerCase() : undefined;

  const normalizeName = (value?: string | null) =>
    value
      ? value
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .trim()
          .toLowerCase()
      : undefined;

  // Group results by profile UUID with fallback to persona name matching
  const resultsByProfile = useMemo(() => {
    const map = new Map<string, ITestResult[]>();

    // Initialize map with participant profile UUIDs
    participants.forEach((participant) => {
      const normalizedUuid =
        normalizeUuid(participant.customerProfile.uuid) ??
        participant.customerProfile.uuid.toLowerCase();
      map.set(normalizedUuid, []);
    });

    results?.forEach((result) => {
      // Try to match by UUID first
      const candidateIds = [
        normalizeUuid(result.baseProfileUuid),
        normalizeUuid(result.personaUuid),
      ]
        .filter(Boolean)
        .map((id) => id as string);

      let matched = false;
      for (const candidate of candidateIds) {
        if (map.has(candidate)) {
          const existing = map.get(candidate) || [];
          map.set(candidate, [...existing, result]);
          matched = true;
          break;
        }
      }

      // Fallback: match by persona name if UUID matching failed
      if (!matched && result.personaName) {
        const personaName = normalizeName(result.personaName);
        const matchingParticipant = participants.find(
          (participant) =>
            normalizeName(participant.customerProfile.name) === personaName,
        );

        if (matchingParticipant) {
          const normalizedProfileUuid =
            normalizeUuid(matchingParticipant.customerProfile.uuid) ??
            matchingParticipant.customerProfile.uuid.toLowerCase();
          const existing = map.get(normalizedProfileUuid) || [];
          map.set(normalizedProfileUuid, [...existing, result]);
        }
      }
    });

    return map;
  }, [results, participants]);

  // Get findings for a specific profile
  const getFindingsForProfile = (profileUuid: string): ParticipantFinding[] => {
    const profileResults = resultsByProfile.get(profileUuid) || [];
    const findings: ParticipantFinding[] = [];

    profileResults.forEach((result) => {
      result.learnings?.forEach((learning) => {
        findings.push({
          id: learning.uuid,
          title: learning.learning,
          impact: learning.impact,
          sources: learning.sourceFilename ? [learning.sourceFilename] : [],
        });
      });
    });

    return findings;
  };

  // Get quotes for a specific profile
  // Quotes map 1:1 with assumptions - first quote relates to first assumption, etc.
  const getQuotesForProfile = (profileUuid: string): ParticipantQuote[] => {
    const profileResults = resultsByProfile.get(profileUuid) || [];
    const quotes: ParticipantQuote[] = [];

    profileResults.forEach((result) => {
      const validations = result.assumptionValidations || [];

      result.keyQuotes?.forEach((quote, quoteIndex) => {
        // Get the corresponding assumption statement as context
        const validation = validations[quoteIndex];
        const context = validation?.assumptionStatement || '';

        quotes.push({
          id: `${result.uuid}-quote-${quoteIndex}`,
          quote,
          context,
        });
      });
    });

    return quotes;
  };

  // Get profiles that have results (only show tabs for profiles with data)
  const profiles = useMemo(() => {
    return participants
      .map((p) => {
        const normalizedUuid =
          normalizeUuid(p.customerProfile.uuid) ??
          p.customerProfile.uuid.toLowerCase();
        return {
          uuid: normalizedUuid,
          originalUuid: p.customerProfile.uuid,
          name: p.customerProfile.name,
          segment: p.customerProfile.segment,
          avatarUrl: p.customerProfile.avatarUrl,
        };
      })
      .filter((profile) => {
        // Only include profiles that have results
        const profileResults = resultsByProfile.get(profile.uuid) || [];
        return profileResults.length > 0;
      });
  }, [participants, resultsByProfile]);

  // Active tab state - default to first profile with results
  const [activeTab, setActiveTab] = useState<string>(profiles[0]?.uuid || '');

  // State for expanded findings and quotes lists
  const [expandedFindings, setExpandedFindings] = useState(false);
  const [expandedQuotes, setExpandedQuotes] = useState(false);
  const INITIAL_FINDINGS_DISPLAY_COUNT = 4;
  const INITIAL_QUOTES_DISPLAY_COUNT = 4;

  // Don't render if no profiles
  if (profiles.length === 0) {
    return null;
  }

  return (
    <div className='space-y-5'>
      {/* Section Header */}
      <div className='flex items-center gap-2'>
        <User className='aucctus-stroke-brand-primary h-5 w-5' />
        <h4 className='aucctus-text-lg-semibold aucctus-text-brand-primary'>
          Results by Participant
        </h4>
      </div>

      {/* Tabs */}
      <div className='w-full'>
        {/* Tab List */}
        <div
          className='aucctus-bg-secondary-subtle mb-4 grid h-auto gap-1 rounded-lg p-1.5'
          style={{ gridTemplateColumns: `repeat(${profiles.length}, 1fr)` }}
        >
          {profiles.map((profile, index) => {
            const isActive = activeTab === profile.uuid;
            const color = PERSONA_COLORS[index % PERSONA_COLORS.length];

            return (
              <button
                key={profile.uuid}
                onClick={() => {
                  setActiveTab(profile.uuid);
                  setExpandedFindings(false); // Reset expanded state on tab change
                  setExpandedQuotes(false);
                }}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2.5 text-left transition-all',
                  isActive
                    ? 'aucctus-bg-primary shadow-sm'
                    : 'hover:bg-gray-100/50',
                )}
              >
                {/* Avatar */}
                <div
                  className='flex h-7 w-7 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border-2'
                  style={{
                    backgroundColor: `${color}20`,
                    borderColor: color,
                  }}
                >
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.name}
                      className='h-6 w-6 rounded-full object-cover'
                    />
                  ) : (
                    <span
                      className='text-[10px] font-semibold'
                      style={{ color }}
                    >
                      {profile.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </span>
                  )}
                </div>
                <span className='aucctus-text-sm-semibold aucctus-text-primary leading-tight'>
                  {profile.segment}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {profiles.map((profile, profileIndex) => {
          if (activeTab !== profile.uuid) return null;

          const allFindings = getFindingsForProfile(profile.uuid);
          const quotes = getQuotesForProfile(profile.uuid);
          const color = PERSONA_COLORS[profileIndex % PERSONA_COLORS.length];

          // Show limited findings unless expanded
          const displayedFindings = expandedFindings
            ? allFindings
            : allFindings.slice(0, INITIAL_FINDINGS_DISPLAY_COUNT);
          const hasMoreFindings =
            allFindings.length > INITIAL_FINDINGS_DISPLAY_COUNT;

          // Show limited quotes unless expanded
          const displayedQuotes = expandedQuotes
            ? quotes
            : quotes.slice(0, INITIAL_QUOTES_DISPLAY_COUNT);
          const hasMoreQuotes = quotes.length > INITIAL_QUOTES_DISPLAY_COUNT;

          return (
            <div key={profile.uuid} className='space-y-6'>
              {/* Findings Section */}
              <div>
                <div className='mb-3 flex items-center gap-2'>
                  <span className='aucctus-text-sm-semibold aucctus-text-primary'>
                    Findings
                  </span>
                  <span className='aucctus-bg-secondary aucctus-text-secondary flex h-5 items-center rounded-full px-1.5 text-xs font-semibold'>
                    {allFindings.length}
                  </span>
                </div>
                <div
                  className={cn(
                    'grid grid-cols-1 gap-4 md:grid-cols-2',
                    expandedFindings && 'max-h-[720px] overflow-y-auto pr-2',
                  )}
                >
                  {displayedFindings.map((finding) => (
                    <div
                      key={finding.id}
                      className='aucctus-bg-primary aucctus-border-secondary rounded-lg border p-4'
                    >
                      <h4 className='aucctus-text-md-medium aucctus-text-primary mb-2'>
                        {finding.title}
                      </h4>
                      <div>
                        <p className='aucctus-text-sm-medium aucctus-text-brand-primary mb-1'>
                          Impact
                        </p>
                        <p className='aucctus-text-sm aucctus-text-secondary'>
                          {finding.impact}
                        </p>
                      </div>
                      {finding.sources && finding.sources.length > 0 && (
                        <div className='mt-3'>
                          <SourceBadges
                            sources={finding.sources}
                            onSourceClick={onSourceClick}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Show More/Less Button */}
                {hasMoreFindings && (
                  <div className='flex justify-center pt-3'>
                    <button
                      onClick={() => setExpandedFindings(!expandedFindings)}
                      className='aucctus-text-secondary hover:aucctus-text-primary flex items-center gap-1 text-sm transition-colors'
                    >
                      {expandedFindings ? (
                        <>
                          <ChevronUp className='aucctus-stroke-secondary h-4 w-4' />
                          Show less
                        </>
                      ) : (
                        <>
                          <ChevronDown className='aucctus-stroke-secondary h-4 w-4' />
                          See all {allFindings.length} findings
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Quotes Section */}
              {quotes.length > 0 && (
                <div>
                  <div className='mb-3 flex items-center gap-2'>
                    <span className='aucctus-text-sm-semibold aucctus-text-primary'>
                      Quotes
                    </span>
                    <span className='aucctus-bg-secondary aucctus-text-secondary flex h-5 items-center rounded-full px-1.5 text-xs font-semibold'>
                      {quotes.length}
                    </span>
                  </div>
                  <div
                    className={cn(
                      'space-y-3',
                      expandedQuotes && 'max-h-[600px] overflow-y-auto pr-2',
                    )}
                  >
                    {displayedQuotes.map((quoteItem) => (
                      <div
                        key={quoteItem.id}
                        className='aucctus-bg-secondary-subtle rounded-lg border-l-4 p-4'
                        style={{ borderLeftColor: color }}
                      >
                        <div className='flex gap-3'>
                          <MessageCircle
                            className='mt-0.5 h-5 w-5 flex-shrink-0'
                            style={{ color }}
                          />
                          <div>
                            <p className='aucctus-text-sm aucctus-text-primary italic'>
                              &ldquo;{quoteItem.quote}&rdquo;
                            </p>
                            {quoteItem.context && (
                              <p className='aucctus-text-xs aucctus-text-tertiary mt-2'>
                                — On {quoteItem.context}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Show More/Less Button for Quotes */}
                  {hasMoreQuotes && (
                    <div className='flex justify-center pt-3'>
                      <button
                        onClick={() => setExpandedQuotes(!expandedQuotes)}
                        className='aucctus-text-secondary hover:aucctus-text-primary flex items-center gap-1 text-sm transition-colors'
                      >
                        {expandedQuotes ? (
                          <>
                            <ChevronUp className='aucctus-stroke-secondary h-4 w-4' />
                            Show less
                          </>
                        ) : (
                          <>
                            <ChevronDown className='aucctus-stroke-secondary h-4 w-4' />
                            See all {quotes.length} quotes
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResultsByParticipant;
