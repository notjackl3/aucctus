import { FunctionComponent } from "react";


import DownloadIcon from '../assets/icons/Download'
import FileSearchIcon from '../assets/icons/FileSearch'

import styles from '../assets/styles/pages/domain-list.module.scss'
import DomainBox from "../components/DomainBox";
import { useNavigate } from "react-router-dom";
import { AppPath } from "../../routes/routes";


// TODO: Grab data from api if there are no domains re direct user to ignite Domain

const DomainList: FunctionComponent = () => {
  const navigate = useNavigate()

  return (
    <div className={styles.domainList} >
      <div className={styles.header}>

        <div className={styles.text}>
          <h3>Domain List</h3>
          <span className={styles.supportingText}>
            The latest domain reports as they relate to your business
          </span>
        </div>

        <div className={styles.actionable}>
          <button className="btn btn-light">Edit Inputs</button>
          <button className="btn btn-light">
            <DownloadIcon height={20} width={20} stroke="" />
            Export All
          </button>
          <button className="btn btn-primary"
            onClick={() => {
              navigate(AppPath.IgniteDomain)
            }}
          >
            <FileSearchIcon height={20} width={20} stroke="" />
            Ignite Domain
          </button>

        </div>


      </div>
      <div className={styles.content}>
        <DomainBox
          id="12"
          title="Remote Work Revolution"
          overview="As the global workforce undergoes a seismic shift towards remote and flexible work patterns, the traditional paradigms of mail and package delivery are being challenged."
          totalAddressableMarket={22.5}
          compoundAnnualGrowth={32.7}
          ventureCapitalInvestment={45}
        />
        {/* <DomainBox
          id="13"
          title="Remote Work Revolution"
          overview="As the global workforce undergoes a seismic shift towards remote and flexible work patterns, the traditional paradigms of mail and package delivery are being challenged."
          totalAddressableMarket={22.5}
          compoundAnnualGrowth={32.7}
          ventureCapitalInvestment={45}
        />
        <DomainBox
          id="14"
          title="Remote Work Revolution"
          overview="As the global workforce undergoes a seismic shift towards remote and flexible work patterns, the traditional paradigms of mail and package delivery are being challenged."
          totalAddressableMarket={22.5}
          compoundAnnualGrowth={32.7}
          ventureCapitalInvestment={45}
        />
        <DomainBox
          id="15"
          title="Remote Work Revolution"
          overview="As the global workforce undergoes a seismic shift towards remote and flexible work patterns, the traditional paradigms of mail and package delivery are being challenged."
          totalAddressableMarket={22.5}
          compoundAnnualGrowth={32.7}
          ventureCapitalInvestment={45}
        />
        <DomainBox
          id="16"
          title="Remote Work Revolution"
          overview="As the global workforce undergoes a seismic shift towards remote and flexible work patterns, the traditional paradigms of mail and package delivery are being challenged."
          totalAddressableMarket={22.5}
          compoundAnnualGrowth={32.7}
          ventureCapitalInvestment={45}
        /> */}
      </div>
    </div >
  )
}

export default DomainList;