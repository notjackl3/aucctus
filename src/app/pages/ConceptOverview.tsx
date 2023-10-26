import { FunctionComponent, useState } from "react";

import styles from "../assets/styles/pages/concept-overview.module.scss"
import images from "../assets/img";
import ConceptCard from "../components/ConceptCard";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";


const mockData = {
  title: "Virtual Address & Package Forwarding Service",
  overview: "For Canadians traveling or living abroad, provide them a 'virtual address' in Canada. They can have packages delivered to this address, where Canada Post will hold, consolidate, and forward them internationally.",
  valueProposition: "Serve the needs of the growing number of digital nomads, travellers, and expatriates who want to shop from Canadian businesses.",
  annualRevenue: "$50M",
  totalAddressableMarket: "$945M",
  signals: ["Remote Work", "Digital Nomads", "Snow Birds"],
  industries: ["Travel", "Telecommunication", "Logistics"],
  targetUserGroup: ["Students living abroad", "Snow Birds", "Extended vacationers"],
  score: 82.5
}

const ConceptOverview: FunctionComponent = () => {
  const [data, setData] = useState(mockData)


  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <img
          alt="Concept Overview"
          src={images.conceptOverview}
        />
        <div className={styles.content}>
          <h1 className={styles.header}>
            {data.title}
          </h1>
          <div className={styles.contentContainer}>
            <div className={styles.conceptOverview}>
              <div className={styles.supportingText}>
                <span className={styles.title}>Overview</span>
                <span>{data.overview}</span>
              </div>

              <div className={styles.supportingText}>
                <span className={styles.title}>Value Proposition</span>
                <span>{data.valueProposition}</span>
              </div>

            </div>
            <div className={styles.details}>
              <div className={styles.detailContent}>
                <div className={styles.supportingText}>
                  <span className={styles.title}>Annual Revenue</span>
                  <span>{data.annualRevenue}</span>
                </div>
                <div className={styles.supportingText}>
                  <span className={styles.title}>Total Addressable Market</span>
                  <span>{data.annualRevenue}</span>
                </div>

              </div>

              <div className={styles.detailContent}>
                <div className={styles.supportingText}>
                  <span className={styles.title}>Signals</span>
                  {data.signals.slice(0, 3).map((s, i) => <span key={`signal-${i}`}>{s}</span>)}
                </div>
                <div className={styles.supportingText}>
                  <span className={styles.title}>Industries</span>
                  {data.industries.slice(0, 3).map((s, i) => <span key={`industries-${i}`}>{s}</span>)}
                </div>
                <div className={styles.supportingText}>
                  <span className={styles.title}>Target User Groups</span>
                  {data.targetUserGroup.slice(0, 3).map((s, i) => <span key={`target-user-group-${i}`}>{s}</span>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.contentContainer}>
        <ConceptCard
          title="Concept Score"
          subtitle="This concept is in the top percentile."
          width={360}
        >
          <div className={styles.cardContentWrapper}>
            <div style={{ height: 232 }}>
              <CircularProgressbar
                value={data.score}
                circleRatio={0.5}
                className={styles.progressbar}
                text="82.5"

                styles={buildStyles({
                  rotation: 0.75,
                  strokeLinecap: "round",
                  pathColor: "#4318ff",
                  trailColor: "#E0E5F2",
                  textColor: "#2B3674",

                })}
              />
            </div>
            <div className={styles.cardContent}>
              <span className={styles.title}>Let’s make it even stronger</span>
              <span className={styles.text}>We have identified 5 different areas that you can explore to make this concept even stronger</span>

            </div>
          </div>


        </ConceptCard>

        <ConceptCard
          title="Financial Projection"
          subtitle="Breakdown of business model canvas and hypotheses to validate."
          width={360}
        >
          <img
            alt="Financial Projection"
            src={images.financialProjection}
          />
        </ConceptCard>

        <ConceptCard
          title="Customer Profiles"
          subtitle="Breakdown of target user pain points and jobs to be done."
          width={360}
        >
          <img
            alt="Customer Profile"
            src={images.customerProfile}
          />


        </ConceptCard>

      </div>
    </div>
  )

}

export default ConceptOverview;