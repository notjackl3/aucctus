import { FunctionComponent } from "react";
import DashboardHeader from "../components/DashbaordHeader";
import { useSelector } from "react-redux";
import { selectAccount } from "../../features/auth/auth.slice";
import IgniteBox from "../components/IgniteBox";
import { AppPath } from "../../routes/routes";

import styles from '../assets/styles/pages/dashboard.module.scss'
import CompetitorNewsContainer from "../components/CompetitorNews/CompetitorNewsContainer";
import InnovationGoal from "../components/InnovationGoal";
import CompanyMetricsContainer from "../components/CompanyMetricsContainer";
import InnovationActivity from "../components/InnovationActivity";
import InnovationLifecycle from "../components/InnovationLifecycle";

const Dashboard: FunctionComponent = () => {
  const { name: accountName } = useSelector(selectAccount) || { name: "" }


  return (
    <div className={styles.dashboard} >
      <DashboardHeader title={accountName || ''} supportingText="The latest domain reports as they relate to your business." />
      {/* <section className={`${styles.companyInsights}`}>
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
      </section>
      <section className="">
        <InnovationActivity />
        <InnovationLifecycle />
      </section> */}
    </div >
  )
}

export default Dashboard;