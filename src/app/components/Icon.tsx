import { FunctionComponent } from 'react';

import Lock from '../assets/icons/lock.svg?react';
import Help from '../assets/icons/help.svg?react';
import Beaker from '../assets/icons/beaker.svg?react';
import FileSearch from '../assets/icons/filesearch.svg?react';
import Lightbulb from '../assets/icons/lightbulb.svg?react';
import Target from '../assets/icons/target.svg?react';
import Rocket from '../assets/icons/rocket.svg?react';
import SearchRefraction from '../assets/icons/search-refraction.svg?react';
import UserGroup from '../assets/icons/users-01.svg?react';
import Clipboard from '../assets/icons/clipboard.svg?react';
import Umbrella from '../assets/icons/umbrella.svg?react';
import MessageCircle from '../assets/icons/message-circle.svg?react';
import Home from '../assets/icons/home.svg?react';
import Gear from '../assets/icons/gear.svg?react';
import ChevronUp from '../assets/icons/chevronup.svg?react';
import Globe from '../assets/icons/globe.svg?react';
import Key from '../assets/icons/key.svg?react';
import LifeBuoy from '../assets/icons/lifebuoy.svg?react';
import LineChartUp from '../assets/icons/line-chart-up.svg?react';
import Mail from '../assets/icons/mail.svg?react';
import ShieldDollar from '../assets/icons/shield-dollar.svg?react';
import ThreeStars from '../assets/icons/threeStars.svg?react';
import PaperAirPlane from '../assets/icons/paper-airplane.svg?react';
import PieChart from '../assets/icons/pie-chart.svg?react';
import PresentationChart from '../assets/icons/presentation-chart.svg?react';
import SaveStar from '../assets/icons/save-star.svg?react';
import ArrowDown from '../assets/icons/arrowdown.svg?react';
import ArrowUp from '../assets/icons/arrowup.svg?react';
import ArrowRight from '../assets/icons/arrowright.svg?react';
import ArrowLeft from '../assets/icons/arrowleft.svg?react';
import Star from '../assets/icons/star.svg?react';
import TrendUp from '../assets/icons/trendup.svg?react';
import FilterLines from '../assets/icons/filter-lines.svg?react';
import Currency from '../assets/icons/currencydollar.svg?react';
import Download from '../assets/icons/download.svg?react';
import Refresh from '../assets/icons/refresh.svg?react';
import Calendar from '../assets/icons/calendar.svg?react';
import Columns from '../assets/icons/columns.svg?react';
import Announcement from '../assets/icons/announcement.svg?react';
import DotsVertical from '../assets/icons/dots-vertical.svg?react';

export enum IconVariant {
  lock,
  help,
  beaker,
  target,
  search,
  userGroup,
  clipboard,
  umbrella,
  message,
  gear,
  home,
  file,
  lightbulb,
  rocket,
  chevronUp,
  globe,
  key,
  lifeBuoy,
  lineChartUp,
  mail,
  shieldDollar,
  threeStars,
  paperAirPlane,
  pieChart,
  presentationChart,
  saveStar,
  arrowDown,
  arrowUp,
  arrowRight,
  arrowLeft,
  star,
  trendUp,
  filterLines,
  currency,
  download,
  refresh,
  calendar,
  columns,
  announcement,
  dotstVertical,
}

interface IconProps extends Partial<React.SVGProps<SVGSVGElement>> {
  variant: keyof typeof IconVariant;
  title?: string;
}

const Icon: FunctionComponent<IconProps> = ({ variant, ...props }) => {
  switch (variant) {
    case 'file':
      return <FileSearch {...props} />;
    case 'lightbulb':
      return <Lightbulb {...props} />;
    case 'rocket':
      return <Rocket {...props} />;
    case 'home':
      return <Home {...props} />;
    case 'gear':
      return <Gear {...props} />;
    case 'lock':
      return <Lock {...props} />;
    case 'help':
      return <Help {...props} />;
    case 'beaker':
      return <Beaker {...props} />;
    case 'target':
      return <Target {...props} />;
    case 'search':
      return <SearchRefraction {...props} />;
    case 'userGroup':
      return <UserGroup {...props} />;
    case 'clipboard':
      return <Clipboard {...props} />;
    case 'umbrella':
      return <Umbrella {...props} />;
    case 'message':
      return <MessageCircle {...props} />;
    case 'chevronUp':
      return <ChevronUp {...props} />;
    case 'globe':
      return <Globe {...props} />;
    case 'key':
      return <Key {...props} />;
    case 'lifeBuoy':
      return <LifeBuoy {...props} />;
    case 'lineChartUp':
      return <LineChartUp {...props} />;
    case 'mail':
      return <Mail {...props} />;
    case 'shieldDollar':
      return <ShieldDollar {...props} />;
    case 'threeStars':
      return <ThreeStars {...props} />;
    case 'paperAirPlane':
      return <PaperAirPlane {...props} />;
    case 'pieChart':
      return <PieChart {...props} />;
    case 'presentationChart':
      return <PresentationChart {...props} />;
    case 'saveStar':
      return <SaveStar {...props} />;
    case 'arrowDown':
      return <ArrowDown {...props} />;
    case 'arrowUp':
      return <ArrowUp {...props} />;
    case 'arrowRight':
      return <ArrowRight {...props} />;
    case 'arrowLeft':
      return <ArrowLeft {...props} />;
    case 'star':
      return <Star {...props} />;
    case 'trendUp':
      return <TrendUp {...props} />;
    case 'filterLines':
      return <FilterLines {...props} />;
    case 'currency':
      return <Currency {...props} />;
    case 'download':
      return <Download {...props} />;
    case 'refresh':
      return <Refresh {...props} />;
    case 'calendar':
      return <Calendar {...props} />;
    case 'columns':
      return <Columns {...props} />;
    case 'announcement':
      return <Announcement {...props} />;
    case 'dotstVertical':
      return <DotsVertical {...props} />;
  }
};

export default Icon;
