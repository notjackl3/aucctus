import { FunctionComponent } from "react";
import styles from "../../assets/styles/components/drawer.module.scss";
import Home from '../../../app/assets/icons/home.svg?react'
import FileSearch from "../../assets/icons/filesearch.svg?react";
import Lightbulb from "../../assets/icons/lightbulb.svg?react";
import Rocket from "../../assets/icons/rocket.svg?react";
import Lock from "../../assets/icons/lock.svg?react";
import Help from "../../assets/icons/help.svg?react";
import Gear from "../../assets/icons/gear.svg?react";
import ChevronUp from "../../assets/icons/chevronup.svg?react";

const defaultIconProps = {
  stroke: "#7586A9",
  width: 24,
  height: 24

}
const navDrawerIcons = {
  "home": <Home {...defaultIconProps} />,
  "file": <FileSearch {...defaultIconProps} />,
  "lightbulb": <Lightbulb {...defaultIconProps} />,
  "rocket": <Rocket {...defaultIconProps} />,
  "help": <Help {...defaultIconProps} />,
  "gear": <Gear {...defaultIconProps} />,
}
interface NavLinkProps {
  title: string
  icon: keyof typeof navDrawerIcons
  locked?: boolean
  isOpen?: boolean
}


const NavLink: FunctionComponent<NavLinkProps> = ({ title, icon, locked = false, isOpen }) => {



  // Controls the Animation 
  // const { opacity, width, display } = useSpring({
  //   from: { width: '150', opacity: 1, display: 'flex' },
  //   to: async (next) => {
  //     await next(isOpen ? { display: "flex" } : { opacity: 0 })
  //     await next(isOpen ? { width: '302px' } : { width: '16px' /*'60px' */ });
  //     await next(isOpen ? { opacity: 1 } : { display: "none" });
  //   },
  //   config: {
  //     duration: isOpen ? 500 : 150
  //   }
  // });


  return (
    <div className={`${styles.navLink}  ${locked ? styles.locked : ""}`}>
      <div className={styles.label}>
        {navDrawerIcons[icon]}
        <span>{title}</span>
      </div>

      {locked ? <Lock {...defaultIconProps} /> : null}
      {isOpen ? <ChevronUp {...defaultIconProps} /> : null}
    </div>
  );
};

export default NavLink;