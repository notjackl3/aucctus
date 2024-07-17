import CustomerProfile from '@pages/ConceptReport/components/CustomerProfile';
import Confirmation from './ConfirmationModal/ConfirmationModal';
import EditCustomerProfileDemographics from './CustomerProfile/EditCustomerProfileDemographics';
import EvidenceAndReasoning from './EvedanceAndReasoningModal';
import AddKeyAssumptionModal from './KeyAssumtionModal/AddKeyAssumptionModal';
import EditKeyAssumptionModal from './KeyAssumtionModal/EditKeyAssumtionModal';
import AddMarketScanElement from './MarketScanElement/AddMarketScanElement';
import EditMarketScanElement from './MarketScanElement/EditMarketScanElement';
import Base from './Modal/Modal';

const Modal = {
  Base,
  Confirmation,
  EditCustomerProfileDemographics,
  CustomerProfile,
  EditKeyAssumptionModal,
  AddKeyAssumptionModal,
  AddMarketScanElement,
  EditMarketScanElement,
  EvidenceAndReasoning,
};

export default Modal;
