import { Card, Chart, Header, Modal } from '@components';
import EditModeSwitcher from '@components/Text/EditModeSwitcher/EditModeSwitcher';
import { useModal } from '@context/ModalContextProvider';
import { useEditFinancialProjections } from '@hooks/concepts/editable.hook';
import { ISource } from '@libs/api/types';
import { formatLargeNumber, formatter } from '@libs/utils';
import React, { FunctionComponent } from 'react';

const FinancialDetails: FunctionComponent = () => {
  // const { id: conceptId } = useParams();
  const {
    overview,
    tam,
    sam,
    som,
    businessModel,
    pricing,
    totalUsers,
    serviceableAddressablePercent,
    serviceableObtainablePercent,
  } = useEditFinancialProjections();

  // Formate Large numbers
  const formattedPrice = React.useMemo(() => formatter.format(pricing.price), [pricing]);
  const formattedTotalUsers = React.useMemo(() => formatLargeNumber(totalUsers.value), [totalUsers]);
  const formattedTam = React.useMemo(() => formatter.format(tam.value), [tam]);
  const formattedSam = React.useMemo(() => formatter.format(sam.value), [sam]);
  const formattedSom = React.useMemo(() => formatter.format(som.value), [som]);

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

  return (
    <div className='align-self-lg-stretch flex h-full w-full flex-col items-start gap-6'>
      <section className='inline-flex flex-col items-start justify-start gap-5'>
        <Header.Three text='Overview' />

        <EditModeSwitcher
          pClassName='self-stretch text-gray-500 text-base font-normal leading-normal'
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
            value={businessModel.modelName}
            content={businessModel.rationale}
            onClick={handleReasoningModelClick(businessModel.modelName, businessModel.rationale, businessModel.sources)}
          />
          <Card.FinancialModel
            heading='Price'
            value={`${formattedPrice} / ${pricing.billing}`}
            content={pricing.rationale}
            onClick={handleReasoningModelClick(
              `${formattedPrice} / ${pricing.billing}`,
              pricing.rationale,
              pricing.sources,
            )}
          />
          <Card.FinancialModel
            heading='Total Users'
            value={formattedTotalUsers}
            content={totalUsers.rationale}
            onClick={handleReasoningModelClick(formattedTotalUsers, totalUsers.rationale, totalUsers.sources)}
          />
        </div>
      </section>
      <section className='inline-flex w-full flex-col items-start justify-start rounded-xl border border-slate-200 bg-white px-8 shadow'>
        <div className='flex h-16 flex-col items-start justify-start gap-5 self-stretch rounded-t-xl border-b border-gray-300 bg-white'>
          <div className=' inline-flex items-start justify-start gap-4 self-stretch px-6 pt-5'>
            <div className='inline-flex shrink grow basis-0 flex-col items-start justify-center gap-1 self-stretch'>
              <h3 className='self-stretch text-lg font-medium leading-7 text-indigo-900'>Market Size</h3>
            </div>
          </div>
        </div>

        <div className='inline-flex items-start justify-start gap-12 self-stretch py-6'>
          <div className='inline-flex w-96 flex-col items-start justify-start gap-3.5 p-1'>
            <Card.MarketSize
              bulletColor='bg-violet-300'
              title={'Total Addressable Market (TAM)'}
              value={formattedTam}
              descriptor='ARR'
              assumptions={totalUsers.assumptions}
              onClick={handleReasoningModelClick(formattedTam, totalUsers.rationale, totalUsers.sources)}
            />
            <Card.MarketSize
              bulletColor='bg-violet-500'
              title={'Serviceable Addressable Market (SAM)'}
              value={formattedSam}
              descriptor='ARR'
              assumptions={serviceableAddressablePercent.assumptions}
              onClick={handleReasoningModelClick(
                formattedSam,
                serviceableAddressablePercent.rationale,
                serviceableAddressablePercent.sources,
              )}
            />
            <Card.MarketSize
              bulletColor='bg-indigo-600'
              title={'Serviceable Obtainable Market (SOM)'}
              value={formattedSom}
              descriptor='ARR'
              assumptions={serviceableObtainablePercent.assumptions}
              onClick={handleReasoningModelClick(
                formattedSom,
                serviceableObtainablePercent.rationale,
                serviceableObtainablePercent.sources,
              )}
            />
          </div>

          <div className='m-auto inline-flex h-full w-96 flex-col items-center justify-center gap-12'>
            <Chart.MarketChart className={''} tam={tam.value} sam={sam.value} som={som.value} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default FinancialDetails;
