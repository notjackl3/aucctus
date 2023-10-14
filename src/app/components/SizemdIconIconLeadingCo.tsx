import { FunctionComponent, useMemo, type CSSProperties } from "react";
import styles from "./SizemdIconIconLeadingCo.module.css";

type SizemdIconIconLeadingCoType = {
  label?: string;
  showArrowUpIcon?: boolean;

  /** Style props */
  arrowUpIconWidth?: CSSProperties["width"];
  arrowUpIconHeight?: CSSProperties["height"];
  textLineHeight?: CSSProperties["lineHeight"];
};

const SizemdIconIconLeadingCo: FunctionComponent<
  SizemdIconIconLeadingCoType
> = ({
  label,
  showArrowUpIcon,
  arrowUpIconWidth,
  arrowUpIconHeight,
  textLineHeight,
}) => {
  const arrowUpIconStyle: CSSProperties = useMemo(() => {
    return {
      width: arrowUpIconWidth,
      height: arrowUpIconHeight,
    };
  }, [arrowUpIconWidth, arrowUpIconHeight]);

  const textStyle: CSSProperties = useMemo(() => {
    return {
      lineHeight: textLineHeight,
    };
  }, [textLineHeight]);

  return (
    <div className={styles.sizemdIconiconLeadingCo}>
      {showArrowUpIcon && (
        <img
          className={styles.arrowUpIcon}
          alt=""
          src="/assets/icons/arrowup.svg"
          style={arrowUpIconStyle}
        />
      )}
      <div className={styles.text} style={textStyle}>
        {label}
      </div>
    </div>
  );
};

export default SizemdIconIconLeadingCo;
