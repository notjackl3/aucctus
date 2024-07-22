import { Card, Chart, Header, Modal } from '@components';
import EditModeSwitcher from '@components/Text/EditModeSwitcher/EditModeSwitcher';
import { useModal } from '@context/ModalContextProvider';
import { useEditFinancialProjections } from '@hooks/concepts/editable.hook';
import { IBusinessModel, IFinancialProjectionPricing, IMarketSize, ISource } from '@libs/api/types';
import { formatLargeNumber, formatter } from '@libs/utils';
import React, { FunctionComponent } from 'react';

const DEFAULT_BUISENSS_MODEL: IBusinessModel = {
  uuid: '',
  version: 0,
  modelName: '',
  description: '',
  rationale: '',
};

const DEFAULT_PRICING: IFinancialProjectionPricing = {
  uuid: '',
  version: 0,
  price: 0,
  billing: '',
  averageRevenuePerCustomer: 0,
  purchasingFrequency: 0,
  rationale: '',
  sources: [],
};

const DEFAULT_MARKET_SIZE: IMarketSize = {
  uuid: '',
  version: 0,
  totalMarketSize: 0,
  totalMarketSizeRationale: '',
  totalMarketSizeAssumptions: [],
  serviceableMarketPercent: 0,
  serviceableMarketPercentRationale: '',
  serviceableMarketPercentAssumptions: [],
  marketCaptureRate: 0,
  marketCaptureRateRationale: '',
  marketCaptureRateAssumptions: [],
  sources: [],
};

const BUSINESS_MODEL_SOURCE: ISource = {
  uuid: '12345',
  title: '50 Types of Business Models (2022) – The Best Examples of Companies Using It',
  url: 'https://bstrategyhub.com/50-types-of-business-models-the-best-examples-of-companies-using-it/',
};

const FinancialDetails: FunctionComponent = () => {
  // const { id: conceptId } = useParams();
  const { overview, tam, sam, som, businessModel, marketSize, pricing } = useEditFinancialProjections();
  // Extract values from Business Model, Market Size and Pricing
  const { modelName, rationale: businessModelRationale } = businessModel || DEFAULT_BUISENSS_MODEL;
  const { price, billing, rationale: pricingRationale, sources: pricingSources } = pricing || DEFAULT_PRICING;
  const {
    totalMarketSize,
    totalMarketSizeRationale,
    totalMarketSizeAssumptions,
    serviceableMarketPercentRationale,
    serviceableMarketPercentAssumptions,
    marketCaptureRateRationale,
    marketCaptureRateAssumptions,
    sources: marketSizeSources,
  } = marketSize || DEFAULT_MARKET_SIZE;

  // Formate Large numbers
  const formattedPrice = React.useMemo(() => formatter.format(price), [price]);
  const formattedTotalMarketSize = React.useMemo(() => formatLargeNumber(totalMarketSize), [totalMarketSize]);
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
            value={modelName}
            content={businessModelRationale}
            onClick={handleReasoningModelClick(modelName, businessModelRationale, [BUSINESS_MODEL_SOURCE])}
          />
          <Card.FinancialModel
            heading='Price'
            value={`${formattedPrice} / ${billing}`}
            content={pricingRationale}
            onClick={handleReasoningModelClick(`${formattedPrice} / ${billing}`, pricingRationale, pricingSources)}
          />
          <Card.FinancialModel
            heading='Total Users'
            value={formattedTotalMarketSize}
            content={totalMarketSizeRationale}
            onClick={handleReasoningModelClick(formattedTotalMarketSize, totalMarketSizeRationale, marketSizeSources)}
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
              assumptions={totalMarketSizeAssumptions}
              onClick={handleReasoningModelClick(formattedTam, totalMarketSizeRationale, marketSizeSources)}
            />
            <Card.MarketSize
              bulletColor='bg-violet-500'
              title={'Serviceable Addressable Market (SAM)'}
              value={formattedSam}
              descriptor='ARR'
              assumptions={serviceableMarketPercentAssumptions}
              onClick={handleReasoningModelClick(formattedSam, serviceableMarketPercentRationale, marketSizeSources)}
            />
            <Card.MarketSize
              bulletColor='bg-indigo-600'
              title={'Serviceable Obtainable Market (SOM)'}
              value={formattedSom}
              descriptor='ARR'
              assumptions={marketCaptureRateAssumptions}
              onClick={handleReasoningModelClick(formattedSom, marketCaptureRateRationale, marketSizeSources)}
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
