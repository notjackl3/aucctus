import Confirmation from './ConfirmationModal/ConfirmationModal';
import CustomerConversationSearch from './CustomerProfile/CustomerConversationSearch';
import EditCustomerProfileDemographics from './CustomerProfile/EditCustomerProfileDemographics';
import EvidenceAndReasoning from './EvidenceAndReasoningModal';
import SupportInsights from './SupportInsights';
import AddKeyAssumptionModal from './KeyAssumptionModal/AddKeyAssumptionModal';
import EditKeyAssumptionModal from './KeyAssumptionModal/EditKeyAssumptionModal';
import {
  AssumptionStatementModal,
  AssumptionLifecycleConfirmationModal,
} from './AssumptionLifecycleModal';
import Base from './Modal/Modal';
import ConclusionVisualization from './ConclusionVisualizationModal/ConclusionVisualizationModal';
import AiEditing from './AiEditingModal/AiEditingModal';
import TestModal from './TestModal/TestModal';
import JourneyStep from './JourneyStepModal';
import EditRealWorldSignal from './CustomerProfile/EditRealWorldSignal/EditRealWorldSignal';
import TestExecutionModal from '../../pages/Concept/Report/Testing/components/TestExecutionModal';

const Modal = {
  Base,
  AiEditing,
  Confirmation,
  CustomerConversationSearch,
  EditCustomerProfileDemographics,
  EditKeyAssumptionModal,
  AddKeyAssumptionModal,
  AssumptionStatementModal,
  AssumptionLifecycleConfirmationModal,
  EvidenceAndReasoning,
  ConclusionVisualization,
  SupportInsights,
  TestModal,
  JourneyStep,
  EditRealWorldSignal,
  TestExecutionModal,
};

export default Modal;
