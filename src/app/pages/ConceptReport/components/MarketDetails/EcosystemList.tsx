import { FunctionComponent } from 'react';
import ConceptDetailCard from '../../../../components/Cards/ConceptDetailCard/ConceptDetailCard';
import styles from './styles/marketDetails.module.scss';
import { IIncumbentsEcosystem, IInvestorsEcosystem, IStartupEcosystem } from '../../../../../libs/api/types';
import images from '../../../../assets/img';
import Icon from '../../../../components/Icons/Icon/Icon';

const iconDefaultProps = {
  height: 24,
  width: 24,
  stroke: '#2B3674',
};

interface IEcosystemListProps {
  title: string;
  data: IStartupEcosystem[] | IIncumbentsEcosystem[] | IInvestorsEcosystem[];
}

const EcosystemList: FunctionComponent<IEcosystemListProps> = ({ title, data }) => {
  return (
    <ConceptDetailCard title={title} isHideFooter>
      <div className={styles.cardContent}>
        {data?.map((item) => (
          <div
            key={item.uuid}
            className={styles.cardRow}
            onClick={(e) => {
              e.preventDefault();
              window.open(item.source, '_blank');
            }}
          >
            <img
              className={styles.cardLogo}
              alt="company-logo"
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                e.currentTarget.src = images.companyLogoDefault;
              }}
              src={`https://logo.clearbit.com/${item.source}`}
            />
            <div className={styles.cardDescription}>
              <span className={styles.cardDescriptionTitle}>{item.name}</span>
              <p className={styles.cardDescriptionText}>{item.description}</p>
            </div>
            <Icon variant="link-external" {...iconDefaultProps} />
          </div>
        ))}
      </div>
    </ConceptDetailCard>
  );
};

export default EcosystemList;
