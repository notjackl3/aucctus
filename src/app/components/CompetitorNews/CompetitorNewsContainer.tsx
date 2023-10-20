import { useSelector } from "react-redux";
import { selectOrganization } from "../../../features/auth/auth.slice";


import styles from '../../assets/styles/pages/dashboard.module.scss'
import { FunctionComponent, useState } from "react";
import CompetitorNews from "./CompetitorNews";

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
    <div className={styles.companyNews} >
      {
        news.map((content) => <CompetitorNews headLine={content.headline} summary={content.summary} />)
      }

    </div >
  )
}

export default CompetitorNewsContainer;