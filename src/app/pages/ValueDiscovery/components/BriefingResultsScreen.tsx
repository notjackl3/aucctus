import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@libs/utils/react';
import { DynamicIcon } from '@libs/utils/iconMap';
import { Sparkles, RotateCcw, Download, ExternalLink } from 'lucide-react';
import { toast } from '@components';
import api from '@libs/api';
import { downloadPdf } from '@libs/utils/files';
import type {
  IExecutiveBriefing,
  IRecommendedEngine,
} from '@libs/api/types/valueDiscovery';

interface BriefingResultsScreenProps {
  briefing: IExecutiveBriefing;
  assessmentUuid: string | null;
  onRestart: () => void;
  onExportPdf?: (assessmentUuid: string) => Promise<void>;
}

// ==========================================
// Score Bar Colors
// ==========================================

const getImpactColor = (score: number): string => {
  if (score >= 7) return 'bg-orange-500';
  if (score >= 4) return 'bg-orange-400';
  return 'bg-orange-300';
};

const getFeasibilityColor = (score: number): string => {
  if (score >= 7) return 'bg-emerald-500';
  if (score >= 4) return 'bg-emerald-400';
  return 'bg-emerald-300';
};

const getStrategicColor = (score: number): string => {
  if (score >= 7) return 'bg-amber-500';
  if (score >= 4) return 'bg-amber-400';
  return 'bg-amber-300';
};

const getTotalScoreColor = (total: number): string => {
  if (total >= 24) return 'text-emerald-500';
  if (total >= 18) return 'text-amber-500';
  return 'text-red-500';
};

// ==========================================
// Score Bar
// ==========================================

const ScoreBar = ({
  score,
  colorClass,
  delay = 0,
}: {
  score: number;
  colorClass: string;
  delay?: number;
}) => (
  <div className='flex items-center gap-2'>
    <div className='aucctus-bg-tertiary h-1.5 w-12 overflow-hidden rounded-full'>
      <motion.div
        className={cn('h-full rounded-full', colorClass)}
        initial={{ width: 0 }}
        animate={{ width: `${(score / 10) * 100}%` }}
        transition={{ duration: 0.8, ease: 'easeOut', delay }}
      />
    </div>
    <span className='aucctus-text-secondary w-4 text-right text-xs font-semibold'>
      {score}
    </span>
  </div>
);

// ==========================================
// Engine Row
// ==========================================

const EngineRow = ({
  engine,
  index,
}: {
  engine: IRecommendedEngine;
  index: number;
}) => {
  const baseDelay = 0.1 * index;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: baseDelay, duration: 0.3 }}
      className='aucctus-border-secondary border-b last:border-b-0'
    >
      <div className='grid grid-cols-12 items-center gap-3 px-4 py-4'>
        {/* Stage */}
        <div className='col-span-2'>
          <span className='aucctus-text-tertiary text-[10px] font-medium uppercase tracking-wider'>
            {engine.innovationStage}
          </span>
        </div>

        {/* Engine Name */}
        <div className='col-span-3'>
          <h4 className='aucctus-text-primary text-sm font-semibold'>
            {engine.engineName}
          </h4>
        </div>

        {/* Impact */}
        <div className='col-span-2'>
          <ScoreBar
            score={engine.impactScore}
            colorClass={getImpactColor(engine.impactScore)}
            delay={baseDelay + 0.1}
          />
        </div>

        {/* Feasibility */}
        <div className='col-span-2'>
          <ScoreBar
            score={engine.feasibilityScore}
            colorClass={getFeasibilityColor(engine.feasibilityScore)}
            delay={baseDelay + 0.2}
          />
        </div>

        {/* Strategic */}
        <div className='col-span-1'>
          <ScoreBar
            score={engine.strategicValueScore}
            colorClass={getStrategicColor(engine.strategicValueScore)}
            delay={baseDelay + 0.3}
          />
        </div>

        {/* Total */}
        <div className='col-span-1 text-center'>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: baseDelay + 0.4 }}
            className={cn(
              'text-xl font-bold',
              getTotalScoreColor(engine.totalScore),
            )}
          >
            {engine.totalScore}
          </motion.span>
        </div>

        {/* Priority */}
        <div className='col-span-1 text-center'>
          <span className='aucctus-bg-brand-solid inline-block rounded px-2 py-0.5 text-[10px] font-bold text-white'>
            #{engine.priorityRank}
          </span>
        </div>
      </div>

      {/* Description row */}
      <div className='px-4 pb-4'>
        <p className='aucctus-text-tertiary text-xs leading-relaxed'>
          {engine.description}
        </p>
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

  // V2 detection
  const isV2 = !!briefing.companyProfile;

  const handleExportPdf = async () => {
    if (!assessmentUuid) return;
    try {
      setIsExporting(true);
      if (onExportPdf) {
        await onExportPdf(assessmentUuid);
      } else {
        const blob =
          await api.valueDiscovery.exportBriefingPdfPublic(assessmentUuid);
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

  if (!isV2) {
    // V1 fallback — simple JSON display
    return (
      <div className='space-y-6'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='flex items-center justify-between'
        >
          <div className='flex items-center gap-3'>
            <div className='aucctus-bg-secondary rounded-lg p-2'>
              <Sparkles size={20} className='aucctus-stroke-brand-primary' />
            </div>
            <h1 className='aucctus-text-primary aucctus-text-xl-semibold'>
              Executive Briefing
            </h1>
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
        <div className='aucctus-bg-primary aucctus-border-secondary rounded-xl border p-6'>
          <p className='aucctus-text-secondary text-sm'>
            This briefing was generated with an earlier version. Please download
            the PDF to view the full report.
          </p>
        </div>
      </div>
    );
  }

  const companyProfile = briefing.companyProfile!;
  const narrativeSummary = briefing.narrativeSummary!;
  const recommendedEngines = briefing.recommendedEngines!;
  const lowestHangingFruit = briefing.lowestHangingFruit!;

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
              AI Innovation Deployment Analysis
            </h1>
            <p className='aucctus-text-tertiary aucctus-text-xs'>
              Personalized for {companyProfile.companyName}
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

      {/* Company Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className='aucctus-bg-primary aucctus-border-secondary rounded-xl border p-6'
      >
        <div className='mb-4'>
          <h2 className='aucctus-text-primary text-2xl font-bold'>
            {companyProfile.companyName}
          </h2>
          <span className='mt-1 inline-block rounded bg-primary-600/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-primary-600'>
            {companyProfile.industryTag}
          </span>
        </div>
        <div className='aucctus-border-secondary grid grid-cols-4 gap-4 border-t pt-4'>
          <div>
            <div className='aucctus-text-tertiary text-[10px] font-semibold uppercase tracking-wide'>
              Revenue
            </div>
            <div className='aucctus-text-primary text-sm font-semibold'>
              {companyProfile.estimatedRevenue || 'N/A'}
            </div>
          </div>
          <div>
            <div className='aucctus-text-tertiary text-[10px] font-semibold uppercase tracking-wide'>
              Employees
            </div>
            <div className='aucctus-text-primary text-sm font-semibold'>
              {companyProfile.estimatedEmployees || 'N/A'}
            </div>
          </div>
          <div>
            <div className='aucctus-text-tertiary text-[10px] font-semibold uppercase tracking-wide'>
              Innovation Maturity
            </div>
            <div className='aucctus-text-primary text-sm font-semibold'>
              {companyProfile.innovationMaturity || 'N/A'}
            </div>
          </div>
          <div>
            <div className='aucctus-text-tertiary text-[10px] font-semibold uppercase tracking-wide'>
              AI Readiness
            </div>
            <div className='aucctus-text-primary text-sm font-semibold'>
              {companyProfile.aiReadiness || 'N/A'}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Narrative Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className='aucctus-bg-primary aucctus-border-secondary rounded-xl border p-6'
      >
        <div className='mb-3 flex items-center gap-2'>
          <DynamicIcon
            variant='file-06'
            height={16}
            width={16}
            className='aucctus-stroke-tertiary'
          />
          <span className='aucctus-text-xs-semibold aucctus-text-tertiary uppercase tracking-wide'>
            Analysis
          </span>
        </div>
        <p className='aucctus-text-secondary text-sm leading-relaxed'>
          {narrativeSummary}
        </p>
      </motion.div>

      {/* Recommended Aucctus Engines */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className='mb-2 flex items-center gap-2'>
          <DynamicIcon
            variant='target-04'
            height={16}
            width={16}
            className='aucctus-stroke-tertiary'
          />
          <span className='aucctus-text-xs-semibold aucctus-text-tertiary uppercase tracking-wide'>
            Recommended Aucctus Engines
          </span>
        </div>
        <p className='aucctus-text-tertiary mb-4 text-xs italic'>
          Scored on Impact, Feasibility, and Strategic Value — calibrated to{' '}
          {companyProfile.companyName}&apos;s context
        </p>

        <div className='aucctus-bg-primary aucctus-border-secondary overflow-hidden rounded-xl border'>
          {/* Table Header */}
          <div className='aucctus-bg-secondary grid grid-cols-12 gap-3 px-4 py-3'>
            <div className='col-span-2'>
              <span className='aucctus-text-tertiary text-[10px] font-semibold uppercase tracking-wide'>
                Stage
              </span>
            </div>
            <div className='col-span-3'>
              <span className='aucctus-text-tertiary text-[10px] font-semibold uppercase tracking-wide'>
                AI Engine
              </span>
            </div>
            <div className='col-span-2'>
              <span className='text-[10px] font-semibold uppercase tracking-wide text-orange-500'>
                Impact
              </span>
            </div>
            <div className='col-span-2'>
              <span className='text-[10px] font-semibold uppercase tracking-wide text-emerald-500'>
                Feasibility
              </span>
            </div>
            <div className='col-span-1'>
              <span className='text-[10px] font-semibold uppercase tracking-wide text-amber-500'>
                Strategic
              </span>
            </div>
            <div className='col-span-1 text-center'>
              <span className='aucctus-text-tertiary text-[10px] font-semibold uppercase tracking-wide'>
                Total
              </span>
            </div>
            <div className='col-span-1 text-center'>
              <span className='aucctus-text-tertiary text-[10px] font-semibold uppercase tracking-wide'>
                Priority
              </span>
            </div>
          </div>

          {/* Engine Rows */}
          {recommendedEngines.map((engine, i) => (
            <EngineRow key={engine.engineName} engine={engine} index={i} />
          ))}
        </div>
      </motion.div>

      {/* Lowest-Hanging Fruit */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className='overflow-hidden rounded-xl border-2 border-primary-600/30 bg-gradient-to-br from-primary-600/5 to-transparent p-6'
      >
        <div className='mb-3 flex items-center gap-2'>
          <span className='text-sm'>⚡</span>
          <span className='text-xs font-bold uppercase tracking-widest text-primary-600'>
            Lowest-Hanging Fruit
          </span>
        </div>
        <h3 className='aucctus-text-primary mb-3 text-lg font-bold'>
          {lowestHangingFruit.title}
        </h3>
        <p className='aucctus-text-secondary mb-4 text-sm leading-relaxed'>
          {lowestHangingFruit.description}
        </p>

        <div className='mb-2'>
          <span className='aucctus-text-tertiary text-[10px] font-semibold uppercase tracking-wide'>
            Why Now
          </span>
          <p className='aucctus-text-secondary mt-1 text-sm leading-relaxed'>
            {lowestHangingFruit.whyNow}
          </p>
        </div>

        <div>
          <span className='aucctus-text-tertiary text-[10px] font-semibold uppercase tracking-wide'>
            How Aucctus Builds This
          </span>
          <p className='aucctus-text-secondary mt-1 text-sm leading-relaxed'>
            {lowestHangingFruit.titanBuildHook}
          </p>
        </div>
      </motion.div>

      {/* Book a Call CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className='aucctus-bg-primary aucctus-border-secondary flex flex-col items-center rounded-xl border p-8 text-center'
      >
        <h3 className='aucctus-text-primary mb-2 text-lg font-semibold'>
          Ready to Build Your First AI Engine?
        </h3>
        <p className='aucctus-text-tertiary mb-6 max-w-md text-sm'>
          Book a call with Aucctus to discuss your custom AI innovation
          deployment roadmap.
        </p>
        <a
          href='https://www.aucctus.com/contact'
          target='_blank'
          rel='noopener noreferrer'
          className='btn btn-primary flex items-center gap-2'
        >
          <ExternalLink size={16} className='stroke-current' />
          Book a Call with Aucctus
        </a>
        <div className='mt-4 flex items-center gap-3'>
          <button
            onClick={handleExportPdf}
            disabled={isExporting}
            className='aucctus-text-sm-medium aucctus-text-tertiary flex items-center gap-1.5 hover:underline disabled:opacity-50'
          >
            <Download size={12} className='stroke-current' />
            {isExporting ? 'Exporting...' : 'Download PDF'}
          </button>
          <span className='aucctus-text-tertiary'>·</span>
          <button
            onClick={onRestart}
            className='aucctus-text-sm-medium aucctus-text-tertiary flex items-center gap-1.5 hover:underline'
          >
            <RotateCcw size={12} className='stroke-current' />
            New Assessment
          </button>
        </div>
      </motion.div>
    </div>
  );
};
