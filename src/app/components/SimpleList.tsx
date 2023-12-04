import { FunctionComponent, useEffect, useMemo, useState } from "react"

// import Home from '../../app/assets/icons/Home'
import FileSearch from "../assets/icons/filesearch.svg?react";
import Lightbulb from "../assets/icons/lightbulb.svg?react";
import Target from '../assets/icons/target.svg?react';
import Rocket from "../assets/icons/rocket.svg?react";
import SearchRefraction from "../assets/icons/search-refraction.svg?react"
import UserGroup from "../assets/icons/users-01.svg?react"
import Help from "../assets/icons/help.svg?react";
// import Gear from "../assets/icons/Gear";
import Clipboard from '../assets/icons/clipboard.svg?react';
import Umbrella from '../assets/icons/umbrella.svg?react';
import MessageCircle from '../assets/icons/message-circle.svg?react'

import styles from '../assets/styles/components/simple-list.module.scss'
import Loading from "./Loading";



const defaultIconProps = {
  stroke: '#2B3674',
  width: 24,
  height: 24

}
const listIcon = {
  // "home": <Home {...defaultIconProps} />,
  "file": <FileSearch {...defaultIconProps} />,
  "lightbulb": <Lightbulb {...defaultIconProps} />,
  "rocket": <Rocket {...defaultIconProps} />,
  "help": <Help {...defaultIconProps} />,
  // "gear": <Gear {...defaultIconProps} />,
  "target": <Target  {...defaultIconProps} />,
  "searchRefraction": <SearchRefraction {...defaultIconProps} />,
  "userGroup": <UserGroup {...defaultIconProps} />,
  "clipboard": <Clipboard {...defaultIconProps} />,
  "umbrella": <Umbrella {...defaultIconProps} />,
  "messageCircle": <MessageCircle {...defaultIconProps} />
}

interface SimpleListProps {
  title: string;
  subtitle?: string;
  items: string[]
  icon: keyof typeof listIcon
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
        {listIcon[icon]}
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