import { FunctionComponent } from "react";
import styles from "../../assets/styles/components/drawer.module.scss";
import Home from '../../../app/assets/icons/Home'
import FileSearch from "../../assets/icons/filesearch.svg?react";
import Lightbulb from "../../assets/icons/lightbulb.svg?react";
import Rocket from "../../assets/icons/Rocket";
import Lock from "../../assets/icons/lock.svg?react";
import Help from "../../assets/icons/help.svg?react";
import Gear from "../../assets/icons/Gear";
import ChevronUp from "../../assets/icons/ChevronUp";
import { AppPath } from "../../../routes/routes";
import { useMatch, Link } from "react-router-dom";
import Collapsible from "../Collapsible";
import NestedLink, { NestedLinkProps } from "./NestedLink";

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
  nestedRoutes?: NestedLinkProps[]

}





const NavLink: FunctionComponent<NavLinkProps> = ({ title, icon, to, locked = false, openBasePath, nestedRoutes }) => {
  const isOpen = !!useMatch(openBasePath || "path-does-not-exists")

  return (
    <div className={`${styles.navLinkWrapper}  ${locked ? styles.locked : ""}`}>
      <Link to={!locked ? to : "javascript:void(0)"} className={styles.navLink}>
        <div className={styles.label}>
          {navDrawerIcons[icon]}
          <span>{title}</span>
        </div>

        {locked ? <Lock {...defaultIconProps} /> : null}
        {isOpen ? <ChevronUp {...defaultIconProps} /> : null}
      </Link>


      {nestedRoutes ? <Collapsible width={"100%"} toggle={isOpen}>
        {nestedRoutes && nestedRoutes.map((route, i) => (
          <NestedLink
            key={`di-${route.title}-${i}`}
            {...route}
          />
        ))}
      </Collapsible> : null}

    </div >
  );
};

export default NavLink;