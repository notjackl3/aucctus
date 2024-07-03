import { FunctionComponent, ReactNode } from 'react';
import Icon from '../Icons/Icon/Icon';
import { Header } from '../ConceptReport';

interface ConceptDetailCardProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  title: string;
  subtitle?: string;
  children: ReactNode;
  isHideHeader?: boolean;
  isHideFooter?: boolean;
  headerAction?: ReactNode;
  footerAction?: ReactNode;
  cardClassName?: string;
  headerClassName?: string;
  contentClassName?: string;

  icon?: IconVariant;
}

const iconDefaultProps = {
  height: 16,
  width: 16,
  stroke: '#2B3674',
};

const ConceptDetailCard: FunctionComponent<ConceptDetailCardProps> = ({
  title,
  subtitle,
  children,
  icon,
  cardClassName,
  contentClassName,
  headerClassName,
  headerAction,
  isHideHeader,
  isHideFooter,
  footerAction,
  ...rest
}) => {
  return (
    <div
      {...rest}
      className={`flex w-[22.5rem] flex-col items-center self-stretch rounded-xl border border-gray-200 bg-white shadow-sm  ${cardClassName ? cardClassName : ''}`}
    >
      {!isHideHeader && (
        <div
          className={`box-border flex max-w-full flex-col items-start justify-start gap-2 self-stretch border-b border-solid border-b-gray-300 px-6 py-3 ${headerClassName}`}
        >
          {/* Title */}
          <div className='flex-column flex max-w-full items-center justify-between self-stretch'>
            <span className='flex max-w-full flex-row items-center justify-center gap-2'>
              {icon && <Icon variant={icon} {...iconDefaultProps} />}
              <Header text={title} />
            </span>
            {headerAction}
          </div>

          {/* Subtitle */}
          {subtitle && (
            <h5 className='max-w-full text-wrap text-sm font-normal leading-tight text-gray-500'>{subtitle}</h5>
          )}
        </div>
      )}
      <div className={`flex w-full flex-[1_0_auto] flex-col items-center justify-start ${contentClassName}`}>
        {children}
      </div>
      {!isHideFooter && (
        <div className='flex justify-between self-stretch border-t border-solid border-t-gray-200 px-6 py-3'>
          {footerAction}
        </div>
      )}
    </div>
  );
};

export default ConceptDetailCard;
