import { Card, Chart, Header, Modal } from '@components';
import EditModeSwitcher from '@components/Text/EditModeSwitcher/EditModeSwitcher';
import { useModal } from '@context/ModalContextProvider';
import { useEditFinancialProjections } from '@hooks/concepts/editable.hook';
import { ISource } from '@libs/api/types';
import utils from '@libs/utils';
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
  const formattedPrice = React.useMemo(
    () => utils.number.formatter.format(pricing.price),
    [pricing.price],
  );
  const formattedTotalUsers = React.useMemo(
    () => utils.number.formatLargeNumber(totalUsers.value),
    [totalUsers.value],
  );
  const formattedTam = React.useMemo(
    () => utils.number.formatter.format(tam.value),
    [tam.value],
  );
  const formattedSam = React.useMemo(
    () => utils.number.formatter.format(sam.value),
    [sam.value],
  );
  const formattedSom = React.useMemo(
    () => utils.number.formatter.format(som.value),
    [som.value],
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
            value={businessModel.name}
            content={businessModel.rationale}
            onClick={handleReasoningModelClick(
              businessModel.name,
              businessModel.rationale,
              businessModel.sources,
            )}
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
            onClick={handleReasoningModelClick(
              formattedTotalUsers,
              totalUsers.rationale,
              totalUsers.sources,
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
              assumptions={totalUsers.assumptions}
              onClick={handleReasoningModelClick(
                formattedTam,
                totalUsers.rationale,
                totalUsers.sources,
              )}
            />
            <Card.MarketSize
              bulletColor='bg-indigo-200'
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
              bulletColor='bg-indigo-500'
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
            <Chart.MarketChart
              className={''}
              tam={tam.value}
              sam={sam.value}
              som={som.value}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default FinancialDetails;
