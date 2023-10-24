import { FunctionComponent, ReactNode } from "react";
import styles from "../../assets/styles/components/drawer.module.scss";
import Home from '../../../app/assets/icons/home.svg?react'
import FileSearch from "../../assets/icons/filesearch.svg?react";
import Lightbulb from "../../assets/icons/lightbulb.svg?react";
import Rocket from "../../assets/icons/rocket.svg?react";
import Lock from "../../assets/icons/lock.svg?react";
import Help from "../../assets/icons/help.svg?react";
import Gear from "../../assets/icons/gear.svg?react";
import ChevronUp from "../../assets/icons/chevronup.svg?react";
import { AppPath } from "../../../routes/routes";
import { useMatch, Link } from "react-router-dom";
import { useSpring, animated, useTransition } from "@react-spring/web";
import Collapsible from "../Collapsible";

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
  to: AppPath
  icon: keyof typeof navDrawerIcons
  locked?: boolean
  openBasePath?: AppPath
  nestedRoutes?: NestedRoute[]

}

interface NestedRoute {
  title: string;
  path: AppPath;
}




const NavLink: FunctionComponent<NavLinkProps> = ({ title, icon, to, locked = false, openBasePath, nestedRoutes }) => {
  const isOpen = !!useMatch(openBasePath || "path-does-not-exists")



  return (
    <div className={`${styles.navLink}  ${locked ? styles.locked : ""}`}>
      <Link to={to}>
        <div className={styles.label}>
          {navDrawerIcons[icon]}
          <span>{title}</span>
        </div>

        {locked ? <Lock {...defaultIconProps} /> : null}
        {isOpen ? <ChevronUp {...defaultIconProps} /> : null}
      </Link>


      <Collapsible width={"100%"} toggle={isOpen}>
        {nestedRoutes && nestedRoutes.map((route, i) => (
          <Link className={styles.nestedLink} to={route.path} key={`di-${route.title}-${i}`} >
            <span>{route.title}</span>
          </Link>
        ))}
      </Collapsible>

    </div >
  );
};

export default NavLink;