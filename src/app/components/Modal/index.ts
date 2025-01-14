import Confirmation from './ConfirmationModal/ConfirmationModal';
import AddCustomerProfile from './CustomerProfile/AddCustomerProfile';
import EditCustomerProfileDemographics from './CustomerProfile/EditCustomerProfileDemographics';
import EvidenceAndReasoning from './EvidenceAndReasoningModal';
import SupportInsights from './SupportInsights';
import AddKeyAssumptionModal from './KeyAssumtionModal/AddKeyAssumptionModal';
import EditKeyAssumptionModal from './KeyAssumtionModal/EditKeyAssumtionModal';
import AddMarketScanElement from './MarketScanElement/AddMarketScanElement';
import EditMarketScanElement from './MarketScanElement/EditMarketScanElement';
import Base from './Modal/Modal';
import TestModal from './TestModal/TestModal';

const Modal = {
  Base,
  Confirmation,
  EditCustomerProfileDemographics,
  AddCustomerProfile,
  EditKeyAssumptionModal,
  AddKeyAssumptionModal,
  AddMarketScanElement,
  EditMarketScanElement,
  EvidenceAndReasoning,
  SupportInsights,
  TestModal,
};

export default Modal;
