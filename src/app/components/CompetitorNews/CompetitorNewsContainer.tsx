import styles from '../../assets/styles/components/dashboard-insights.module.scss'
import { FunctionComponent, useState } from "react";
import CompetitorNews from "./CompetitorNews";
import { generateRandomString } from "../../../libs/utils";

interface CompanyNewsProps {


}

const mockData = [
  {
    headline: "Last Mile Delivery",
    summary: "With investments in digital transformation, Canada Post is primed to develop or integrate tech-driven solutions.",
    source: "https://react.dev/",
    img: "",
  },
  {
    headline: "Uber joins forces with UPS",
    summary: "With investments in digital transformation, Canada Post is primed to develop or integrate tech-driven solutions.",
    source: "https://react.dev/",
    img: "",
  }
]

const CompetitorNewsContainer: FunctionComponent<CompanyNewsProps> = () => {
  const [news, setNews] = useState(mockData)


  return (
    <div className={styles.dashboardInsights}>
      <div className={styles.header}>
        <h2>Competitor News</h2>
      </div>
      <div className={styles.content} >
        {
          news.slice(0, 2).map((content, i) => <CompetitorNews key={`${generateRandomString(4)}`} headLine={content.headline} summary={content.summary} />)
        }

      </div >
    </div>
  )
}

export default CompetitorNewsContainer;