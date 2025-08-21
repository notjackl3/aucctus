import React from 'react';
import { Icon, toast } from '@components';
import { IUserJourneyStep } from '@libs/api/types';
import SectionHeader from './components/SectionHeader';
import JourneyCarousel from './components/JourneyCarousel';
import AiInsight from './components/AiInsight';
import {
  useCustomerJourneyStepsList,
  useCustomerJourneyStepCreate,
  useCustomerJourneyStepUpdate,
  useCustomerJourneyStepDelete,
} from '@hooks/query/concepts.hook';
import telemetry from '@libs/telemetry';
import { useModal } from '@context/ModalContextProvider';
import Modal from '@components/Modal';

// Constants for styling
const ICON_STROKE = 'aucctus-stroke-brand-primary';
const AI_INSIGHT_TEXT_COLOR = 'aucctus-text-brand-primary';
const AI_INSIGHT_ICON_STROKE = 'aucctus-stroke-brand-primary';
const JOB_LABEL = 'Job to be Done';
const PAIN_LABEL = 'Pain Point';
const INTERVENTION_LABEL = 'Moment of Intervention';

// Relation type constants
export const RELATION_TYPE = {
  JOURNEY_STEP: 'Journey Step',
  JTBD: 'JTBD',
  PAIN: 'Pain',
  MOMENT_OF_INTERVENTION: 'Moment of Intervention',
};

// Component styles
const containerStyles =
  'aucctus-bg-primary aucctus-border-secondary h-fit flex-1 overflow-hidden rounded-lg border shadow-sm';
const emptyStateTextStyles = 'aucctus-text-secondary mb-2';
const loadingStateStyles = 'flex justify-center py-8';
const emptyStateContainerStyles = 'flex flex-col items-center py-8';
const addButtonStyles = 'aucctus-bg-primary-hover aspect-square rounded-lg p-1';

interface UserJourneyFlowProps {
  customerProfileUuid: string;
  journey?: IUserJourneyStep[];
  productName?: string;
  insight?: string;
}

const UserJourneyFlow: React.FC<UserJourneyFlowProps> = ({
  customerProfileUuid,
  journey: initialJourney,
  productName = 'High Fibre Portable Cheese Bites',
  insight,
}) => {
  const { openModal, closeModal } = useModal();

  const {
    data: journeyStepsData,
    isLoading,
    error,
  } = useCustomerJourneyStepsList(customerProfileUuid);
  const createJourneyStep = useCustomerJourneyStepCreate(customerProfileUuid);
  const updateJourneyStepMutation = useCustomerJourneyStepUpdate();
  const deleteJourneyStepMutation = useCustomerJourneyStepDelete();

  // Display API errors
  React.useEffect(() => {
    if (error) {
      toast.error('Failed to load user journey steps. Please try again.');
      telemetry.error('Failed to load user journey steps', { error });
    }
  }, [error]);

  // Use API data if available, otherwise fallback to default steps (for development/preview)
  const steps = React.useMemo(() => {
    if (isLoading) return [];
    return journeyStepsData || initialJourney || [];
  }, [journeyStepsData, isLoading, initialJourney]);

  // Find the intervention step
  const interventionStep = React.useMemo(
    () =>
      steps.find(
        (step) => step.relationType === RELATION_TYPE.MOMENT_OF_INTERVENTION,
      ),
    [steps],
  );

  // Add step function
  const handleAddStep = React.useCallback(
    async (step: Omit<IUserJourneyStep, 'uuid'>) => {
      if (!customerProfileUuid) {
        toast.error('Cannot add step: no customer profile selected');
        return;
      }

      if (!step.title || !step.description) {
        toast.error('Cannot add step: title and description are required');
        return;
      }

      try {
        const newOrder =
          steps.length > 0
            ? Math.min(...steps.map((s) => s.order || 0)) - 1
            : 0;

        const finalStep = {
          title: step.title,
          description: step.description,
          order: newOrder,
          relationType: step.relationType,
        };

        telemetry.log('handleAddStep', finalStep);
        await createJourneyStep.mutateAsync(
          finalStep as Omit<IUserJourneyStep, 'uuid'>,
        );
        closeModal();
      } catch (error) {
        telemetry.error('Failed to add journey step', { error });
        toast.error('Failed to add journey step. Please try again.');
      }
    },
    [createJourneyStep, customerProfileUuid, steps, closeModal],
  );

  // Save edit function
  const handleSaveEdit = React.useCallback(
    async (updatedStep: IUserJourneyStep) => {
      telemetry.log('handleSaveEdit', updatedStep);

      const finalStep = {
        title: updatedStep.title,
        description: updatedStep.description,
        relationType: updatedStep.relationType || RELATION_TYPE.JOURNEY_STEP,
        order: updatedStep.order,
      };

      try {
        await updateJourneyStepMutation.mutateAsync({
          customerProfileUuid,
          stepUuid: updatedStep.uuid,
          data: finalStep as Omit<IUserJourneyStep, 'uuid'>,
        });

        closeModal();
      } catch (error) {
        telemetry.error('Failed to update journey step', { error });
        toast.error('Failed to update journey step. Please try again.');
      }
    },
    [customerProfileUuid, updateJourneyStepMutation, closeModal],
  );

  // Handle opening the add step modal
  const handleOpenAddStepModal = React.useCallback(() => {
    openModal(
      Modal.JourneyStep,
      { onSubmit: handleAddStep },
      {
        position: 'center',
        backgroundClassName: 'aucctus-bg-secondary-solid bg-opacity-20',
      },
    );
  }, [openModal, handleAddStep]);

  // Handle opening the edit step modal
  const handleOpenEditStepModal = React.useCallback(
    (step: IUserJourneyStep) => {
      openModal(
        Modal.JourneyStep,
        {
          onSubmit: handleSaveEdit,
          initialStep: step,
        },
        {
          position: 'center',
          modalClassName: 'w-full max-w-2xl rounded-xl',
          backgroundClassName: 'aucctus-bg-secondary-solid bg-opacity-20',
        },
      );
    },
    [openModal, handleSaveEdit],
  );

  // Handle removing a step
  const handleRemoveStep = React.useCallback(
    async (index: number) => {
      const stepToRemove = steps[index];
      if (!customerProfileUuid || !stepToRemove?.uuid) {
        toast.error('Cannot remove step: missing required information');
        return;
      }

      try {
        await deleteJourneyStepMutation.mutateAsync({
          customerProfileUuid,
          stepUuid: stepToRemove.uuid,
        });
      } catch (error) {
        telemetry.error('Failed to delete journey step', { error });
        toast.error('Failed to delete journey step. Please try again.');
      }
    },
    [customerProfileUuid, steps, deleteJourneyStepMutation],
  );

  // Hide the component completely if there are no steps and not loading
  if (!isLoading && steps.length === 0) {
    return null;
  }

  return (
    <div className={containerStyles}>
      <SectionHeader
        icon='briefcase'
        iconClass={ICON_STROKE}
        iconBgClass='aucctus-bg-primary aucctus-border-secondary'
        title='User Journey Flow'
        noDivider={true}
        rightAction={
          <button
            className={addButtonStyles}
            aria-label='Add journey step'
            onClick={handleOpenAddStepModal}
            disabled={isLoading}
          >
            <Icon
              variant='plus'
              className='aucctus-stroke-brand-primary h-5 w-5'
            />
          </button>
        }
      />

      <div className='px-4 py-2'>
        <p className='aucctus-text-secondary aucctus-text-sm mb-4'>
          Visualization of where our product intervenes in the customer&apos;s
          journey
        </p>

        {isLoading ? (
          <div className={loadingStateStyles}>
            <div className='aucctus-text-secondary'>
              Loading journey steps...
            </div>
          </div>
        ) : steps.length === 0 ? (
          <div className={emptyStateContainerStyles}>
            <p className={emptyStateTextStyles}>No journey steps defined yet</p>
            <button
              className='btn btn-primary btn-sm'
              onClick={handleOpenAddStepModal}
            >
              Add First Step
            </button>
          </div>
        ) : (
          <>
            <JourneyCarousel
              steps={steps}
              editable={true}
              onEdit={handleOpenEditStepModal}
              onRemove={handleRemoveStep}
              productName={productName}
              painPointLabel={PAIN_LABEL}
              jobLabel={JOB_LABEL}
              interventionLabel={INTERVENTION_LABEL}
              relationTypes={RELATION_TYPE}
            />

            {(interventionStep || insight) && (
              <AiInsight
                topJob={{
                  uuid:
                    interventionStep?.uuid || `intervention-step-${Date.now()}`,
                  description: interventionStep
                    ? `${interventionStep.title} - ${interventionStep.description}`
                    : '',
                  order: 10,
                  icon: 'briefcase',
                }}
                textColorClass={AI_INSIGHT_TEXT_COLOR}
                iconStrokeClass={AI_INSIGHT_ICON_STROKE}
                customInsight={insight}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default React.memo(UserJourneyFlow);
