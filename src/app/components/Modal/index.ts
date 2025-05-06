import Confirmation from './ConfirmationModal/ConfirmationModal';
import CustomerConversationSearch from './CustomerProfile/CustomerConversationSearch';
import AddCustomerProfile from './CustomerProfile/AddCustomerProfile';
import EditCustomerProfileDemographics from './CustomerProfile/EditCustomerProfileDemographics';
import EvidenceAndReasoning from './EvidenceAndReasoningModal';
import SupportInsights from './SupportInsights';
import AddKeyAssumptionModal from './KeyAssumtionModal/AddKeyAssumptionModal';
import EditKeyAssumptionModal from './KeyAssumtionModal/EditKeyAssumtionModal';
import Base from './Modal/Modal';
import ConclusionVisualization from './ConclusionVisualizationModal/ConclusionVisualizationModal';
import AiEditing from './AiEditingModal/AiEditingModal';
import TestModal from './TestModal/TestModal';
import JourneyStep from './JourneyStepModal';

const Modal = {
  Base,
  AiEditing,
  Confirmation,
  CustomerConversationSearch,
  EditCustomerProfileDemographics,
  AddCustomerProfile,
  EditKeyAssumptionModal,
  AddKeyAssumptionModal,
  EvidenceAndReasoning,
  ConclusionVisualization,
  SupportInsights,
  TestModal,
  JourneyStep,
};

export default Modal;
