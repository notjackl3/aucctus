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
import AddQuestionModal from './Nucleus/AddQuestionModal';
import EditQuestionModal from './Nucleus/EditQuestionModal';
import AddAnswerModal from './Nucleus/AddAnswerModal';
import EditAnswerModal from './Nucleus/EditAnswerModal';
import SaveScoringConfigModal from './Nucleus/SaveScoringConfigModal';
import MagicShare from './MagicShareModal/MagicShareModal';
import ProceedToPoc from './ProceedToPocModal/ProceedToPocModal';
import RegenerateTestWarningModal from './RegenerateTestWarningModal';
import PropertyDefinitionModal from './PropertyDefinitionModal/PropertyDefinitionModal';
import IconPickerModal from './IconPickerModal/IconPickerModal';

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
  AddQuestionModal,
  EditQuestionModal,
  AddAnswerModal,
  EditAnswerModal,
  SaveScoringConfigModal,
  MagicShare,
  ProceedToPoc,
  RegenerateTestWarningModal,
  PropertyDefinitionModal,
  IconPickerModal,
};

export default Modal;
