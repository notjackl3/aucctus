import { FunctionComponent, useState } from "react";

import styles from '../assets/styles/pages/domain-market.module.scss';
import CompanyMetric from "../components/CompanyMetric";
import { useSelector } from "react-redux";
import { selectOrganization } from "../../features/auth/auth.slice";
import images from "../assets/img";
import DomainMarketBox from "../components/DomainMarketBox";



const mockData = {
  overview: "Empowering the future of communication and commerce by bridging Canadian communities with pioneering solutions, elevating every experience through sustainable, tech-driven, and health-centric innovations. We envision a Canada where every individual, irrespective of their location, has timely and intuitive access to essential services that enrich lives, foster growth, and cultivate possibilities.",
  totalAddressableMarket: 25,
  compoundAnnualGrowthRate: 25,
  whyUs: "Canada Post, with its expansive infrastructure, unparalleled reach, and a legacy of trust built over the decades, stands at an opportune crossroads in the age of remote work. As the digital nomad demographic swells, the need for flexible, reliable, and technologically-advanced mail services rises concomitantly."
}

const DomainMarket: FunctionComponent = () => {
  const organization = useSelector(selectOrganization)!
  const [data, setData] = useState(mockData)

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
            <span className={styles.text}>{data.overview}</span>
          </div>
          <div className={styles.metrics}>
            <CompanyMetric
              title="Total Addressable Market"
              value={data.totalAddressableMarket}
            />
            <CompanyMetric
              title="Total Addressable Market"
              value={data.totalAddressableMarket}
            />
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.about}>
            <div className={styles.overview}>
              <h4>Why {organization.name}</h4>
              <span className={styles.text}>{data.whyUs}</span>
            </div>

            <div className={styles.overviewBoxContainer}>

              <DomainMarketBox
                title="Nationwide Infrastructure"
                description="Canada Post's widespread physical presence across the country, from urban centers to the most remote regions, gives it a unique edge in serving digital nomads no matter where they choose to work."
              />
              <DomainMarketBox
                title="Trusted Brand"
                description="Having built credibility over the years, customers are more likely to entrust Canada Post with their essential communication needs, a crucial factor for remote workers who may rely heavily on timely and secure mail and package delivery."
              />
              <DomainMarketBox
                title="Technological Capabilities"
                description="With investments in digital transformation, Canada Post is primed to develop or integrate tech-driven solutions, like virtual mailboxes and AI-powered mail sorting, catering precisely to the needs of a mobile workforce."
              />

            </div>


          </div>

          <div className={styles.marketSegment}>
            <div className={styles.marketSegmentHeader}>
              <span>Market Segment</span>
            </div>
            <div className={styles.imgContainer}>
              <img
                alt={"Market Segment"}
                src={images.marketSegment}
              />
              <div className="comingSoon">
                <div className="comingSoonWrapper">
                  <button className="btn btn-light">Coming Soon</button>
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
  )
}

export default DomainMarket;