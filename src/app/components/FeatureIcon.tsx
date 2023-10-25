
import { FunctionComponent } from "react";

import Home from '../../app/assets/icons/Home'
import FileSearch from "../assets/icons/FileSearch";
import Lightbulb from "../assets/icons/Lightbulb";
import Rocket from "../assets/icons/Rocket";
import Help from "../assets/icons/Help";
import Gear from "../assets/icons/Gear";


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