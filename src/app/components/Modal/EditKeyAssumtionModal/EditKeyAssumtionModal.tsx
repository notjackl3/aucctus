import { FunctionComponent, useCallback, useState } from 'react';
import Icon from '../../Icons/Icon/Icon';
import { useModal } from '../../../context/ModalContextProvider';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';
import { AssumptionType, IAssumption } from '../../../../libs/api/types';
import InputField from '../../Text/InputField/InputField';
import TextArea from '../../Text/TextArea/TextArea';
import { useAssumptionDelete, useAssumptionUpdate } from '../../../hooks/query/concepts.hook';
import Dropdown, { Option } from '../../Buttons/Dropdown/Dropdown';
import AssumptionBadge from '../../Badges/AssumptionBadge/AssumptionBadge';

import styles from './edit-key-assumption.module.scss';

interface IEditKeyAssumptionModalProps {
  assumption: IAssumption;
}

const HYPOTHESES_MAX_LENGTH = 1500;
const TITLE_MAX_LENGTH = 64;

const ASSUMPTION_TYPE_OPTIONS: Option[] = (
  ['adaptability', 'desirability', 'feasibility', 'viability'] as AssumptionType[]
).map((value) => ({
  label: <AssumptionBadge assumptionType={value} />,
  displayLabel: <AssumptionBadge assumptionType={value} />,
  value,
}));

const EditKeyAssumptionModal: FunctionComponent<IEditKeyAssumptionModalProps> = ({ assumption }) => {
  const { closeModal } = useModal();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { mutate: updateAssumption } = useAssumptionUpdate();
  const { mutate: deleteAssumption } = useAssumptionDelete();
  const [riskLevel, setRiskLevel] = useState<number>(assumption.riskLevel);
  const [impactLevel, setImpactLevel] = useState<number>(assumption.impactLevel);
  const [difficultyLevel, setDifficultyLevel] = useState<number>(assumption.difficultyLevel);

  const [assumptionsType, setAssumptionType] = useState<AssumptionType>(assumption.assumptionsType);
  const [title, setTitle] = useState<string>(assumption.name);
  const [titleError, setTitleError] = useState<string | undefined>(undefined);
  const [hypothesis, setHypothesis] = useState<string>(assumption.hypothesis);
  const [hypothesisError, setHypothesisError] = useState<string | undefined>(undefined);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    setTitleError(undefined);

    if (input.length === 0) {
      setTitleError('Title is required.');
    } else if (input.length > TITLE_MAX_LENGTH) {
      setTitleError('Title exceeds the maximum allowed length.');
    }

    setTitle(input);
  }, []);

  const handleHypothesesChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target.value;

    setHypothesisError(undefined);

    if (input.length === 0) {
      setHypothesis('Hypothesis is required.');
    } else if (input.length > HYPOTHESES_MAX_LENGTH) {
      setHypothesisError('Hypothesis exceeds the maximum allowed length.');
    }

    setHypothesis(input);
  }, []);

  const handleSave = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.preventDefault();
      updateAssumption(
        { ...assumption, name: title, hypothesis, riskLevel, difficultyLevel, impactLevel, assumptionsType },
        {
          onSuccess: () => {
            closeModal();
          },
          onError: (error) => {
            if (
              error.response &&
              error.response.data &&
              error.response.data.error &&
              typeof error.response.data.error !== 'string'
            ) {
              const { name, hypothesis } = error.response.data.error;
              if (name) {
                setTitleError(name[0].message);
              }
              if (hypothesis) {
                setHypothesisError(hypothesis[0].message);
              }
            }
          },
        },
      );
      e.preventDefault();
      e.stopPropagation();
    },
    [
      updateAssumption,
      assumption,
      title,
      hypothesis,
      riskLevel,
      difficultyLevel,
      impactLevel,
      assumptionsType,
      closeModal,
    ],
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button
          aria-label='Delete'
          className='btn btn-light btn-no-border'
          disabled={showConfirmation}
          onClick={() => setShowConfirmation(true)}
        >
          <Icon variant='trash' />
        </button>
        <button aria-label='Close' className={'btn-close'} disabled={showConfirmation} onClick={() => closeModal()} />
      </div>
      <div className={styles.content}>
        <Dropdown
          options={ASSUMPTION_TYPE_OPTIONS}
          selected={assumptionsType}
          onSelect={(value) => {
            setAssumptionType(value as AssumptionType);
          }}
        />
        <div className={styles.levels}>
          <InputField
            label={'Risk Level'}
            name={'risk-level'}
            value={riskLevel}
            type='number'
            min={-10}
            max={10}
            onChange={(e) => setRiskLevel(parseInt(e.target.value))}
          />
          <InputField
            label={'Difficulty Level'}
            name={'difficulty-level'}
            value={difficultyLevel}
            type='number'
            min={-10}
            max={10}
            onChange={(e) => setDifficultyLevel(parseInt(e.target.value))}
          />
          <InputField
            label={'Impact Level'}
            name={'impact-level'}
            value={impactLevel}
            type='number'
            min={-10}
            max={10}
            onChange={(e) => setImpactLevel(parseInt(e.target.value))}
          />
        </div>
        <InputField name='title' label='Title' value={title} errorMessage={titleError} onChange={handleTitleChange} />
        <TextArea
          name='hypothesis'
          label='Hypothesis'
          value={hypothesis}
          error={!!hypothesisError}
          errorMessage={hypothesisError}
          onChange={handleHypothesesChange}
        />
      </div>
      <div className={styles.footer}>
        <button className='btn btn-light' disabled={showConfirmation} onClick={() => closeModal()}>
          Cancel
        </button>
        <button
          className='btn btn-primary'
          disabled={!title || !hypothesis || !!titleError || !!hypothesisError || showConfirmation}
          onClick={handleSave}
        >
          Save
        </button>
      </div>
      {showConfirmation ? (
        <div className={styles.confirm}>
          <ConfirmationModal
            title="Are you sure you'd like to delete?"
            subtitle='This action can not be reversed.'
            actions={[
              {
                title: 'Cancel',
                variant: 'light',
                onClick: () => {
                  setShowConfirmation(false);
                },
              },
              {
                title: 'Delete',
                variant: 'danger',
                onClick: () => {
                  deleteAssumption(assumption.uuid, {
                    onSuccess: () => {
                      closeModal();
                    },
                  });
                },
              },
            ]}
          />
        </div>
      ) : null}
    </div>
  );
};

export default EditKeyAssumptionModal;
