import { FunctionComponent } from "react";
import styles from '../assets/styles/pages/dashboard.module.scss'
import DashboardHeader from "../components/DashbaordHeader";
import { useSelector } from "react-redux";
import { selectOrganization } from "../../features/auth/auth.slice";
import CompanyMetric from "../components/CompanyMetric";
import IgniteBox from "../components/IgniteBox";
import { AppPath } from "../../routes/routes";

const Dashboard: FunctionComponent = () => {
  const organization = useSelector(selectOrganization)!

  return (
    <div className={styles.dashboard} >
      <DashboardHeader title={organization.name} supportingText="The latest domain reports as they relate to your business." />
      <section className={`${styles.section} ${styles.companyInsights}`}>
        <div className={styles.companyGoal}>
          <h3>Innovation Goal</h3>
          <p>
            {organization.goal}
          </p>

        </div>

        <div className={styles.companyMetrics}>
          <CompanyMetric title="Company Metric" value="$10,000" />
          <CompanyMetric title="Company Metric" value="$10,000" />
          <CompanyMetric title="Company Metric" value="$10,000" />

        </div>
        <div className={styles.ignite}>
          <IgniteBox title="Ignite Domain" subtitle="Generate industry reports" link={AppPath.Home} icon="file" />
          <IgniteBox title="Ignite Concept" subtitle="Generate powerful concepts" link={AppPath.Home} icon="lightbulb" />
        </div>


      </section>

      <section className={styles.section}>

      </section>


      <section>

      </section>
    </div >
  )
}

export default Dashboard;