import { FunctionComponent, useEffect, useMemo, useState } from "react";
import { useQuery } from "react-query";
import { useParams, useSearchParams } from "react-router-dom";
import api from "../../../libs/api";
import { IConceptCustomerProfile } from "../../../libs/api/typings/ignite-concepts";
import Loading from "../../components/Loading";

import Lightbulb from "../../assets/icons/lightbulb.svg?react";
import Target from '../../assets/icons/target.svg?react';
import Rocket from "../../assets/icons/rocket.svg?react";
import styles from '../../assets/styles/pages/customer-personas.module.scss';
import SimpleList from "../../components/SimpleList";




const defaultIconProps = {
  stroke: "#2B3674",
  width: 24,
  height: 24
}

const Persona: FunctionComponent = () => {
  let { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams()
  const persona = searchParams.get('persona')
  const [currentPersona, setCurrentPersona] = useState<string | undefined>()
  const [customerProfile, setCustomerProfile] = useState<IConceptCustomerProfile | undefined>()



  const query = useQuery({
    queryKey: [`concept/:id/customer-profile/:group`, id, persona],
    enabled: false, // Prevent from automatically running
    cacheTime: 1000,
    queryFn: async () => {
      if (id && persona) return await api.igniteConcept.getCustomerProfile(id, persona)
    },
    onSuccess: (response) => {
      setCustomerProfile(response)
      setCurrentPersona(persona || undefined)
    }
  })

  const isLoading = useMemo(() => query.isLoading || query.isFetching || query.isRefetching, [query.isFetching, query.isLoading, query.isRefetching])

  useEffect(() => {
    if (persona !== currentPersona) {
      query.refetch()
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persona, currentPersona, query.refetch])



  return (
    <div className={styles.profile}>
      <section className={styles.header}>

        <div className={styles.content}>
          <div className={styles.image} />
          <div className={styles.supportingText}>
            <span>{isLoading ? <Loading /> : customerProfile?.nickname}</span>
            <h1>Sarah Lim</h1>
          </div>
        </div>
        <button className="btn btn-primary disabled" disabled>Edit Persona</button>
      </section>
      <section className={styles.details}>
        <div className={styles.description}>
          <h2>Persona Description</h2>
          <span>
            {isLoading ? <Loading /> :
              customerProfile?.description}
          </span>
        </div>
        <div className={styles.demographics}>
          <h2>Demographics</h2>
          <div className={styles.content}>
            <div className={styles.info}>
              <Lightbulb {...defaultIconProps} />
              <span>
                <strong>Geographic Location:</strong> {isLoading ? <Loading /> : customerProfile?.demographics.geographicLocation || 'N/A'}
              </span>
            </div>
            <div className={styles.info}>
              <Lightbulb {...defaultIconProps} />
              <span>
                <strong>Age Range:</strong> {isLoading ? <Loading /> : customerProfile?.demographics.ageRange || 'N/A'}
              </span>
            </div>
            <div className={styles.info}>
              <Lightbulb {...defaultIconProps} />
              <span>
                <strong>Family Size:</strong> {isLoading ? <Loading /> : customerProfile?.demographics.familySize || 'N/A'}
              </span>
            </div>
            <div className={styles.info}>
              <Lightbulb {...defaultIconProps} />
              <span>
                <strong>Average Income:</strong> {isLoading ? <Loading /> : customerProfile?.demographics.averageIncome || 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </section>
      <section className={styles.maps}>
        <div className={styles.header}>
          <h2>Customer Needs Map</h2>
        </div>
        <div className={styles.content}>
          <SimpleList
            isLoading={isLoading}
            title={'Jobs to be Done'}
            icon="clipboard"
            minLength={5}
            maxLength={5}
            items={customerProfile?.jobs || []}
          />
          <SimpleList
            isLoading={isLoading}
            title={'Pains'}
            icon="umbrella"
            minLength={5}
            maxLength={5}
            items={customerProfile?.pains || []}
          />
          <SimpleList
            isLoading={isLoading}
            title={'Quotes'}
            icon="messageCircle"
            minLength={5}
            maxLength={5}
            items={customerProfile?.quotes || []}
          />

        </div>
      </section>
    </div>
  )
}

export default Persona;
