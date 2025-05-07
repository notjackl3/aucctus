import Confirmation from './ConfirmationModal/ConfirmationModal';
import CustomerConversationSearch from './CustomerProfile/CustomerConversationSearch';
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
import EditRealWorldSignal from './CustomerProfile/EditRealWorldSignal/EditRealWorldSignal';

const Modal = {
  Base,
  AiEditing,
  Confirmation,
  CustomerConversationSearch,
  EditCustomerProfileDemographics,
  EditKeyAssumptionModal,
  AddKeyAssumptionModal,
  EvidenceAndReasoning,
  ConclusionVisualization,
  SupportInsights,
  TestModal,
  JourneyStep,
  EditRealWorldSignal,
};

export default Modal;
