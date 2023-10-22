
import { FunctionComponent } from "react";

import Home from '../../app/assets/icons/home.svg?react'
import FileSearch from "../assets/icons/filesearch.svg?react";
import Lightbulb from "../assets/icons/lightbulb.svg?react";
import Rocket from "../assets/icons/rocket.svg?react";
import Help from "../assets/icons/help.svg?react";
import Gear from "../assets/icons/gear.svg?react";


import styles from '../assets/styles/components/feature-icon.module.scss'


const defaultIconProps = {
  stroke: "#FFF",
  width: 24,
  height: 24

}
const featureIcon = {
  "home": <Home {...defaultIconProps} />,
  "file": <FileSearch {...defaultIconProps} />,
  "lightbulb": <Lightbulb {...defaultIconProps} />,
  "rocket": <Rocket {...defaultIconProps} />,
  "help": <Help {...defaultIconProps} />,
  "gear": <Gear {...defaultIconProps} />,
}
interface FeatureIconProps {
  icon: keyof typeof featureIcon
  color: 'purple' | 'green'
}


const FeatureIcon: FunctionComponent<FeatureIconProps> = ({ icon, color }) => {
  return (
    <div className={`${styles.outerRing} ${color === 'purple' ? styles.purple : styles.green}`} >
      {featureIcon[icon]}
    </div >
  )
}

export default FeatureIcon;