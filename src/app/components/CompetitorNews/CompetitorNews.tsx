import { FunctionComponent } from "react";
import styles from "../../assets/styles/components/competitor-news.module.scss";
import images from "../../assets/img";


interface CompetitorNewsProps {
  headLine: string;
  summary: string;
  image: string;
  source: string
}
const CompetitorNews: FunctionComponent<CompetitorNewsProps> = ({ headLine, summary, source, image }) => {
  return (
    <a className={styles.competitorNews} href={source} target="_blank">
      <img
        alt='Competitor News'
        src={image}
      />
      <div className={styles.content}>
        <span className={styles.headline}>
          {headLine}
        </span>
        <span className={styles.summary}>
          {summary}
        </span>
      </div>
    </a>
  );
};

export default CompetitorNews;
