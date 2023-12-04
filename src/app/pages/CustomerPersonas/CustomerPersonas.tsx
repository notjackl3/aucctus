import { FunctionComponent, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Persona from "./Persona";
import { useQuery } from "react-query";
import api from "../../../libs/api";
import Loading from "../../components/Loading";


import styles from '../../assets/styles/pages/customer-personas.module.scss';


const CustomerPersona: FunctionComponent = () => {
  let { id } = useParams();
  const [targetGroupList, setTargetGroupList] = useState<string[]>([])
  const [searchParams, setSearchParams] = useSearchParams()

  const targetGroupsQuery = useQuery({
    queryKey: `concept/${id}/target-group`,
    retry: 2,
    queryFn: async () => await api.igniteConcept.getTargetGroups(id || ""),
    onSuccess: (data) => {
      setTargetGroupList(data)
      setTargetGroup(data[0])
    },
  })

  const setTargetGroup = (group: string) => {
    searchParams.set('persona', group)
    setSearchParams(searchParams, { replace: true })
  }


  return (
    <div className={styles.customerPersonas}>
      <div className={styles.tabList}>
        {
          targetGroupsQuery.isLoading ? <Loading /> :
            <>
              {targetGroupList.map((targetGroup) => (
                <span
                  className={`${styles.tab} ${targetGroup === searchParams.get('persona') ? styles.active : ''}`}
                  key={targetGroup}
                  onClick={() => {
                    setTargetGroup(targetGroup)
                  }}
                >
                  {targetGroup}
                </span>
              ))}
            </>
        }
      </div>

      <Persona />
    </div >
  )
}



export default CustomerPersona;