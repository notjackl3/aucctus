import { Card, Chart, Header } from '@components';
import { formatLargeNumber, formatter } from '@libs/utils';
import { FunctionComponent } from 'react';
import { useParams } from 'react-router-dom';
import EditModeSwitcher from '../../../components/Text/EditModeSwitcher/EditModeSwitcher';
import { useEditFinancialProjections } from '../../../hooks/concepts/editable.hook';

const FinancialDetails: FunctionComponent = () => {
  const { id: conceptId } = useParams();
  const { overview, tam, sam, som, businessModel, marketSize, pricing } = useEditFinancialProjections();

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

        <div className='inline-flex w-full items-start justify-between gap-5'>
          <Card.FinancialModel
            heading='Business Model'
            value={businessModel?.modelName || ''}
            content={businessModel?.rationale || ''}
          />
          <Card.FinancialModel
            heading='Price'
            value={formatter.format(pricing?.price || 0) || ''}
            content={pricing?.rationale || ''}
          />
          <Card.FinancialModel
            heading='Total Users'
            value={formatLargeNumber(marketSize?.totalMarketSize || 0) || ''}
            content={marketSize?.totalMarketSizeRationale || ''}
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
              value={formatter.format(tam.value || 0)}
              descriptor='ARR'
              assumptions={marketSize?.marketShareAssumptions || []}
            />
            <Card.MarketSize
              bulletColor='bg-violet-500'
              title={'Serviceable Addressable Market (SAM)'}
              value={formatter.format(sam.value || 0)}
              descriptor='ARR'
              assumptions={marketSize?.serviceableMarketPercentAssumptions || []}
            />
            <Card.MarketSize
              bulletColor='bg-indigo-600'
              title={'Serviceable Obtainable Market (SOM)'}
              value={formatter.format(som.value || 0)}
              descriptor='ARR'
              assumptions={marketSize?.marketShareAssumptions || []}
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
