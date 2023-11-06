import { FunctionComponent, ReactNode } from "react";

import styles from '../assets/styles/components/concept-card.module.scss'

interface ConceptCardProps {
  title: string;
  subtitle: string

  width?: number
  children: ReactNode

}



const ConceptCard: FunctionComponent<ConceptCardProps> = ({ title, subtitle, width, children }) => {

  return (
    <div className={styles.cardContainer} style={width ? { width } : {}}>
      <div className={styles.cardHeader}>
        <h4>{title}</h4>
        <span>{subtitle}</span>
      </div>
      <div className={styles.content}>
        {children}
      </div>
      <div className={styles.footer}>
        <button
          className="btn btn-light"
        >
          Coming Soon
        </button>

      </div>
    </div>
  )
}

export default ConceptCard;