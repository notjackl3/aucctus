
import { FunctionComponent } from "react";

import Home from '../../app/assets/icons/Home'
import FileSearch from "../assets/icons/FileSearch";
import Lightbulb from "../assets/icons/lightbulb.svg?react";
import Target from '../assets/icons/target.svg?react';
import Rocket from "../assets/icons/rocket.svg?react";
import SearchRefraction from "../assets/icons/search-refraction.svg?react"
import UserGroup from "../assets/icons/users-01.svg?react"
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
  "target": <Target  {...defaultIconProps} />,
  "searchRefraction": <SearchRefraction {...defaultIconProps} />,
  "userGroup": <UserGroup {...defaultIconProps} />
}
export interface FeatureIconProps {
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