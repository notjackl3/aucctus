import Confirmation from './ConfirmationModal/ConfirmationModal';
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

const Modal = {
  Base,
  AiEditing,
  Confirmation,
  EditCustomerProfileDemographics,
  AddCustomerProfile,
  EditKeyAssumptionModal,
  AddKeyAssumptionModal,
  EvidenceAndReasoning,
  ConclusionVisualization,
  SupportInsights,
  TestModal,
};

export default Modal;
