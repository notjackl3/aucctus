/**
 * DocumentUploadModal - 3-step modal for uploading training documents
 *
 * Steps:
 * 1. Upload: Drag-and-drop file zone
 * 2. Processing: Real-time WebSocket stage indicators
 * 3. Review: Extracted insights with approve/reject per item
 *
 * Integrates with the persona evidence system — approved insights
 * call acceptEvidence, rejected insights call ignoreEvidence.
 */

import { motion, AnimatePresence } from 'framer-motion';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { X, Upload, FileText, CheckCircle2, Sparkles } from 'lucide-react';
import { toast } from '@components';
import LiquidGlassModal from '@components/ui/LiquidGlassModal';
import { cn } from '@libs/utils/react';
import {
  useUploadTrainingDocument,
  useEvidence,
  usePersona,
  useTrainingDocuments,
  personaKeys,
} from '@hooks/query/persona.hook';
import type { PersonaDocumentProcessingProgress } from '@hooks/query/persona.hook';
import api from '@libs/api';
import { useQueryClient } from 'react-query';
import type { InsightItem } from './DocumentUploadModal.types';
import {
  PROCESSING_STAGE_LABELS,
  STAGE_INDEX_MAP,
  PROCESSING_TIMEOUT_MS,
  POST_PROCESSING_FETCH_DELAY_MS,
  ALLOWED_EXTENSIONS,
  mapEvidenceToInsights,
} from './DocumentUploadModal.types';
import {
  DocumentReviewStep,
  DocumentReviewStepFooter,
} from './DocumentReviewStep';

// ============================================
// Types
// ============================================

export interface DocumentUploadModalProps {
  open: boolean;
  onClose: () => void;
  personaUuid: string;
  personaName: string;
  processingProgress: PersonaDocumentProcessingProgress;
}

// ============================================
// Main Component
// ============================================

const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  open,
  onClose,
  personaUuid,
  personaName,
  processingProgress,
}) => {
  const queryClient = useQueryClient();
  const { uploadDocumentAsync } = useUploadTrainingDocument();
  const { persona } = usePersona(personaUuid);
  const { evidence, refetch: refetchEvidence } = useEvidence(
    personaUuid,
    'pending',
  );
  const { documents: existingDocuments } = useTrainingDocuments(personaUuid);

  // Internal state
  const [step, setStep] = useState<'upload' | 'processing' | 'review'>(
    'upload',
  );
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedDocUuid, setUploadedDocUuid] = useState<string | null>(null);
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Track pre-existing evidence UUIDs so we only show new insights
  const preExistingEvidenceRef = useRef<Set<string>>(new Set());
  // Track processing state transitions
  const wasProcessingRef = useRef(false);
  // Timeout ref for processing
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // File input ref for click-to-browse
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derived counts
  const pendingCount = useMemo(
    () => insights.filter((i) => i.approved === null).length,
    [insights],
  );
  const approvedCount = useMemo(
    () => insights.filter((i) => i.approved === true).length,
    [insights],
  );
  const changeInsights = useMemo(
    () => insights.filter((i) => i.action !== 'context'),
    [insights],
  );
  const contextInsights = useMemo(
    () => insights.filter((i) => i.action === 'context'),
    [insights],
  );

  // Current processing stage index for display
  const currentStageIndex = useMemo(() => {
    if (!processingProgress.stage) return 0;
    return STAGE_INDEX_MAP[processingProgress.stage] ?? 0;
  }, [processingProgress.stage]);

  // ---- Processing completion detection ----
  useEffect(() => {
    if (!uploadedDocUuid || step !== 'processing') return;

    // Mark that we've seen processing start
    if (
      processingProgress.isProcessing &&
      processingProgress.documentUuid === uploadedDocUuid
    ) {
      wasProcessingRef.current = true;
    }

    // Detect processing → completed transition
    if (wasProcessingRef.current && !processingProgress.isProcessing) {
      wasProcessingRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (processingProgress.stage === 'failed') {
        // Stay on processing step — error is shown via processingProgress.message
        return;
      }

      // Processing completed — fetch fresh evidence and transition to review
      setTimeout(() => {
        refetchEvidence().then(() => {
          setStep('review');
        });
      }, POST_PROCESSING_FETCH_DELAY_MS);
    }
  }, [processingProgress, uploadedDocUuid, step, refetchEvidence]);

  // ---- Map evidence to insights when entering review step ----
  useEffect(() => {
    if (step !== 'review') return;
    const mapped = mapEvidenceToInsights(
      evidence,
      preExistingEvidenceRef.current,
      persona,
    );
    if (mapped.length > 0 || insights.length === 0) {
      setInsights(mapped);
    }
  }, [step, evidence]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- Cleanup timeout on unmount ----
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // ---- Handlers ----

  const handleClose = useCallback(() => {
    setStep('upload');
    setSelectedFile(null);
    setUploadedDocUuid(null);
    setInsights([]);
    setDragActive(false);
    setIsSaving(false);
    wasProcessingRef.current = false;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    onClose();
  }, [onClose]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleFileSelect = useCallback(
    async (file: File) => {
      // Check for duplicate filename
      if (existingDocuments.some((doc) => doc.filename === file.name)) {
        toast.warning(
          'Duplicate Document',
          'A document with this name has already been uploaded for this persona.',
        );
        return;
      }

      // Snapshot existing evidence before upload
      preExistingEvidenceRef.current = new Set(evidence.map((e) => e.uuid));
      setSelectedFile(file);
      setStep('processing');
      wasProcessingRef.current = false;

      // Set processing timeout — document remains server-side but modal resets
      timeoutRef.current = setTimeout(() => {
        toast.error(
          'Processing Timeout',
          'Document processing is taking longer than expected. The document was uploaded and will continue processing in the background.',
        );
        handleClose();
      }, PROCESSING_TIMEOUT_MS);

      try {
        const result = await uploadDocumentAsync({ personaUuid, file });
        setUploadedDocUuid(result.uuid);
      } catch {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        setStep('upload');
        setSelectedFile(null);
      }
    },
    [
      personaUuid,
      uploadDocumentAsync,
      evidence,
      existingDocuments,
      handleClose,
    ],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      const file = e.dataTransfer.files?.[0];
      if (!file) return;
      const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
      if (!ALLOWED_EXTENSIONS.has(ext)) {
        toast.error(
          'Unsupported File',
          `Only PDF, DOCX, CSV, and XLSX files are supported.`,
        );
        return;
      }
      handleFileSelect(file);
    },
    [handleFileSelect],
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileSelect(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [handleFileSelect],
  );

  const handleApproveInsight = useCallback((uuid: string) => {
    setInsights((prev) =>
      prev.map((i) => (i.uuid === uuid ? { ...i, approved: true } : i)),
    );
  }, []);

  const handleRejectInsight = useCallback((uuid: string) => {
    setInsights((prev) =>
      prev.map((i) => (i.uuid === uuid ? { ...i, approved: false } : i)),
    );
  }, []);

  const handleUndoInsight = useCallback((uuid: string) => {
    setInsights((prev) =>
      prev.map((i) => (i.uuid === uuid ? { ...i, approved: null } : i)),
    );
  }, []);

  const handleApproveAll = useCallback(() => {
    setInsights((prev) => prev.map((i) => ({ ...i, approved: true })));
  }, []);

  const handleComplete = useCallback(async () => {
    const approved = insights.filter((i) => i.approved === true);
    const rejected = insights.filter((i) => i.approved === false);

    if (approved.length === 0 && rejected.length === 0) {
      handleClose();
      return;
    }

    setIsSaving(true);
    try {
      const results = await Promise.allSettled([
        ...approved.map((i) => api.persona.acceptEvidence(personaUuid, i.uuid)),
        ...rejected.map((i) => api.persona.ignoreEvidence(personaUuid, i.uuid)),
      ]);

      const failedCount = results.filter((r) => r.status === 'rejected').length;
      const succeededCount = results.length - failedCount;

      if (failedCount > 0 && succeededCount > 0) {
        toast.warning(
          'Partially Applied',
          `${succeededCount} change${succeededCount !== 1 ? 's' : ''} applied, ${failedCount} failed.`,
        );
      } else if (failedCount > 0) {
        toast.error(
          'Save Failed',
          'Unable to apply changes. Please try again.',
        );
        return;
      } else if (approved.length > 0) {
        toast.success(
          'Changes Applied',
          `${approved.length} change${approved.length !== 1 ? 's' : ''} applied to ${personaName}`,
        );
      }

      queryClient.invalidateQueries({
        queryKey: personaKeys.evidence(personaUuid),
      });
      queryClient.invalidateQueries({
        queryKey: personaKeys.detail(personaUuid),
      });
      handleClose();
    } catch {
      toast.error('Save Failed', 'Unable to apply changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [insights, personaUuid, personaName, queryClient, handleClose]);

  return (
    <LiquidGlassModal
      open={open}
      onOpenChange={(isOpen) => !isOpen && handleClose()}
      size='xl'
      hideCloseButton
    >
      {/* Header */}
      <div className='aucctus-border-secondary flex items-center justify-between border-b px-6 py-4'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30'>
            <FileText className='h-5 w-5 text-primary-600 dark:text-primary-400' />
          </div>
          <div>
            <h2 className='aucctus-text-lg-semibold aucctus-text-primary'>
              Add Training Document
            </h2>
            <p className='aucctus-text-secondary text-sm'>
              Upload research to enhance {personaName}
            </p>
          </div>
        </div>
        <button
          type='button'
          onClick={handleClose}
          aria-label='Close'
          className='aucctus-text-secondary rounded-lg p-2 transition-colors hover:bg-black/5 dark:hover:bg-white/5'
        >
          <X className='h-5 w-5' />
        </button>
      </div>

      {/* Step Content */}
      <div className='p-6'>
        <AnimatePresence mode='wait'>
          {/* Step 1: Upload */}
          {step === 'upload' && (
            <motion.div
              key='upload'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'relative cursor-pointer rounded-xl border p-12 text-center transition-all',
                  dragActive
                    ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/10'
                    : 'aucctus-border-secondary hover:aucctus-border-primary',
                )}
              >
                <div className='aucctus-bg-secondary mx-auto mb-4 w-fit rounded-2xl p-4'>
                  <Upload className='aucctus-text-secondary h-8 w-8' />
                </div>
                <p className='aucctus-text-primary mb-1 text-lg font-medium'>
                  Drop your document here
                </p>
                <p className='aucctus-text-secondary mb-4 text-sm'>
                  or click to browse
                </p>
                <div className='aucctus-text-tertiary flex items-center justify-center gap-2 text-xs'>
                  <span>Supported:</span>
                  {['PDF', 'DOCX', 'CSV', 'XLSX'].map((ext) => (
                    <span
                      key={ext}
                      className='aucctus-border-secondary inline-flex rounded border px-1.5 py-0 text-[10px]'
                    >
                      {ext}
                    </span>
                  ))}
                </div>
              </div>
              <input
                ref={fileInputRef}
                type='file'
                accept='.pdf,.docx,.csv,.xlsx'
                onChange={handleFileInputChange}
                className='hidden'
              />
            </motion.div>
          )}

          {/* Step 2: Processing */}
          {step === 'processing' && (
            <motion.div
              key='processing'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className='py-16'
            >
              <div className='mx-auto max-w-md text-center'>
                {/* Loading indicator */}
                <div className='relative mb-8'>
                  <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-200/40 to-primary-100/20 dark:from-primary-800/30 dark:to-primary-900/10'>
                    <Sparkles className='h-7 w-7 text-primary-600 dark:text-primary-400' />
                  </div>
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <div className='h-20 w-20 animate-pulse rounded-2xl border border-primary-200/40 dark:border-primary-700/30' />
                  </div>
                </div>

                {/* File info */}
                {selectedFile && (
                  <div className='aucctus-bg-secondary aucctus-border-secondary mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1.5'>
                    <FileText className='aucctus-text-secondary h-3.5 w-3.5' />
                    <span className='aucctus-text-sm-medium aucctus-text-primary'>
                      {selectedFile.name}
                    </span>
                  </div>
                )}

                {/* Processing failed state */}
                {processingProgress.stage === 'failed' && (
                  <div className='space-y-3'>
                    <p className='text-sm text-red-600 dark:text-red-400'>
                      {processingProgress.message ||
                        'Document processing failed.'}
                    </p>
                    <div className='flex items-center justify-center gap-2'>
                      <button
                        type='button'
                        onClick={() => {
                          setStep('upload');
                          setSelectedFile(null);
                          setUploadedDocUuid(null);
                        }}
                        className='btn btn-light btn-sm'
                      >
                        Try Again
                      </button>
                      <button
                        type='button'
                        onClick={handleClose}
                        className='btn btn-light btn-sm'
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Progress stages */}
                {processingProgress.stage !== 'failed' && (
                  <div className='space-y-2'>
                    {PROCESSING_STAGE_LABELS.map((label, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{
                          opacity: idx <= currentStageIndex ? 1 : 0.3,
                          x: 0,
                        }}
                        transition={{ delay: idx * 0.1, duration: 0.2 }}
                        className='flex items-center justify-center gap-2'
                      >
                        {idx < currentStageIndex ? (
                          <CheckCircle2 className='h-3.5 w-3.5 text-emerald-500' />
                        ) : idx === currentStageIndex ? (
                          <div className='h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-600 border-t-transparent dark:border-primary-400' />
                        ) : (
                          <div className='aucctus-border-secondary h-3.5 w-3.5 rounded-full border' />
                        )}
                        <span
                          className={cn(
                            'text-sm',
                            idx <= currentStageIndex
                              ? 'aucctus-text-primary'
                              : 'aucctus-text-tertiary',
                          )}
                        >
                          {label}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 3: Review */}
          {step === 'review' && (
            <DocumentReviewStep
              insights={insights}
              changeInsights={changeInsights}
              contextInsights={contextInsights}
              pendingCount={pendingCount}
              approvedCount={approvedCount}
              isSaving={isSaving}
              onApprove={handleApproveInsight}
              onReject={handleRejectInsight}
              onUndo={handleUndoInsight}
              onApproveAll={handleApproveAll}
              onComplete={handleComplete}
              onClose={handleClose}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Footer (review step only) */}
      {step === 'review' && insights.length > 0 && (
        <DocumentReviewStepFooter
          approvedCount={approvedCount}
          isSaving={isSaving}
          onComplete={handleComplete}
          onClose={handleClose}
        />
      )}
    </LiquidGlassModal>
  );
};

export default DocumentUploadModal;
