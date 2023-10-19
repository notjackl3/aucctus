import { FunctionComponent } from "react";
import styles from "../assets/styles/components/ignite-box.module.scss";
import { AppPath } from "../../routes/routes";
import { useNavigate } from "react-router-dom";

import FileSearchIcon from '../assets/icons/filesearch.svg?react'
import LightbulbIcon from '../assets/icons/lightbulb.svg?react'
import ArrowRightIcon from '../assets/icons/ArrowRight.svg?react'



const defaultIconProps = {
  height: 24,
  width: 24,
  stroke: "#2B3674"
}

const icons = {
  "file": <FileSearchIcon {...defaultIconProps} />,
  "lightbulb": <LightbulbIcon {...defaultIconProps} />
}

interface IgniteBoxProps {
  title: string;
  subtitle: string;
  link: AppPath
  icon: keyof typeof icons
}

const IgniteBox: FunctionComponent<IgniteBoxProps> = ({ title, subtitle, link, icon }) => {
  const navigate = useNavigate()

  return (
    <div className={styles.igniteBox}
      onClick={() => navigate(link)}
    >
      <div className={styles.content}>
        {icons[icon]}
        <span>{title}</span>
        <p>{subtitle}</p>
      </div>

      <button className={`btn ${styles.button}`}
        onClick={() => navigate(link)}
      >
        Ignite
        <ArrowRightIcon width={24} height={24} color="#fff" />
      </button>
    </div>
  );
};

export default IgniteBox;
