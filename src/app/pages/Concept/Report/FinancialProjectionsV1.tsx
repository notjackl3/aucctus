// TODO: DEPRECATE - This is the legacy V1 financial projections component.
// Remove this file once all users have migrated to FinancialProjectionsV2.tsx

import { Card, Chart, Header, Modal, UnifiedLoadingState } from '@components';
import EditModeSwitcher from '@components/Text/EditModeSwitcher/EditModeSwitcher';
import { useModal } from '@context/ModalContextProvider';
import { useEditFinancialProjections } from '@hooks/concepts/editable.hook';
import { useFinancialProjection } from '@hooks/query/concepts.hook';
import { useUnifiedLoading } from '@hooks/concepts/unified-loading.hook';
import { AppPath } from '@routes/routes';
import { ISource } from '@libs/api/types';
import utils from '@libs/utils';
import React, { FunctionComponent, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { IConceptReportContext } from './ConceptReport/ConceptReport';

const FinancialProjectionsV1: FunctionComponent = () => {
  const { concept } = useOutletContext<IConceptReportContext>();
  const { financialProjection, isLoading: isFinancialProjectionLoading } =
    useFinancialProjection(concept.uuid);

  // Use unified loading state
  const { isLoading } = useUnifiedLoading({
    currentRoute: AppPath.ConceptFinancialProjection,
    concept,
    additionalLoadingStates: [isFinancialProjectionLoading],
  });

  const {
    tam,
    sam,
    som,
    businessModel,
    pricing,
    totalUsers,
    serviceableAddressablePercent,
    serviceableObtainablePercent,
  } = useMemo(
    () =>
      financialProjection || {
        tam: 0,
        sam: 0,
        som: 0,
        businessModel: null,
        pricing: null,
        totalUsers: null,
        serviceableAddressablePercent: null,
        serviceableObtainablePercent: null,
      },
    [financialProjection],
  );

  const { overview } = useEditFinancialProjections();

  // Formate Large numbers
  const formattedPrice = React.useMemo(
    () => (pricing?.price ? utils.number.formatter.format(pricing.price) : '0'),
    [pricing?.price],
  );
  const formattedTotalUsers = React.useMemo(
    () =>
      totalUsers?.value
        ? utils.number.formatLargeNumber(totalUsers.value)
        : '0',
    [totalUsers?.value],
  );
  const formattedTam = React.useMemo(
    () => (tam ? utils.number.formatter.format(tam) : '0'),
    [tam],
  );
  const formattedSam = React.useMemo(
    () => (sam ? utils.number.formatter.format(sam) : '0'),
    [sam],
  );
  const formattedSom = React.useMemo(
    () => (som ? utils.number.formatter.format(som) : '0'),
    [som],
  );

  const { openModal } = useModal();

  const handleReasoningModelClick = React.useCallback(
    (conclusion: string, reasoning: string, sources: ISource[]) =>
      (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        openModal(Modal.EvidenceAndReasoning, {
          conclusion,
          reasoning,
          sources,
        });
        e.preventDefault();
        e.stopPropagation();
      },
    [openModal],
  );

  // Show unified loading state
  if (isLoading) {
    return <UnifiedLoadingState />;
  }

  // Handle case where financial projection doesn't exist
  if (!financialProjection) {
    return (
      <div className='aucctus-text-secondary flex h-full w-full flex-col items-center justify-center gap-6 p-8'>
        No financial projection found for this concept.
      </div>
    );
  }

  return (
    <div className='align-self-lg-stretch flex h-full w-full flex-col items-start gap-6'>
      <section className='inline-flex flex-col items-start justify-start gap-5'>
        <Header.Three text='Overview' />

        <EditModeSwitcher
          pClassName='self-stretch aucctus-text-md aucctus-text-tertiary'
          value={overview.value}
          name='overview'
          maxLength={overview.validation.maxLength}
          onChange={overview.handleChange}
          handleSave={overview.handleSave}
          handleCancel={overview.handleCancel}
        />
      </section>
      <section className='inline-flex w-full flex-col items-start justify-start gap-5'>
        <Header.Three text='Financial Model' />

        <div className='inline-flex w-full items-start justify-start gap-5'>
          <Card.FinancialModel
            heading='Business Model'
            value={businessModel?.name || ''}
            content={businessModel?.rationale || ''}
            onClick={handleReasoningModelClick(
              businessModel?.name || '',
              businessModel?.rationale || '',
              businessModel?.sources || [],
            )}
          />
          <Card.FinancialModel
            heading='Price'
            value={`${formattedPrice} / ${pricing?.billing || ''}`}
            content={pricing?.rationale || ''}
            onClick={handleReasoningModelClick(
              `${formattedPrice} / ${pricing?.billing || ''}`,
              pricing?.rationale || '',
              pricing?.sources || [],
            )}
          />
          <Card.FinancialModel
            heading='Total Users'
            value={formattedTotalUsers}
            content={totalUsers?.rationale || ''}
            onClick={handleReasoningModelClick(
              formattedTotalUsers,
              totalUsers?.rationale || '',
              totalUsers?.sources || [],
            )}
          />
        </div>
      </section>
      <section className='aucctus-border-secondary aucctus-bg-primary inline-flex w-full flex-col items-start justify-start rounded-xl border px-8 shadow'>
        <div className='aucctus-border-primary aucctus-bg-primary flex h-16 flex-col items-start justify-start gap-5 self-stretch rounded-t-xl border-b'>
          <div className=' inline-flex items-start justify-start gap-4 self-stretch px-6 pt-5'>
            <div className='inline-flex shrink grow basis-0 flex-col items-start justify-center gap-1 self-stretch'>
              <h3 className='aucctus-text-lg aucctus-text-brand-primary self-stretch'>
                Market Size
              </h3>
            </div>
          </div>
        </div>

        <div className='inline-flex items-start justify-start gap-12 self-stretch py-6'>
          <div className='inline-flex w-96 flex-col items-start justify-start gap-3.5 p-1'>
            <Card.MarketSize
              bulletColor='bg-purple-100'
              title={'Total Addressable Market (TAM)'}
              value={formattedTam}
              descriptor='ARR'
              assumptions={totalUsers?.assumptions || []}
              onClick={handleReasoningModelClick(
                formattedTam,
                totalUsers?.rationale || '',
                totalUsers?.sources || [],
              )}
            />
            <Card.MarketSize
              bulletColor='bg-indigo-200'
              title={'Serviceable Addressable Market (SAM)'}
              value={formattedSam}
              descriptor='ARR'
              assumptions={serviceableAddressablePercent?.assumptions || []}
              onClick={handleReasoningModelClick(
                formattedSam,
                serviceableAddressablePercent?.rationale || '',
                serviceableAddressablePercent?.sources || [],
              )}
            />
            <Card.MarketSize
              bulletColor='bg-indigo-500'
              title={'Serviceable Obtainable Market (SOM)'}
              value={formattedSom}
              descriptor='ARR'
              assumptions={serviceableObtainablePercent?.assumptions || []}
              onClick={handleReasoningModelClick(
                formattedSom,
                serviceableObtainablePercent?.rationale || '',
                serviceableObtainablePercent?.sources || [],
              )}
            />
          </div>

          <div className='m-auto inline-flex h-full w-96 flex-col items-center justify-center gap-12'>
            <Chart.MarketChart
              className={''}
              tam={tam || 0}
              sam={sam || 0}
              som={som || 0}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default FinancialProjectionsV1;
