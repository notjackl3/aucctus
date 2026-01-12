// Component Groups
import AiInteraction from './AiInteraction'; // Object with AI components - keep for compatibility
import { PulsatingText, BorderTraceWrapper, LogoAnimation } from './Animation';
import Badge from './Badges'; // Object with badge components - keep for compatibility
import Button from './Button';
import Card from './Card'; // Object with card components - keep for compatibility
import Chart from './Charts'; // Object with chart components - keep for compatibility
import Container from './Container';
import FileDropzone from './FileDropzone';
import Header from './Header';
import Icon from './Icon';
import Input from './Input';
import Legend from './Legends'; // Object with legend components - keep for compatibility
import Modal from './Modal';
import { toast } from './Notification/toast';
import Portal from './Portal';
import Select from './Select';
import Table from './Tables';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';
import Text from './Text';
import ToggleSwitch from './ToggleSwitch';

// Components
import Avatar from './Avatar';
import Banner from './Banner/Banner';
import VersionUpgradeBanner from './Banner/VersionUpgradeBanner';
import BetaDisclaimer from './BetaDisclaimer';
import { ComponentCarousel } from './Carousel';
import Loading from './Loading/Loading';
import PocGeneratingOverlay from './Loading/PocGeneratingOverlay';
import Progress from './Loading/Progress';
import UnifiedLoadingState from './Loading/UnifiedLoadingState';
import NucleusPage from './Nucleus/NucleusPage/NucleusPage';
import ComponentTooltip from './ToolTip/ComponentTooltip';
import Tooltip from './ToolTip/Tooltip';
import * as ConceptReportSkeletons from './Skeleton/ConceptReport';

// Nucleus Components
export * from './Nucleus';

// Concept Overview Components
import ConceptOverview from './ConceptOverview';

// Ecosystem Components
import {
  EcosystemV2,
  DialGauge,
  CompanyListPanel,
  CompanyDetailPanel,
} from './EcosystemV2';

export {
  AiInteraction, // This is an object with AI components - keep for compatibility
  Avatar,
  Badge, // This is an object with badge components - keep for compatibility
  Banner,
  BorderTraceWrapper,
  BetaDisclaimer,
  Button, // This is a component with attached properties - keep
  Card, // This is an object with card components - keep for compatibility
  Chart, // This is an object with chart components - keep for compatibility
  ComponentCarousel,
  ComponentTooltip,
  CompanyDetailPanel,
  CompanyListPanel,
  ConceptOverview,
  Container,
  ConceptReportSkeletons,
  DialGauge,
  EcosystemV2,
  FileDropzone,
  Header,
  Icon,
  Input,
  Legend, // This is an object with legend components - keep for compatibility
  Loading,
  LogoAnimation,
  Modal,
  PocGeneratingOverlay,
  NucleusPage,
  Portal,
  Progress,
  PulsatingText,
  Select,
  Table, // This is a component with attached properties - keep
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
  toast,
  ToggleSwitch,
  Tooltip,
  UnifiedLoadingState,
  VersionUpgradeBanner,
};

// Explicit exports for Nucleus components to ensure they're available
// export { NucleusPage } from './Nucleus';
