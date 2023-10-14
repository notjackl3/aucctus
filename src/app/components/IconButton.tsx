import { FunctionComponent } from "react";
import styles from "./IconButton.module.css";

type IconButtonType = {
  icon?: string;
};

const IconButton: FunctionComponent<IconButtonType> = ({ icon }) => {
  return (
    <div className={styles.sizemdHierarchysecondaryG}>
      <img className={styles.placeholderIcon} alt="" src={icon} />
    </div>
  );
};

export default IconButton;
