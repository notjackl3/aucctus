import styles from '../../assets/styles/components/dashboard-insights.module.scss'
import { FunctionComponent, useState } from "react";
import CompetitorNews from "./CompetitorNews";
import { generateRandomString } from "../../../libs/utils";
import { useQuery } from 'react-query';
import api from '../../../libs/api';
import Loading from '../Loading';
import { IArticle } from '../../../libs/api/typings/organization';
import { useSelector } from 'react-redux';
import { selectOrganization } from '../../../features/auth/auth.slice';



const CompetitorNewsContainer: FunctionComponent = () => {
  const organization = useSelector(selectOrganization)
  const [error, setError] = useState<string | undefined>(undefined)
  const [data, setData] = useState<IArticle[]>([])

  const query = useQuery({
    queryKey: 'competitorNew',
    retry: 0,
    queryFn: async () => await api.organization.getCompetitorNews(),
    onError: (error) => {
      setError("Oops something when wrong")
    },
    onSuccess: (data) => {
      if (error) {
        setError(undefined)
      }
      setData(data)
    }
  })


  return (
    <div className={styles.dashboardInsights}>
      <span className={styles.header}>
        Competitor News
      </span>
      <div className={styles.content} >
        {query.isLoading ?

          <Loading />
          :
          data.slice(0, 4).map((content, i) => <CompetitorNews
            key={`${generateRandomString(4)}`}
            headLine={content.title}
            summary={content.description}
            source={content.url}
            image={content.urlToImage}
          />)
        }

      </div >
    </div>
  )
}

export default CompetitorNewsContainer;