import { FunctionComponent } from "react";

import BankIcon from '../assets/icons/bank.svg?react'
import LineChartIcon from '../assets/icons/line-chart-up.svg?react'
import GlobeIcon from '../assets/icons/globe.svg?react'
import ThreeStarIcon from '../assets/icons/threeStars.svg?react'
import RightArrowIcon from '../assets/icons/arrowright.svg?react'

import styles from "../assets/styles/components/domain-box.module.scss"
import images from "../assets/img";



const iconDefaultProps = {
  height: 20,
  width: 20,
  stroke: "#7586a9"

}

interface DomainBoxProps {
  title: string;
  overview: string

  totalAddressableMarket: number;
  compoundAnnualGrowth: number;
  ventureCapitalInvestment: number;
}

const DomainBox: FunctionComponent<DomainBoxProps> = ({ title, overview, totalAddressableMarket, compoundAnnualGrowth, ventureCapitalInvestment }) => {

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header} >
          <img
            alt="domain-booklet"
            src={images.domainBooklet}

          />
          <div className={styles.supportingText}>
            <span className={styles.title}>{title}</span>
            <span className={styles.overview}>{overview}</span>
          </div>
        </div>

        <div className={styles.importantMetrics} >
          <span className={styles.metricHeader}>Important Metrics</span>

          <div className={styles.metric}>
            <div>
              <GlobeIcon {...iconDefaultProps} />
              <span>Total Addressable Market (TAM)</span>
            </div>
            <span>{totalAddressableMarket}% /year</span>
          </div>

          <div className={styles.metric}>
            <div>
              <LineChartIcon {...iconDefaultProps} />
              <span>Compound Annual Growth Rate (CAGR)</span>
            </div>
            <span>{compoundAnnualGrowth} /year</span>
          </div>

          <div className={styles.metric}>
            <div>
              <BankIcon {...iconDefaultProps} />
              <span>Venture Capital Investment</span>
            </div>
            <span>${ventureCapitalInvestment}</span>
          </div>

        </div>

      </div>
      <div className={styles.actionable}>
        <div className={styles.newDomain}>
          <ThreeStarIcon {...iconDefaultProps} stroke="#039855" />
          New Domain
        </div>

        <button
          className={`btn btn-light`}

        >
          Explore Domain
          <RightArrowIcon {...iconDefaultProps} stroke="#626ba3" />
        </button>


      </div>
    </div>
  )
}

export default DomainBox