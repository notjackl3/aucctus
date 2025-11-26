import React, { useState, useEffect } from 'react';
import { Icon, Tabs, TabsList, TabsTrigger, TabsContent } from '@components';
import CompanyListPanel from './components/CompanyListPanel';
import CompanyDetailPanel from './components/CompanyDetailPanel';
import BubbleChart from './components/BubbleChart';
import DialGauge from './components/DialGauge';
import ProductCarousel from './components/ProductCarousel';
import FuturePredictions from './components/FuturePredictions';
import { useEcosystem, Company } from './hooks/useEcosystem';

const EcosystemV2: React.FC<{ conceptId: string }> = ({ conceptId }) => {
  const {
    ecosystemData,
    headwinds,
    tailwinds,
    crowdedness,
    futurePredictions,
  } = useEcosystem(conceptId);

  const [ecosystemTab, setEcosystemTab] = useState<
    'map' | 'startups' | 'incumbents'
  >('map');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // Auto-select first company when switching tabs
  useEffect(() => {
    if (ecosystemTab === 'startups') {
      const startups = ecosystemData.filter((c) => c.type === 'startup');
      if (startups.length > 0) {
        setSelectedCompany(startups[0]);
      }
    } else if (ecosystemTab === 'incumbents') {
      const incumbents = ecosystemData.filter((c) => c.type === 'incumbent');
      if (incumbents.length > 0) {
        setSelectedCompany(incumbents[0]);
      }
    }
  }, [ecosystemTab, ecosystemData]);

  return (
    <div className='min-h-screen'>
      <div className='max-w-7xl space-y-8'>
        {/* Crowdedness Gauge & Headwinds/Tailwinds Grid */}
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
          {/* Crowdedness Gauge */}
          <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border p-4'>
            <div className='pb-2'>
              <div className='aucctus-text-primary flex items-center gap-2 text-lg font-semibold'>
                <Icon
                  variant='users-02'
                  className='aucctus-stroke-brand-primary h-5 w-5'
                />
                Crowdedness
              </div>
            </div>
            <div className='pt-2'>
              <DialGauge
                score={crowdedness.score}
                directCompetitors={crowdedness.directCompetitors}
              />
            </div>
          </div>

          {/* Headwinds */}
          <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border p-4'>
            <div className='flex flex-row items-center gap-2 pb-3'>
              <Icon
                variant='trending-down'
                className='aucctus-stroke-error-primary h-5 w-5'
              />
              <div className='aucctus-text-primary text-lg font-semibold'>
                Headwinds
              </div>
            </div>
            <div className='space-y-2'>
              {headwinds.map((headwind, index) => (
                <div
                  key={headwind.id || index}
                  className='aucctus-border-error-extra-subtle aucctus-bg-error-subtle rounded-lg border p-3'
                >
                  <div className='flex items-center gap-2'>
                    <div className='aucctus-bg-error-secondary flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full'>
                      <span className='aucctus-text-xs-semibold aucctus-text-error-primary'>
                        {index + 1}
                      </span>
                    </div>
                    <p className='aucctus-text-sm aucctus-text-primary'>
                      {headwind.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tailwinds */}
          <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border p-4'>
            <div className='flex flex-row items-center gap-2 pb-3'>
              <Icon
                variant='trending-up'
                className='aucctus-stroke-success-primary h-5 w-5'
              />
              <div className='aucctus-text-primary text-lg font-semibold'>
                Tailwinds
              </div>
            </div>
            <div className='space-y-2'>
              {tailwinds.map((tailwind, index) => (
                <div
                  key={tailwind.id || index}
                  className='aucctus-border-success-extra-subtle aucctus-bg-success-subtle rounded-lg border p-3'
                >
                  <div className='flex items-center gap-2'>
                    <div className='aucctus-bg-success-secondary flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full'>
                      <span className='aucctus-text-xs-semibold aucctus-text-success-primary'>
                        {index + 1}
                      </span>
                    </div>
                    <p className='aucctus-text-sm aucctus-text-primary'>
                      {tailwind.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Ecosystem Map Section */}
        <Tabs
          value={ecosystemTab}
          onValueChange={(v) => setEcosystemTab(v as any)}
          className='space-y-4'
        >
          {/* Card Header */}
          <div className='px-0 pb-4'>
            <div className='flex items-center justify-between'>
              <div className='flex-1'>
                <h3 className='aucctus-text-primary flex items-center gap-2 text-xl font-semibold tracking-tight'>
                  <div className='aucctus-text-primary h-5 w-5'>
                    <Icon variant='map-02' />
                  </div>
                  Ecosystem Map
                </h3>
                <p className='aucctus-text-secondary mt-1 text-base'>
                  Scan of active players in the market
                </p>
              </div>
              {/* Tab Navigation */}
              <TabsList>
                <TabsTrigger value='map'>
                  <Icon
                    variant='map'
                    width={16}
                    height={16}
                    className='aucctus-stroke-secondary mr-2'
                  />
                  Map
                </TabsTrigger>
                <TabsTrigger value='startups'>
                  <Icon
                    variant='zap'
                    width={16}
                    height={16}
                    className='aucctus-stroke-secondary mr-2'
                  />
                  Startups
                </TabsTrigger>
                <TabsTrigger value='incumbents'>
                  <Icon
                    variant='building-02'
                    width={16}
                    height={16}
                    className='aucctus-stroke-secondary mr-2'
                  />
                  Incumbents
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Map View */}
          <TabsContent value='map' className='mt-0'>
            <BubbleChart data={ecosystemData} />
          </TabsContent>

          {/* Startups View */}
          <TabsContent value='startups' className='mt-0'>
            <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border'>
              <div className='grid h-[500px] grid-cols-7'>
                {/* Left Panel - Company List */}
                <div className='aucctus-border-secondary col-span-2 overflow-hidden border-r'>
                  <CompanyListPanel
                    companies={ecosystemData.filter(
                      (c) => c.type === 'startup',
                    )}
                    selectedCompany={selectedCompany}
                    onSelectCompany={setSelectedCompany}
                  />
                </div>
                {/* Right Panel - Company Details */}
                <div className='col-span-5 overflow-hidden'>
                  <CompanyDetailPanel company={selectedCompany} />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Incumbents View */}
          <TabsContent value='incumbents' className='mt-0'>
            <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border'>
              <div className='grid h-[500px] grid-cols-7'>
                {/* Left Panel - Company List */}
                <div className='aucctus-border-secondary col-span-2 overflow-hidden border-r'>
                  <CompanyListPanel
                    companies={ecosystemData.filter(
                      (c) => c.type === 'incumbent',
                    )}
                    selectedCompany={selectedCompany}
                    onSelectCompany={setSelectedCompany}
                  />
                </div>
                {/* Right Panel - Company Details */}
                <div className='col-span-5 overflow-hidden'>
                  <CompanyDetailPanel company={selectedCompany} />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Product Carousel */}
        <ProductCarousel ecosystemData={ecosystemData} />
        {/* Future Predictions */}
        <FuturePredictions predictions={futurePredictions} />
      </div>
    </div>
  );
};

export default EcosystemV2;
