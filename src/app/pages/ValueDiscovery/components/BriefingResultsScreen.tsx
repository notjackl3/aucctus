import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@libs/utils/react';
import { DynamicIcon } from '@libs/utils/iconMap';
import { Sparkles, RotateCcw, Download } from 'lucide-react';
import { toast } from '@components';
import api from '@libs/api';
import { downloadPdf } from '@libs/utils/files';
import type {
  IExecutiveBriefing,
  IInnovationWorkflowRating,
  IGap,
  IAucctusCapabilityMapping,
  IActionableNextStep,
} from '@libs/api/types/valueDiscovery';

interface BriefingResultsScreenProps {
  briefing: IExecutiveBriefing;
  assessmentUuid: string | null;
  onRestart: () => void;
  onExportPdf?: (assessmentUuid: string) => Promise<void>;
}

// ==========================================
// Semantic color configs
// ==========================================

const severityConfig = {
  critical: {
    bg: 'aucctus-bg-error-subtle',
    border: 'aucctus-border-error-extra-subtle',
    text: 'aucctus-text-error-primary',
    icon: 'alert-triangle',
    accent: 'border-l-red-500',
  },
  significant: {
    bg: 'aucctus-bg-warning-subtle',
    border: 'aucctus-border-warning-extra-subtle',
    text: 'aucctus-text-warning-primary',
    icon: 'alert-circle',
    accent: 'border-l-amber-500',
  },
  moderate: {
    bg: 'aucctus-bg-info-subtle',
    border: 'aucctus-border-info-extra-subtle',
    text: 'aucctus-text-info-primary',
    icon: 'info',
    accent: 'border-l-blue-500',
  },
};

// ==========================================
// Section Label (Aucctus standard pattern)
// ==========================================

const SectionLabel = ({
  icon,
  label,
  badge,
}: {
  icon: string;
  label: string;
  badge?: string;
}) => (
  <div className='mb-4 flex items-center gap-2'>
    <DynamicIcon
      variant={icon}
      height={16}
      width={16}
      className='aucctus-stroke-tertiary'
    />
    <span className='aucctus-text-xs-semibold aucctus-text-tertiary uppercase tracking-wide'>
      {label}
    </span>
    {badge && (
      <span className='aucctus-bg-secondary aucctus-border-secondary aucctus-text-tertiary rounded border px-1.5 py-0.5 text-[10px]'>
        {badge}
      </span>
    )}
  </div>
);

// ==========================================
// Score Gauge
// ==========================================

const ScoreGauge = ({ score }: { score: number }) => {
  const size = 140;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(score, 0), 100);
  const offset = circumference - (progress / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 70) return '#22c55e';
    if (s >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const getLabel = (s: number) => {
    if (s >= 80) return 'Excellent';
    if (s >= 60) return 'Good';
    if (s >= 40) return 'Developing';
    if (s >= 20) return 'Early Stage';
    return 'Nascent';
  };

  const color = getColor(score);

  return (
    <div className='flex items-center gap-6'>
      <div className='relative inline-flex shrink-0 items-center justify-center'>
        <svg width={size} height={size} className='-rotate-90'>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill='none'
            className='aucctus-stroke-tertiary'
            strokeWidth={strokeWidth}
            opacity={0.15}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill='none'
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap='round'
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
          />
        </svg>
        <div className='absolute flex flex-col items-center'>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className='text-3xl font-bold'
            style={{ color }}
          >
            {score}
          </motion.span>
          <span className='aucctus-text-tertiary text-[10px]'>/ 100</span>
        </div>
      </div>
      <div>
        <p className='aucctus-text-primary aucctus-text-lg-semibold'>
          {getLabel(score)}
        </p>
        <p className='aucctus-text-tertiary aucctus-text-xs mt-1'>
          AI Readiness Score
        </p>
      </div>
    </div>
  );
};

// ==========================================
// Workflow Rating Card
// ==========================================

const getBarColor = (score: number) => {
  if (score >= 7) return 'bg-emerald-500';
  if (score >= 4) return 'bg-amber-500';
  return 'bg-red-500';
};

const WorkflowRatingCard = ({
  rating,
  index,
}: {
  rating: IInnovationWorkflowRating;
  index: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.3 }}
      whileHover={{ y: -4 }}
      className='aucctus-bg-primary aucctus-border-secondary rounded-xl border p-5 transition-shadow hover:shadow-lg'
    >
      <h4 className='aucctus-text-primary aucctus-text-sm-semibold mb-3'>
        {rating.workflowName}
      </h4>

      {/* Current State bar */}
      <div className='mb-2'>
        <div className='mb-1 flex items-center justify-between'>
          <span className='aucctus-text-tertiary text-[11px]'>
            Current State
          </span>
          <span className='aucctus-text-secondary text-[11px] font-semibold'>
            {rating.currentScore}/10
          </span>
        </div>
        <div className='aucctus-bg-secondary h-2 overflow-hidden rounded-full'>
          <motion.div
            className={cn(
              'h-full rounded-full',
              getBarColor(rating.currentScore),
            )}
            initial={{ width: 0 }}
            animate={{ width: `${(rating.currentScore / 10) * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 * index }}
          />
        </div>
      </div>

      {/* AI Opportunity bar */}
      <div className='mb-3'>
        <div className='mb-1 flex items-center justify-between'>
          <span className='aucctus-text-tertiary text-[11px]'>
            AI Opportunity
          </span>
          <span className='aucctus-text-secondary text-[11px] font-semibold'>
            {rating.aiOpportunityScore}/10
          </span>
        </div>
        <div className='aucctus-bg-secondary h-2 overflow-hidden rounded-full'>
          <motion.div
            className={cn(
              'h-full rounded-full',
              getBarColor(rating.aiOpportunityScore),
            )}
            initial={{ width: 0 }}
            animate={{
              width: `${(rating.aiOpportunityScore / 10) * 100}%`,
            }}
            transition={{
              duration: 0.8,
              ease: 'easeOut',
              delay: 0.1 * index + 0.15,
            }}
          />
        </div>
      </div>

      <p className='aucctus-text-secondary aucctus-text-xs mb-2 leading-relaxed'>
        {rating.description}
      </p>
      <p className='aucctus-text-tertiary text-[11px] italic'>
        {rating.recommendation}
      </p>
    </motion.div>
  );
};

// ==========================================
// Gap Card
// ==========================================

const GapCard = ({ gap, index }: { gap: IGap; index: number }) => {
  const config = severityConfig[gap.severity];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.3 }}
      whileHover={{ y: -4 }}
      className={cn(
        'aucctus-bg-primary aucctus-border-secondary rounded-xl border border-l-4 p-5 transition-shadow hover:shadow-lg',
        config.accent,
      )}
    >
      <div className='mb-2 flex items-center gap-2'>
        <DynamicIcon
          variant={config.icon}
          height={16}
          width={16}
          className={cn('stroke-current', config.text)}
        />
        <h4 className='aucctus-text-primary aucctus-text-sm-semibold'>
          {gap.area}
        </h4>
      </div>
      <p className='aucctus-text-secondary aucctus-text-xs mb-2 leading-relaxed'>
        {gap.description}
      </p>
      <p className='aucctus-text-tertiary text-[11px] italic'>
        Evidence: {gap.evidence}
      </p>
    </motion.div>
  );
};

// ==========================================
// Capability Mapping Card
// ==========================================

const CapabilityMappingCard = ({
  mapping,
  index,
}: {
  mapping: IAucctusCapabilityMapping;
  index: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.3 }}
      whileHover={{ y: -4 }}
      className='aucctus-bg-primary aucctus-border-secondary rounded-xl border p-5 transition-shadow hover:shadow-lg'
    >
      <div className='mb-3 flex items-start gap-3'>
        <div className='aucctus-bg-secondary shrink-0 rounded-lg p-2'>
          <DynamicIcon
            variant='link-03'
            height={16}
            width={16}
            className='aucctus-stroke-brand-primary'
          />
        </div>
        <div>
          <h4 className='aucctus-text-primary aucctus-text-sm-semibold'>
            {mapping.need}
          </h4>
          <span className='aucctus-text-tertiary text-[11px] font-medium'>
            {mapping.aucctusCapability}
          </span>
        </div>
      </div>
      <p className='aucctus-text-secondary aucctus-text-xs leading-relaxed'>
        {mapping.howItHelps}
      </p>
    </motion.div>
  );
};

// ==========================================
// Next Step Item
// ==========================================

const NextStepItem = ({
  step,
  index,
  isLast,
}: {
  step: IActionableNextStep;
  index: number;
  isLast: boolean;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.3 }}
      className='flex gap-4'
    >
      <div className='flex shrink-0 flex-col items-center'>
        <div className='aucctus-bg-brand-solid flex h-7 w-7 items-center justify-center rounded-full'>
          <span className='text-xs font-bold text-white'>
            {step.stepNumber}
          </span>
        </div>
        {!isLast && (
          <div className='aucctus-border-secondary mt-1 h-full w-px border-r' />
        )}
      </div>
      <div className='pb-5'>
        <h4 className='aucctus-text-primary aucctus-text-sm-semibold'>
          {step.title}
        </h4>
        <p className='aucctus-text-secondary aucctus-text-xs mt-1 leading-relaxed'>
          {step.description}
        </p>
        <span className='aucctus-bg-secondary aucctus-border-secondary aucctus-text-tertiary mt-2 inline-block rounded border px-1.5 py-0.5 text-[10px]'>
          {step.timeline}
        </span>
      </div>
    </motion.div>
  );
};

// ==========================================
// Main Component
// ==========================================

export const BriefingResultsScreen = ({
  briefing,
  assessmentUuid,
  onRestart,
  onExportPdf,
}: BriefingResultsScreenProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPdf = async () => {
    if (!assessmentUuid) return;
    try {
      setIsExporting(true);
      if (onExportPdf) {
        await onExportPdf(assessmentUuid);
      } else {
        const blob = await api.valueDiscovery.exportBriefingPdf(assessmentUuid);
        await downloadPdf(blob, 'executive_briefing.pdf');
      }
    } catch {
      toast.error(
        'Export Failed',
        'Could not generate the PDF. Please try again.',
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className='space-y-6'>
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='flex items-center justify-between'
      >
        <div className='flex items-center gap-3'>
          <div className='aucctus-bg-secondary rounded-lg p-2'>
            <Sparkles size={20} className='aucctus-stroke-brand-primary' />
          </div>
          <div>
            <h1 className='aucctus-text-primary aucctus-text-xl-semibold'>
              Executive Briefing
            </h1>
            <p className='aucctus-text-tertiary aucctus-text-xs'>
              Innovation process AI acceleration analysis
            </p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <button
            onClick={handleExportPdf}
            disabled={isExporting}
            className='aucctus-text-sm-medium aucctus-bg-primary-hover aucctus-text-secondary-hover flex items-center gap-2 rounded-lg px-3 py-1.5 disabled:opacity-50'
          >
            <Download size={14} className='stroke-current' />
            {isExporting ? 'Exporting...' : 'Download PDF'}
          </button>
          <button
            onClick={onRestart}
            className='aucctus-text-sm-medium aucctus-bg-primary-hover aucctus-text-secondary-hover flex items-center gap-2 rounded-lg px-3 py-1.5'
          >
            <RotateCcw size={14} className='stroke-current' />
            New Assessment
          </button>
        </div>
      </motion.div>

      {/* Score + Key Insight Row */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className='aucctus-bg-primary aucctus-border-secondary rounded-xl border p-6'
        >
          <SectionLabel icon='activity' label='AI Readiness Score' />
          <ScoreGauge score={briefing.aiReadinessScore} />
        </motion.div>

        {/* Key Insight Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className='aucctus-bg-warning-subtle aucctus-border-warning-extra-subtle rounded-xl border p-6'
        >
          <div className='mb-3 flex items-center gap-2'>
            <DynamicIcon
              variant='lightbulb-05'
              height={16}
              width={16}
              className='aucctus-stroke-warning-primary'
            />
            <span className='aucctus-text-xs-semibold aucctus-text-warning-primary uppercase tracking-wide'>
              Key Insight
            </span>
          </div>
          <p className='aucctus-text-primary aucctus-text-sm leading-relaxed'>
            {briefing.keyInsight}
          </p>
        </motion.div>
      </div>

      {/* Executive Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className='aucctus-bg-primary aucctus-border-secondary rounded-xl border p-6'
      >
        <SectionLabel icon='file-06' label='Executive Summary' />
        <p className='aucctus-text-secondary aucctus-text-sm whitespace-pre-line leading-relaxed'>
          {briefing.executiveSummary}
        </p>
      </motion.div>

      {/* Innovation Workflow Ratings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <SectionLabel
          icon='target-04'
          label='Innovation Workflow Ratings'
          badge={`${briefing.innovationWorkflowRatings.length} workflows`}
        />
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {briefing.innovationWorkflowRatings.map((rating, i) => (
            <WorkflowRatingCard
              key={rating.workflowName}
              rating={rating}
              index={i}
            />
          ))}
        </div>
      </motion.div>

      {/* Innovation Bottlenecks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <SectionLabel
          icon='alert-triangle'
          label='Innovation Bottlenecks'
          badge={`${briefing.innovationBottlenecks.length} identified`}
        />
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {briefing.innovationBottlenecks.map((gap, i) => (
            <GapCard key={gap.area} gap={gap} index={i} />
          ))}
        </div>
      </motion.div>

      {/* Aucctus Capability Mapping */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <SectionLabel
          icon='puzzle-piece-02'
          label='Aucctus Capability Mapping'
        />
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {briefing.aucctusCapabilityMapping.map((mapping, i) => (
            <CapabilityMappingCard
              key={mapping.need}
              mapping={mapping}
              index={i}
            />
          ))}
        </div>
      </motion.div>

      {/* Actionable Next Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className='aucctus-bg-primary aucctus-border-secondary rounded-xl border p-6'
      >
        <SectionLabel icon='list' label='Actionable Next Steps' />
        <div className='space-y-0'>
          {briefing.actionableNextSteps.map((step, i) => (
            <NextStepItem
              key={step.stepNumber}
              step={step}
              index={i}
              isLast={i === briefing.actionableNextSteps.length - 1}
            />
          ))}
        </div>
      </motion.div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className='flex justify-center pb-8 pt-4'
      >
        <button
          onClick={onRestart}
          className='btn btn-primary flex items-center gap-2'
        >
          <RotateCcw size={16} className='stroke-current' />
          Start New Assessment
        </button>
      </motion.div>
    </div>
  );
};
