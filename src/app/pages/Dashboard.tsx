import { FunctionComponent } from "react";
import DashboardHeader from "../components/DashbaordHeader";
import { useSelector } from "react-redux";
import { selectOrganization } from "../../features/auth/auth.slice";
import CompanyMetric from "../components/CompanyMetric";
import IgniteBox from "../components/IgniteBox";
import { AppPath } from "../../routes/routes";

import styles from '../assets/styles/pages/dashboard.module.scss'
import CompetitorNewsContainer from "../components/CompetitorNews/CompetitorNewsContainer";
import InnovationGoal from "../components/InnovationGoal";
import CompanyMetricsContainer from "../components/CompanyMetricsContainer";

const Dashboard: FunctionComponent = () => {
  const organization = useSelector(selectOrganization)!


  return (
    <div className={styles.dashboard} >
      <DashboardHeader title={organization.name} supportingText="The latest domain reports as they relate to your business." />
      <section className={`${styles.companyInsights}`}>
        <InnovationGoal />

        <div className={`${styles.container}  ${styles.companyMetrics}`}>

          <CompanyMetricsContainer />
          <div className={`${styles.container} ${styles.ignite}`}>
            <IgniteBox title="Ignite Domain" subtitle="Generate industry reports" link={AppPath.IgniteDomain} icon="file" />
            <IgniteBox title="Ignite Concept" subtitle="Generate powerful concepts" link={AppPath.IgniteConcept} icon="lightbulb" />
          </div>

        </div>
      </section >

      <section className={`${styles.newsAndOpportunities}`} >
        <CompetitorNewsContainer />
        <CompetitorNewsContainer />

      </section>
      <section>

      </section>
    </div >
  )
}

export default Dashboard;