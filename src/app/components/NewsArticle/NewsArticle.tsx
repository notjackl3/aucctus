import { FunctionComponent } from 'react';

import styles from './styles/newsArticle.module.scss';
import Icon from '../Icon';
import images from '../../assets/img';

const defaultIconProps = {
  stroke: '',
  width: 24,
  height: 24,
};

export interface NewsArticleProps {
  newsAricleClassName?: string;
  newsDescription: string;
  newsLink: string;
  newsTitle: string;
}

const NewsArticle: FunctionComponent<NewsArticleProps> = ({
  newsAricleClassName,
  newsLink,
  newsTitle,
  newsDescription,
}) => {
  return (
    <div className={`${styles.newsArticle} ${newsAricleClassName ? newsAricleClassName : ''}`}>
      <img className={styles.image} alt="news-image" src={images.deliveryNews} />
      <span className={styles.description}>
        <div className={styles.header}>
          <div className={styles.title}>{newsTitle}</div>
          {!!newsLink && (
            <a className={styles.link} target="_blank" rel="noopener noreferrer" href={newsLink}>
              <Icon variant="arrowUpRight" {...defaultIconProps} />
            </a>
          )}
        </div>
        <span className={`${styles.text} ${styles.textOverflow}`}>{newsDescription}</span>
      </span>
    </div>
  );
};

export default NewsArticle;
