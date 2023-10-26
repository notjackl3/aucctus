import { FunctionComponent, useState } from "react";


import DownloadIcon from '../assets/icons/download.svg?react'
import FileSearchIcon from '../assets/icons/filesearch.svg?react'

import styles from '../assets/styles/pages/domain-list.module.scss'
import DomainBox from "../components/DomainBox";
import { useNavigate } from "react-router-dom";
import { AppPath } from "../../routes/routes";
import api from "../../libs/api";
import { IGeneratedDomain } from "../../libs/api/typings/ignite-domain";
import { useQuery } from "react-query";
import Loading from "../components/Loading";
import ignite from "../assets/icons/ignite.svg";


// TODO: Grab data from api if there are no domains re direct user to ignite Domain

const DomainList: FunctionComponent = () => {
  const navigate = useNavigate()
  const [data, setData] = useState<IGeneratedDomain[]>([])
  const [fetchComplete, setFetchComplete] = useState<boolean>(false)


  const query = useQuery({
    queryKey: "domain-list",
    cacheTime: 100,
    queryFn: async () => await api.igniteDomain.getAllDomains(),
    onSuccess: (response) => {
      setData(response)
      setFetchComplete(true)
    },
    onError: () => {
      setFetchComplete(true)
    }
  })

  return (
    <div className={styles.domainList} >
      <div className={styles.header}>

        <div className={styles.text}>
          <h1>Domain List</h1>
          <span className={styles.supportingText}>
            The latest domain reports as they relate to your business
          </span>
        </div>

        <div className={styles.actionable}>
          <button className="btn btn-light disabled">Edit Inputs</button>
          <button className="btn btn-light disabled">
            <DownloadIcon height={20} width={20} />
            Export All
          </button>
          <button className="btn btn-primary"
            onClick={() => {
              navigate(AppPath.IgniteDomain)
            }}
          >
            <FileSearchIcon height={20} width={20} />
            Ignite Domain
          </button>

        </div>


      </div>
      <div className={styles.content}>

        {query.isLoading ?

          <div className={styles.loadingContainer}>

            <Loading />


          </div>

          :

          fetchComplete && (!data || data.length <= 0) ?
            <div className={styles.emptyDomain}>
              <img
                alt="Ignite your Domain"
                src={ignite}
              />
            </div>
            :

            data?.map((d) =>
              <DomainBox
                id={d.id}
                title={d.title}
                overview={d.overview}
                totalAddressableMarket={d.totalAddressableMarketRate}
                compoundAnnualGrowth={d.compoundAnnualGrowthRate}
              />)


        }
      </div>
    </div >
  )
}

export default DomainList;