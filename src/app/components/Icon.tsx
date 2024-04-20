import { FunctionComponent } from 'react';

import Lock from '../assets/icons/lock.svg?react';
import Help from '../assets/icons/help.svg?react';
import HelpCircle from '../assets/icons/help-circle.svg?react';
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
import ChevronDown from '../assets/icons/chevrondown.svg?react';
import ChevronRight from '../assets/icons/chevronright.svg?react';
import ChevronLeft from '../assets/icons/chevronleft.svg?react';
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
import ArrowUpRight from '../assets/icons/arrowupright.svg?react';
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
import CloseX from '../assets/icons/closeX.svg?react';
import PiggyBank from '../assets/icons/piggy-bank.svg?react';
import Circle from '../assets/icons/circle.svg?react';
import LinkExternal from '../assets/icons/link-external.svg?react';
import Thermometer from '../assets/icons/thermometer.svg?react';
import Building from '../assets/icons/building.svg?react';
import FileCode from '../assets/icons/filecode.svg?react';
import List from '../assets/icons/list.svg?react';
import Board from '../assets/icons/board.svg?react';
import AlertOctagon from '../assets/icons/alert-octagon.svg?react';
import AlertTriangle from '../assets/icons/alert-triangle.svg?react';
import Check from '../assets/icons/check.svg?react';
import DownloadCloud from '../assets/icons/download-cloud.svg?react';
import Edit from '../assets/icons/edit.svg?react';
import Save from '../assets/icons/save.svg?react';
import Eye from '../assets/icons/eye.svg?react';
import EyeOff from '../assets/icons/eye-off.svg?react';

export type IconVariant =
  | 'lock'
  | 'help'
  | 'helpCircle'
  | 'beaker'
  | 'target'
  | 'search'
  | 'userGroup'
  | 'clipboard'
  | 'umbrella'
  | 'message'
  | 'gear'
  | 'home'
  | 'file'
  | 'lightbulb'
  | 'rocket'
  | 'chevronUp'
  | 'chevronDown'
  | 'chevronRight'
  | 'chevronLeft'
  | 'globe'
  | 'key'
  | 'lifeBuoy'
  | 'lineChartUp'
  | 'mail'
  | 'shieldDollar'
  | 'threeStars'
  | 'paperAirPlane'
  | 'pieChart'
  | 'presentationChart'
  | 'saveStar'
  | 'arrowDown'
  | 'arrowUp'
  | 'arrowRight'
  | 'arrowLeft'
  | 'arrowUpRight'
  | 'star'
  | 'trendUp'
  | 'filterLines'
  | 'currency'
  | 'download'
  | 'refresh'
  | 'calendar'
  | 'columns'
  | 'announcement'
  | 'dotstVertical'
  | 'closeX'
  | 'piggyBank'
  | 'circle'
  | 'linkExternal'
  | 'thermometer'
  | 'building'
  | 'filecode'
  | 'list'
  | 'board'
  | 'critical'
  | 'warning'
  | 'check'
  | 'downloadCloud'
  | 'edit'
  | 'save'
  | 'eye'
  | 'eyeOff';
interface IconProps extends Partial<React.SVGProps<SVGSVGElement>> {
  variant: IconVariant;
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
    case 'helpCircle':
      return <HelpCircle {...props} />;
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
    case 'chevronDown':
      return <ChevronDown {...props} />;
    case 'chevronRight':
      return <ChevronRight {...props} />;
    case 'chevronLeft':
      return <ChevronLeft {...props} />;
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
    case 'arrowUpRight':
      return <ArrowUpRight {...props} />;
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
    case 'closeX':
      return <CloseX {...props} />;
    case 'piggyBank':
      return <PiggyBank {...props} />;
    case 'circle':
      return <Circle {...props} />;
    case 'linkExternal':
      return <LinkExternal {...props} />;
    case 'building':
      return <Building {...props} />;
    case 'thermometer':
      return <Thermometer {...props} />;
    case 'filecode':
      return <FileCode {...props} />;
    case 'list':
      return <List {...props} />;
    case 'board':
      return <Board {...props} />;
    case 'critical':
      return <AlertOctagon {...props} />;
    case 'warning':
      return <AlertTriangle {...props} />;
    case 'check':
      return <Check {...props} />;
    case 'downloadCloud':
      return <DownloadCloud {...props} />;
    case 'edit':
      return <Edit {...props} />;
    case 'save':
      return <Save {...props} />;
    case 'eye':
      return <Eye {...props} />;
    case 'eyeOff':
      return <EyeOff {...props} />;
  }
};

export default Icon;
