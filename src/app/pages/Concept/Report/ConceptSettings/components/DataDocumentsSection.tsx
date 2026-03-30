import { GlassSurface, toast } from '@components';
import { AnimatePresence, motion } from 'framer-motion';
import { Database, Plus } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import {
  useConceptTrainingDocuments,
  useUploadConceptTrainingDocument,
  useDeleteConceptTrainingDocument,
  useConceptEvidence,
  useConceptDocumentSocketEvents,
  conceptDocumentKeys,
} from '@hooks/query/conceptTrainingDocument.hook';
import { AucctusQueryKeys } from '@hooks/query/query-keys';
import api from '@libs/api';
import { useQuery, useQueryClient } from 'react-query';
import { markConceptSectionsPending } from '@hooks/query/concepts.hook';
import ConceptDocumentList from './ConceptDocumentList';
import ConceptDocumentModal from './ConceptDocumentModal';
import ConceptEvidenceCarousel from './ConceptEvidenceCarousel';

import type { IConcept } from '@libs/api/types';
import type {
  IConceptOverview,
  ICustomerProfile,
  IExecutiveSummaries,
} from '@libs/api/types/concept/concepts';

interface DataDocumentsSectionProps {
  conceptUuid: string;
  concept?: IConcept;
  isReadOnly?: boolean;
}

const DataDocumentsSection: React.FC<DataDocumentsSectionProps> = ({
  conceptUuid,
  concept,
  isReadOnly = false,
}) => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialStep, setModalInitialStep] = useState<'upload' | 'review'>(
    'upload',
  );
  const [showCarousel, setShowCarousel] = useState(true);

  // Fetch section data for strikethrough on "change" actions.
  // These queries use long staleTime so they hit cache if the user already visited the tab.
  const { data: overviewData } = useQuery<IConceptOverview>({
    queryKey: [AucctusQueryKeys.conceptOverview, conceptUuid],
    queryFn: () => api.concept.getConceptOverview(conceptUuid),
    staleTime: 1000 * 60 * 5,
    enabled: !!conceptUuid,
  });
  const { data: financialData } = useQuery({
    queryKey: [AucctusQueryKeys.financialProjectionV2, conceptUuid],
    queryFn: () => api.financialProjection.getFinancialProjection(conceptUuid),
    staleTime: 1000 * 60 * 5,
    enabled: !!conceptUuid,
  });
  const { data: marketScanData } = useQuery({
    queryKey: [AucctusQueryKeys.marketScan, conceptUuid],
    queryFn: () => api.marketScan.getMarketScan(conceptUuid),
    staleTime: 1000 * 60 * 5,
    enabled: !!conceptUuid,
  });
  const { data: customerProfilesData } = useQuery({
    queryKey: [AucctusQueryKeys.customerProfiles, conceptUuid],
    queryFn: () => api.concept.getConceptCustomerProfiles(conceptUuid),
    staleTime: 1000 * 60 * 5,
    enabled: !!conceptUuid,
  });
  const { data: execSummaries } = useQuery<IExecutiveSummaries>({
    queryKey: [AucctusQueryKeys.conceptExecutiveSummaries, conceptUuid],
    queryFn: () => api.concept.getConceptExecutiveSummaries(conceptUuid),
    staleTime: 1000 * 60 * 5,
    enabled: !!conceptUuid,
  });

  // Build flat map of target_field → current_value for strikethrough display
  const cachedSectionValues = useMemo(() => {
    const values: Record<string, string> = {};
    // Overview fields not on IConcept directly
    if (overviewData?.whatIsThis)
      values['overview.what_is_this'] = overviewData.whatIsThis;
    if (overviewData?.shouldWeDoThis)
      values['overview.should_we_do_this'] = overviewData.shouldWeDoThis;
    // Financial
    if (financialData?.businessModel?.description) {
      values['financial.business_model_description'] =
        financialData.businessModel.description;
    }
    // Market scan
    if (marketScanData?.ecosystemDescription) {
      values['market_scan.ecosystem_description'] =
        marketScanData.ecosystemDescription;
    }
    // Primary customer profile description
    const primaryProfile = customerProfilesData?.results?.find(
      (p: ICustomerProfile) => p.description,
    );
    if (primaryProfile?.description) {
      values['customer_profiles.description'] = primaryProfile.description;
    }
    // Executive summaries
    if (execSummaries) {
      if (execSummaries.marketScanTrendsDrivers)
        values['executive_summaries.market_scan_trends_drivers'] =
          execSummaries.marketScanTrendsDrivers;
      if (execSummaries.marketScanEcosystem)
        values['executive_summaries.market_scan_ecosystem'] =
          execSummaries.marketScanEcosystem;
      if (execSummaries.customerProfiles)
        values['executive_summaries.customer_profiles'] =
          execSummaries.customerProfiles;
      if (execSummaries.keyAssumptions)
        values['executive_summaries.key_assumptions'] =
          execSummaries.keyAssumptions;
    }
    return values;
  }, [
    overviewData,
    financialData,
    marketScanData,
    customerProfilesData,
    execSummaries,
  ]);

  // Queries
  const { documents, isLoading: isLoadingDocs } =
    useConceptTrainingDocuments(conceptUuid);
  const {
    evidence,
    pendingCount,
    refetch: refetchEvidence,
  } = useConceptEvidence(conceptUuid, 'pending');

  // Mutations
  const { uploadDocumentAsync } = useUploadConceptTrainingDocument();
  const { deleteDocument, isDeleting } = useDeleteConceptTrainingDocument();

  // WebSocket
  const { isProcessingDocument, processingProgress } =
    useConceptDocumentSocketEvents(conceptUuid);

  const handleUploadFile = useCallback(
    async (file: File) => {
      return await uploadDocumentAsync({ conceptUuid, file });
    },
    [conceptUuid, uploadDocumentAsync],
  );

  const handleRefetchEvidence = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: conceptDocumentKeys.evidence(conceptUuid),
    });
    return await refetchEvidence();
  }, [conceptUuid, queryClient, refetchEvidence]);

  const handleDelete = (documentUuid: string) => {
    deleteDocument({ conceptUuid, documentUuid });
  };

  const handleOpenUpload = useCallback(() => {
    setModalInitialStep('upload');
    setIsModalOpen(true);
  }, []);

  const handleOpenReview = useCallback(() => {
    setModalInitialStep('review');
    setIsModalOpen(true);
  }, []);

  const handleAcceptEvidence = useCallback(
    async (uuid: string) => {
      try {
        const response = await api.concept.applyEvidenceBatch(
          conceptUuid,
          [uuid],
          [],
        );

        // Optimistically mark affected sections as pending → triggers skeleton loading
        if (concept?.identifier && response.sections?.length) {
          markConceptSectionsPending(
            queryClient,
            concept.identifier,
            response.sections,
          );
        }

        queryClient.invalidateQueries({
          queryKey: conceptDocumentKeys.evidence(conceptUuid),
        });
        toast.success(
          'Evidence Applied',
          'Change is being applied to your concept report.',
        );
      } catch {
        toast.error('Action Failed', 'Unable to accept evidence.');
      }
    },
    [conceptUuid, concept, queryClient],
  );

  const handleIgnoreEvidence = useCallback(
    async (uuid: string) => {
      try {
        await api.concept.ignoreEvidence(conceptUuid, uuid);
        queryClient.invalidateQueries({
          queryKey: conceptDocumentKeys.evidence(conceptUuid),
        });
        toast.success('Evidence Ignored', 'The suggestion has been dismissed.');
      } catch {
        toast.error('Action Failed', 'Unable to ignore evidence.');
      }
    },
    [conceptUuid, queryClient],
  );

  return (
    <div className='flex flex-col gap-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Database className='aucctus-text-tertiary h-5 w-5' />
          <h2 className='aucctus-text-xl-medium aucctus-text-primary'>
            Data & Documents
          </h2>
        </div>
        <div className='flex items-center gap-2'>
          {pendingCount > 0 && (
            <button
              onClick={handleOpenReview}
              className='btn btn-sm bg-emerald-600 text-white hover:bg-emerald-700'
            >
              Review {pendingCount} Suggestion
              {pendingCount !== 1 ? 's' : ''}
            </button>
          )}
          {!isReadOnly && (
            <button
              onClick={handleOpenUpload}
              className='btn btn-sm btn-bold aucctus-text-brand-primary group hover:bg-primary-900 hover:text-white'
            >
              <Plus className='mr-1 h-4 w-4' />
              Upload Document
            </button>
          )}
        </div>
      </div>

      {/* Background processing indicator (when modal is closed) */}
      <AnimatePresence>
        {isProcessingDocument && !isModalOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className='aucctus-bg-brand-secondary flex items-center gap-3 rounded-lg p-3'>
              <div className='aucctus-text-brand-primary h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
              <span className='aucctus-text-primary text-sm'>
                {processingProgress.message || 'Processing...'}
              </span>
              {processingProgress.progress > 0 && (
                <div className='aucctus-bg-tertiary ml-auto h-1.5 w-24 overflow-hidden rounded-full'>
                  <motion.div
                    className='aucctus-bg-brand-solid h-full rounded-full'
                    animate={{
                      width: `${processingProgress.progress}%`,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Evidence carousel */}
      {pendingCount > 0 && showCarousel && (
        <ConceptEvidenceCarousel
          pendingEvidence={evidence}
          onAccept={handleAcceptEvidence}
          onIgnore={handleIgnoreEvidence}
          onClose={() => setShowCarousel(false)}
        />
      )}

      {/* Document list */}
      <GlassSurface className='p-4'>
        <div className='mb-3 flex items-center justify-between'>
          <span className='aucctus-text-secondary text-sm font-medium'>
            Uploaded Documents
          </span>
          <span className='aucctus-text-tertiary text-xs'>
            {documents.length} file{documents.length !== 1 ? 's' : ''}
          </span>
        </div>
        {isLoadingDocs ? (
          <div className='flex flex-col gap-2'>
            {[1, 2].map((i) => (
              <div
                key={i}
                className='aucctus-bg-secondary h-14 animate-pulse rounded-lg'
              />
            ))}
          </div>
        ) : (
          <ConceptDocumentList
            documents={documents}
            onDelete={handleDelete}
            isDeleting={isDeleting}
          />
        )}
      </GlassSurface>

      {/* Modal */}
      <ConceptDocumentModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        conceptUuid={conceptUuid}
        concept={concept}
        cachedSectionValues={cachedSectionValues}
        processingProgress={processingProgress}
        onUploadFile={handleUploadFile}
        evidence={evidence}
        refetchEvidence={handleRefetchEvidence}
        initialStep={modalInitialStep}
      />
    </div>
  );
};

export default DataDocumentsSection;
