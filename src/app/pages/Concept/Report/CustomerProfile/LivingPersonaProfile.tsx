/**
 * LivingPersonaProfile - Renders a living persona as the primary customer profile
 * in the concept report's customer profile section.
 *
 * Reuses PersonaOverviewSection and PersonaWidgetGrid in read-only mode,
 * with a "Living Persona" badge and a link to the full persona page in Nucleus.
 */

import { motion } from 'framer-motion';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usePersona } from '@hooks/query/persona.hook';
import PersonaOverviewSection from '@components/Nucleus/LivingPersonasTab/PersonaOverviewSection';
import {
  PersonaWidgetGrid,
  QuotesCarouselWidget,
} from '@components/Nucleus/LivingPersonasTab/widgets';
import type {
  PersonaWidgetData,
  WidgetConfig,
} from '@components/Nucleus/LivingPersonasTab/widgets';
import type { PersonaQuote } from '@components/Nucleus/LivingPersonasTab/widgets/QuotesCarouselWidget';
import type { CardListItem } from '@components/Nucleus/LivingPersonasTab/widgets/CardListWidget';
import type { GainItem } from '@components/Nucleus/LivingPersonasTab/widgets/GainsWidget';
import type { SocialValueItem } from '@components/Nucleus/LivingPersonasTab/widgets/SocialValuesWidget';
import { ConceptReportSkeletons } from '@components';
import { ExternalLink, Sparkles } from 'lucide-react';
import { AppPath } from '@routes/routes';
import { cn } from '@libs/utils/react';

const { ProfileOverviewSkeleton, SkeletonBlock } = ConceptReportSkeletons;

/** Default read-only widget config (no editing, no layout mode) */
const READ_ONLY_WIDGET_CONFIG: WidgetConfig[] = [
  { id: 'jobs', label: 'Jobs to be Done', visible: true, size: 'small' },
  { id: 'pains', label: 'Pain Points', visible: true, size: 'small' },
  { id: 'gains', label: 'Gains', visible: true, size: 'small' },
  { id: 'socialValues', label: 'Social Values', visible: true, size: 'small' },
  {
    id: 'motivationsBehaviours',
    label: 'Motivations & Behaviours',
    visible: true,
    size: 'small',
  },
  { id: 'keyFacts', label: 'Key Facts', visible: true, size: 'small' },
  {
    id: 'timeline',
    label: 'A Day in Their Life',
    visible: true,
    size: 'full',
  },
];

/** Maps IPersona data to PersonaWidgetData for the read-only grid */
const mapToWidgetData = (persona: {
  jobsToBeDone: Array<{ uuid: string; text: string; priority: number }>;
  pains: Array<{ uuid: string; text: string; severity: number }>;
  gains: Array<{ uuid: string; text: string; impact: number }>;
  socialValues: Array<{ uuid: string; title: string; description?: string }>;
  motivations: Array<{ uuid: string; text: string; priority: number }>;
  behaviours: Array<{ uuid: string; text: string }>;
  keyFacts: Array<{
    uuid: string;
    stat: string;
    label: string;
    trend: string;
  }>;
  quotes: Array<{ uuid: string; text: string; context?: string }>;
  workdaySteps: Array<{
    uuid: string;
    time: string;
    title: string;
    description?: string;
    isProductIntervention: boolean;
  }>;
}): PersonaWidgetData => ({
  jobsToBeDone: persona.jobsToBeDone.map(
    (j): CardListItem => ({
      uuid: j.uuid,
      text: j.text,
      priority: j.priority,
    }),
  ),
  pains: persona.pains.map(
    (p): CardListItem => ({
      uuid: p.uuid,
      text: p.text,
      severity: p.severity,
    }),
  ),
  gains: persona.gains.map(
    (g): GainItem => ({
      uuid: g.uuid,
      text: g.text,
      impact: g.impact,
    }),
  ),
  socialValues: persona.socialValues.map(
    (sv): SocialValueItem => ({
      uuid: sv.uuid,
      title: sv.title,
      description: sv.description,
    }),
  ),
  motivations: persona.motivations.map((m) => ({
    uuid: m.uuid,
    text: m.text,
    priority: m.priority,
  })),
  behaviours: persona.behaviours.map((b) => ({
    uuid: b.uuid,
    text: b.text,
  })),
  keyFacts: persona.keyFacts.map((kf) => ({
    uuid: kf.uuid,
    stat: kf.stat,
    label: kf.label,
    trend: kf.trend as 'up' | 'down' | 'neutral',
  })),
  quotes: persona.quotes.map(
    (q): PersonaQuote => ({
      uuid: q.uuid,
      text: q.text,
      context: q.context ?? '',
    }),
  ),
  workdaySteps: persona.workdaySteps.map((ws) => ({
    uuid: ws.uuid,
    time: ws.time,
    title: ws.title,
    description: ws.description ?? '',
    isProductIntervention: ws.isProductIntervention,
  })),
});

export interface LivingPersonaProfileProps {
  personaUuid: string;
  className?: string;
}

const LivingPersonaProfile: React.FC<LivingPersonaProfileProps> = ({
  personaUuid,
  className,
}) => {
  const { persona, isLoading } = usePersona(personaUuid);

  const widgetData = useMemo(() => {
    if (!persona) return undefined;
    return mapToWidgetData(persona);
  }, [persona]);

  if (isLoading || !persona) {
    return (
      <div className={cn('flex w-full flex-col gap-6', className)}>
        <ProfileOverviewSkeleton />
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className='aucctus-bg-primary aucctus-border-secondary flex flex-col gap-3 rounded-lg border p-4 shadow-sm'
            >
              <SkeletonBlock className='h-5 w-40' />
              <SkeletonBlock className='h-3 w-28' />
              <SkeletonBlock className='h-4 w-full' />
              <SkeletonBlock className='h-4 w-3/4' />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('flex w-full flex-col gap-6', className)}
    >
      {/* Living Persona badge + link to Nucleus */}
      <div className='flex items-center justify-between'>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className='flex items-center gap-2'
        >
          <span className='inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-100 px-3 py-1.5 text-sm font-medium text-purple-700 dark:border-purple-800 dark:bg-purple-900/30 dark:text-purple-300'>
            <Sparkles className='h-3.5 w-3.5' />
            Living Persona
          </span>
        </motion.div>
        <Link
          to={`${AppPath.Nucleus}?tab=living-personas&persona=${personaUuid}`}
          className='aucctus-text-tertiary hover:aucctus-text-secondary inline-flex items-center gap-1.5 text-sm transition-colors'
        >
          View in Nucleus
          <ExternalLink className='h-3.5 w-3.5' />
        </Link>
      </div>

      {/* Persona Overview (read-only) */}
      <PersonaOverviewSection
        name={persona.segment}
        representativeName={persona.name}
        avatar={persona.avatar}
        themeColor={persona.themeColor}
        tags={persona.tags}
        demographics={persona.demographics}
        overview={persona.overview}
        isEditable={false}
      />

      {/* Quotes Carousel */}
      {widgetData?.quotes && widgetData.quotes.length > 0 && (
        <QuotesCarouselWidget quotes={widgetData.quotes as PersonaQuote[]} />
      )}

      {/* Widget Grid (read-only, no layout mode) */}
      {widgetData && (
        <PersonaWidgetGrid
          data={widgetData}
          isLayoutMode={false}
          widgetConfig={READ_ONLY_WIDGET_CONFIG}
        />
      )}
    </motion.div>
  );
};

export default LivingPersonaProfile;
