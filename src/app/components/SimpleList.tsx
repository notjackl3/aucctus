import { FunctionComponent, useEffect, useMemo, useState } from "react"



import styles from '../assets/styles/components/simple-list.module.scss'
import Loading from "./Loading";
import Icon, { IconVariant } from "./Icon";



const defaultIconProps = {
  stroke: '#2B3674',
  width: 24,
  height: 24

}


interface SimpleListProps {
  title: string;
  subtitle?: string;
  items: string[]
  icon: keyof typeof IconVariant
  maxLength?: number
  minLength?: number;
  isLoading?: boolean
}



const SimpleList: FunctionComponent<SimpleListProps> = ({ title, subtitle, icon, items, maxLength = 5, minLength = 0, isLoading = false }) => {
  const [data, setData] = useState<string[]>([])

  const numberOfItemsToAdd = useMemo(() => items.length < minLength ? minLength - items.length : 0, [items.length, minLength])
  const numberOfItemsToRemove = useMemo(() => items.length > maxLength ? items.length - maxLength : 0, [items.length, maxLength])



  useEffect(() => {
    let arr: string[] = []
    if (numberOfItemsToAdd > 0) {
      arr = [...items]
      for (let i = 0; i < numberOfItemsToAdd; i++) {
        arr.push("")
      }
    } else if (numberOfItemsToRemove > 0) {
      arr = items.slice(0, items.length - numberOfItemsToRemove)
    } else {
      arr = items
    }

    setData(arr)

  }, [items, numberOfItemsToAdd, numberOfItemsToRemove])


  return (
    <div className={styles.simpleList}>
      <div className={styles.header}>
        <Icon variant={icon} {...defaultIconProps} />
        <span>{title}</span>

        {subtitle ?
          // TODO: add styling
          <span className={styles.subtitle}>{subtitle}</span>
          : null}
      </div>
      <div className={styles.content}>
        {data.map((item) => (
          <span className={styles.item}>
            {isLoading ? <Loading /> : item}
          </span>
        ))}
      </div>
    </div>
  )

}

export default SimpleList;