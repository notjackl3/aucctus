import { FunctionComponent, useState } from "react";
import CompanyMetric from "./CompanyMetric";
import styles from '../assets/styles/pages/dashboard.module.scss'
import { useQuery } from "react-query";
import api from "../../libs/api";

const CompanyMetricsContainer: FunctionComponent = () => {
  const [metrics, setMetrics] = useState<string[]>()

  const query = useQuery({
    queryKey: "CompanyMetrics",
    retry: 3,
    queryFn: async () => await api.organization.getKips(),
    onError: (error) => {
      // TODO: Handle Error
    },
    onSuccess: (data) => {

      setMetrics(data)
    }

  })


  return (

    <div className={`${styles.container}  ${styles.metrics}`}>
      {query.isLoading ?
        <>
          <CompanyMetric title="Company Metric" isLoading />
          <CompanyMetric title="Company Metric" isLoading />
          <CompanyMetric title="Company Metric" isLoading />
        </>
        : metrics ? metrics.map((s, i) => <CompanyMetric key={`cm-${i}`} title={s} />)
          : null // show error  

      }

    </div>

  )
}

export default CompanyMetricsContainer;