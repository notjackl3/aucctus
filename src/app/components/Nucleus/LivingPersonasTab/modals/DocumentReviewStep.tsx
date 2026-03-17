/**
 * DocumentReviewStep — Review body and footer for the document upload modal.
 *
 * Renders the insights grid (proposed changes + context/FYI sections)
 * and the save/cancel footer bar.
 */

import { motion } from 'framer-motion';
import React from 'react';
import {
  FileText,
  Sparkles,
  CheckCircle2,
  BookOpen,
  AlertCircle,
  Check,
} from 'lucide-react';
import type { InsightItem } from './DocumentUploadModal.types';
import InsightCard from './InsightCard';

export interface DocumentReviewStepProps {
  insights: InsightItem[];
  changeInsights: InsightItem[];
  contextInsights: InsightItem[];
  pendingCount: number;
  approvedCount: number;
  isSaving: boolean;
  onApprove: (uuid: string) => void;
  onReject: (uuid: string) => void;
  onUndo: (uuid: string) => void;
  onApproveAll: () => void;
  onComplete: () => void;
  onClose: () => void;
}

/** Review step body — rendered inside the modal's content area */
export const DocumentReviewStep: React.FC<DocumentReviewStepProps> = ({
  insights,
  changeInsights,
  contextInsights,
  pendingCount,
  onApprove,
  onReject,
  onUndo,
  onApproveAll,
  onClose,
}) => (
  <motion.div
    key='review'
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2 }}
  >
    {insights.length === 0 ? (
      <div className='py-12 text-center'>
        <div className='aucctus-bg-secondary mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full'>
          <FileText className='aucctus-text-secondary h-6 w-6' />
        </div>
        <h4 className='aucctus-text-sm-medium aucctus-text-primary mb-1'>
          No actionable insights found
        </h4>
        <p className='aucctus-text-tertiary text-sm'>
          The document was processed but no changes were extracted.
        </p>
        <button
          type='button'
          onClick={onClose}
          className='btn btn-light btn-sm mt-4'
        >
          Close
        </button>
      </div>
    ) : (
      <>
        {/* Summary */}
        <div className='mb-5 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-1.5 text-sm'>
              <Sparkles className='h-4 w-4 text-primary-600 dark:text-primary-400' />
              <span className='aucctus-text-sm-medium aucctus-text-primary'>
                {insights.length} insights found
              </span>
            </div>
            <div className='aucctus-border-secondary h-4 w-px' />
            <div className='aucctus-text-tertiary flex items-center gap-2 text-xs'>
              <span>{changeInsights.length} changes</span>
              <span>&middot;</span>
              <span>{contextInsights.length} context</span>
            </div>
          </div>
          <button
            type='button'
            className='btn btn-light btn-sm h-7 gap-1.5 text-xs'
            onClick={onApproveAll}
            disabled={pendingCount === 0}
          >
            <CheckCircle2 className='h-3.5 w-3.5' />
            Accept All
          </button>
        </div>

        {/* Insights Grid */}
        <div className='max-h-[400px] space-y-4 overflow-y-auto pr-1'>
          {/* Proposed Changes Section */}
          {changeInsights.length > 0 && (
            <div>
              <h4 className='aucctus-text-tertiary mb-3 text-xs font-medium uppercase tracking-wide'>
                Proposed Changes
              </h4>
              <div className='space-y-3'>
                {changeInsights.map((insight) => (
                  <InsightCard
                    key={insight.uuid}
                    insight={insight}
                    onApprove={onApprove}
                    onReject={onReject}
                    onUndo={onUndo}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Context / FYI Section */}
          {contextInsights.length > 0 && (
            <div className='pt-2'>
              <h4 className='aucctus-text-tertiary mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide'>
                <BookOpen className='h-3.5 w-3.5' />
                For Your Information
              </h4>
              <div className='space-y-3'>
                {contextInsights.map((insight) => (
                  <InsightCard
                    key={insight.uuid}
                    insight={insight}
                    onApprove={onApprove}
                    onReject={onReject}
                    onUndo={onUndo}
                    isContext
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </>
    )}
  </motion.div>
);

/** Review step footer — rendered outside the modal's content area */
export const DocumentReviewStepFooter: React.FC<
  Pick<
    DocumentReviewStepProps,
    'approvedCount' | 'isSaving' | 'onComplete' | 'onClose'
  >
> = ({ approvedCount, isSaving, onComplete, onClose }) => (
  <div className='aucctus-border-secondary aucctus-bg-secondary flex items-center justify-between border-t px-6 py-4'>
    <div className='aucctus-text-tertiary flex items-center gap-2 text-xs'>
      <AlertCircle className='h-3.5 w-3.5' />
      <span>Changes are permanently applied after saving</span>
    </div>
    <div className='flex items-center gap-2'>
      <button
        type='button'
        onClick={onClose}
        className='btn btn-light btn-sm h-8'
      >
        Cancel
      </button>
      <button
        type='button'
        onClick={onComplete}
        disabled={approvedCount === 0 || isSaving}
        className='btn btn-primary btn-sm h-8 gap-1.5'
      >
        {isSaving ? (
          <div className='h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent' />
        ) : (
          <Check className='h-3.5 w-3.5' />
        )}
        Save {approvedCount} Change{approvedCount !== 1 ? 's' : ''}
      </button>
    </div>
  </div>
);
