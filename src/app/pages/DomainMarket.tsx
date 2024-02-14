import { FunctionComponent, useState } from 'react';

import styles from '../assets/styles/pages/domain-market.module.scss';
import CompanyMetric from '../components/CompanyMetric';
import { useSelector } from 'react-redux';
import { selectOrganization } from '../../features/auth/auth.slice';
import images from '../assets/img';
import DomainMarketBox from '../components/DomainMarketBox';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import api from '../../libs/api';
import { IDomainMarket, IGeneratedDomain } from '../../libs/api/typings/ignite-domain';
import Loading from '../components/Loading';

const DomainMarket: FunctionComponent = () => {
  let { id } = useParams();
  const organization = useSelector(selectOrganization)!;
  const [data, setData] = useState<IDomainMarket | undefined>();
  const [domain, setDomain] = useState<IGeneratedDomain | undefined>();

  const domainQuery = useQuery({
    queryKey: 'domain',
    cacheTime: 1000,
    retry: 2,
    queryFn: async () => await api.igniteDomain.getDomain(id || ''),
    onSuccess: (response) => {
      setDomain(response);
    },
  });

  const overviewQuery = useQuery({
    queryKey: 'domain/market',
    cacheTime: 1000,
    retry: 2,
    queryFn: async () => await api.igniteDomain.getDomainMarket(id || ''),
    onSuccess: (response) => {
      setData(response);
    },
  });

  return (
    <div className={styles.domainMarket}>
      <div className={styles.pageHeader}>
        <h1>Market</h1>
        <div className={styles.actionable}>
          <button className="btn btn-light disabled">Customize</button>
          <button className="btn btn-light disabled">Export</button>
        </div>
      </div>
      <div className={styles.contentWrapper}>
        <div className={styles.domainOverview}>
          <div className={styles.overview}>
            <h4>Overview</h4>
            <span className={styles.text}>{domainQuery.isLoading ? <Loading /> : domain?.overview}</span>
          </div>
          <div className={styles.metrics}>
            <CompanyMetric title="Total Addressable Market" value={domain?.totalAddressableMarketRate} />
            <CompanyMetric title="Compound Annual Growth Rate" value={`${domain?.compoundAnnualGrowthRate}%`} />
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.about}>
            <div className={styles.overview}>
              <h4>Why {organization.name}</h4>
              <span className={styles.text}>{overviewQuery.isLoading ? <Loading /> : data?.overallReasoning}</span>
            </div>

            <div className={styles.overviewBoxContainer}>
              {overviewQuery.isLoading ? (
                <Loading />
              ) : (
                data?.competitiveAdvantages.map((c) => (
                  <DomainMarketBox title={c.title} description={`${c.reasoning} \n ${c.description}`} />
                ))
              )}
            </div>
          </div>

          <div className={styles.marketSegment}>
            <div className={styles.marketSegmentHeader}>
              <span>Market Segment</span>
            </div>
            <div className={styles.imgContainer}>
              <img alt={'Market Segment'} src={images.marketSegment} />
              <div className="comingSoon">
                <div className="comingSoonWrapper">
                  <div className="comingSoonText">Coming Soon</div>
                </div>
              </div>
            </div>

            <div className={styles.marketSegmentFooter}>
              <button className="btn btn-light disabled">View Full Report</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DomainMarket;
