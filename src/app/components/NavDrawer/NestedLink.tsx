import { Link, useMatch } from "react-router-dom"


import styles from '../../assets/styles/components/nested-link.module.scss'
import { FunctionComponent } from "react";


interface NestedLinkProps {
  to: string;
  title: string
}


const NestedLink: FunctionComponent<NestedLinkProps> = ({ to, title }) => {
  const match = useMatch(to)


  return (
    <Link
      to={to}
      className={`${styles.nestedLink} ${match ? styles.active : ""} `}
    >

      <span>{title}</span>
    </Link>
  )
}

export default NestedLink;