import { FunctionComponent } from "react";
import styles from "./CurrentFalseSizelgTheme.module.css";

type CurrentFalseSizelgThemeType = {
  icon?: string;
};

const CurrentFalseSizelgTheme: FunctionComponent<
  CurrentFalseSizelgThemeType
> = ({ icon }) => {
  return (
    <div className={styles.currentfalseSizelgTheme}>
      <img className={styles.bell01Icon} alt="" src={icon} />
    </div>
  );
};

export default CurrentFalseSizelgTheme;
