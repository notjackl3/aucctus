import { FunctionComponent, useCallback, useState } from "react";
import Footer from "../components/Footer";
import HeaderNavigation from "../components/Auth/HeaderNavigation";
import OnboardingIntoSection from "../components/OnboardingIntroSection";

import styles from "../assets/styles/pages/auth-screens.module.scss"
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../hooks";
import InputField from "../components/InputField";
import { validDomain } from "../../libs/utils";

const OnBoarding: FunctionComponent = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [name, setName] = useState<string>("")
  const [domain, setDomain] = useState<string>("")
  const [goal, setGoal] = useState<string>("")
  const [competitors, setCompetitors] = useState<string>("")
  const [competitorsList, setCompetitorsList] = useState<string>("")
  const [kpis, setKPIs] = useState<string>("")
  const [kpisList, setKPISList] = useState<string>("")


  const [domainInputError, setDomainInputError] = useState<string | undefined>()
  const [error, setError] = useState<string | undefined>()

  const _handleDomainValidation = useCallback((e: React.FocusEvent) => {
    if (domain && !validDomain(domain)) {
      setDomainInputError('Enter a valid domain name.')
    } else {
      setDomainInputError(undefined)
    }

  }, [domain])

  const _handleCompetitorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCompetitors(value)
    setCompetitorsList(splitListedItems(value))
  }

  const _handleKPIChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setKPIs(value)
    setKPISList(splitListedItems(value))
  }

  const splitListedItems = (items: string) => {
    const list = items.split(',').slice(0, -1)
    return list.join(" \u2022\ ")
  }

  const _handleRegistration = () => {

  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.formSection}>
        <HeaderNavigation />
        <div className={styles.form}>
          <div className={styles.header}>
            <span className={styles.title}>Welcome aboard!</span>
            <span className={styles.supportingText}>
              Answer the prompts below to start innovating
            </span>
          </div>

          <div className={styles.basicForm}>
            <InputField
              name={"companyName"}
              label={"Company Name"}
              value={name}
              placeholder="Acme Widgets Corp."
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            />
            <InputField
              name={"companyUrl"}
              label={"Company Url"}
              error={!!domainInputError}
              errorMessage={domainInputError}
              value={domain}
              placeholder="www.acmewidgetscorp.com"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDomain(e.target.value)}
              onFocus={() => setDomainInputError(undefined)}
              onBlur={_handleDomainValidation}
            />
            <InputField
              name={"goal"}
              label={"What is your organization looking to achieve through innovation?"}
              value={goal}
              placeholder="Expand into new industries."
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGoal(e.target.value)}
            />

            <InputField
              name={"competitors"}
              label={"Who are your main competitors?"}
              placeholder="Treehouse Corp, Pug River Corporation, etc."
              value={competitors}
              hintText={competitorsList}
              onChange={_handleCompetitorChange}
              onBlur={(e) => setCompetitorsList(competitors.split(',').join(" \u2022\ "))}

            />

            <InputField
              name={"kvps"}
              label={"What are key KPI’s driving your innovation team?"}
              placeholder="12-month revenue, products in market, etc"
              value={kpis}
              hintText={kpisList}
              onChange={_handleKPIChange}
              onBlur={(e) => setKPISList(kpis.split(',').join(" \u2022\ "))}

            />

            <button
              type="button"
              className="btn btn-primary"
              onClick={_handleRegistration}
              disabled={!name || !domain || !goal || !competitors || !kpis || !!domainInputError}
            >Complete</button>
          </div>
        </div>
        <Footer />
      </div>
      <OnboardingIntoSection />
    </div>
  )
}


export default OnBoarding;