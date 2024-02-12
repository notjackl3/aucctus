import { FunctionComponent, useState } from "react";

import styles from '../../assets/styles/components/dashboard-insights.module.scss'
import images from "../../assets/img";

const CompetitorNewsContainer: FunctionComponent = () => {
  const [error, setError] = useState<string | undefined>(undefined)
  // const [data, setData] = useState<IArticle[]>([])

  // Temp Disable
  // const query = useQuery({
  //   queryKey: 'competitorNew',
  //   retry: 0,
  //   queryFn: async () => await api.organization.getCompetitorNews(),
  //   onError: (error) => {
  //     setError("Oops something when wrong")
  //   },
  //   onSuccess: (data) => {
  //     if (error) {
  //       setError(undefined)
  //     }
  //     setData(data)
  //   }
  // })


  return (
    <div className={styles.dashboardInsights}>
      <h2 className={styles.header}>
        Competitor News
      </h2>
      <div className={styles.content} >
        <img src={images.competitorNewsBlur} alt={""} />

        <div className="comingSoon">
          <div className="comingSoonWrapper">
            <div className="comingSoonText">Coming Soon</div>
          </div>
        </div>

        {/* {query.isLoading ?

          <Loading />
          :
          data.slice(0, 4).map((content, i) => <CompetitorNews
            key={`${generateRandomString(4)}`}
            headLine={content.title}
            summary={content.description}
            source={content.url}
            image={content.urlToImage}
          />)
        } */}

      </div >
    </div>
  )
}

export default CompetitorNewsContainer;