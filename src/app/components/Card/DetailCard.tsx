import { Header } from '@components';
import { FunctionComponent, ReactNode } from 'react';
import { DynamicIcon } from '@libs/utils/iconMap';

interface DetailCardProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
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

  icon?: string;
}

const iconDefaultProps = {
  height: 16,
  width: 16,
  stroke: '#2B3674',
};

const DetailCard: FunctionComponent<DetailCardProps> = ({
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
      className={`aucctus-border-secondary aucctus-bg-primary flex w-[22.5rem] flex-col items-center self-stretch rounded-md border shadow-sm  ${cardClassName ? cardClassName : ''}`}
    >
      {!isHideHeader && (
        <div
          className={`aucctus-border-primary aucctus-text-primary box-border flex max-w-full flex-col items-start justify-start gap-2 self-stretch border-b border-solid px-6 py-3 ${headerClassName}`}
        >
          {/* Title */}
          <div className='flex-column flex max-w-full items-center justify-between self-stretch'>
            <span className='flex max-w-full flex-row items-center justify-center gap-2'>
              {icon && <DynamicIcon variant={icon} {...iconDefaultProps} />}
              <Header.Three text={title} />
            </span>
            {headerAction}
          </div>

          {/* Subtitle */}
          {subtitle && (
            <h5 className='aucctus-text-secondary aucctus-text-sm max-w-full text-wrap'>
              {subtitle}
            </h5>
          )}
        </div>
      )}
      <div
        className={`flex w-full flex-[1_0_auto] flex-col items-center justify-start ${contentClassName}`}
      >
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

export default DetailCard;
