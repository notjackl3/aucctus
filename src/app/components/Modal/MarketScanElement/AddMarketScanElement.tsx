import { AxiosError } from 'axios';
import { FunctionComponent, useCallback, useState } from 'react';
import { UseMutateFunction } from 'react-query';
import {
  Ecosystem,
  EcosystemType,
  IEcosystemCreate,
  IFormError,
  IMarketScanElementCreate,
  ITrendsAndDriversV1,
} from '../../../../libs/api/types';
import { useModal } from '../../../context/ModalContextProvider';
import InputField from '../../Input/InputField/InputField';
import TextArea from '../../Input/TextArea/TextArea';
import styles from './edit-trends-and-driver.module.scss';

interface EditTrendsAndDriverProps {
  addItem:
    | UseMutateFunction<
        Ecosystem,
        AxiosError<IFormError<Ecosystem>, any>,
        IEcosystemCreate,
        unknown
      >
    | UseMutateFunction<
        ITrendsAndDriversV1,
        AxiosError<IFormError<ITrendsAndDriversV1>, any>,
        IMarketScanElementCreate,
        unknown
      >;
  ecosystemType?: EcosystemType;
}

const NAME_MAX_LENGTH = 36;
const DESCRIPTION_MAX_LENGTH = 500;

const AddMarketScanElement: FunctionComponent<EditTrendsAndDriverProps> = ({
  addItem,
  ecosystemType,
}) => {
  const { closeModal } = useModal();
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState<string | undefined>();
  const [source, setSource] = useState('');
  const [sourceError, setSourceError] = useState<string | undefined>();
  const [description, setDescription] = useState('');
  const [descriptionError, setDescriptionError] = useState<
    string | undefined
  >();

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;

      setNameError(undefined);

      if (input.length === 0) {
        setNameError('Title is required.');
      } else if (input.length > NAME_MAX_LENGTH) {
        setNameError('Title exceeds the maximum allowed length.');
      }

      setName(input);
    },
    [],
  );

  const handleDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const input = e.target.value;

      setDescriptionError(undefined);

      if (input.length === 0) {
        setDescriptionError('Description is required.');
      } else if (input.length > DESCRIPTION_MAX_LENGTH) {
        setDescriptionError('Description exceeds the maximum allowed length.');
      }

      setDescription(input);
    },
    [],
  );

  const handleSourceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSourceError(undefined);
      let d = e.target.value;
      setSource(d);
    },
    [],
  );

  const handleSave = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      // Add the options object to the addItem function
      const options = {
        onSuccess: () => {
          closeModal();
        },
      };

      // If ecosystemType is defined, it means we are adding an ecosystem cast the addItem function to the correct type
      if (ecosystemType) {
        (
          addItem as UseMutateFunction<
            Ecosystem,
            AxiosError<IFormError<Ecosystem>, any>,
            IEcosystemCreate,
            unknown
          >
        )({ name, description, source, ecosystemType }, options);
      } else {
        (
          addItem as UseMutateFunction<
            ITrendsAndDriversV1,
            AxiosError<IFormError<ITrendsAndDriversV1>, any>,
            IMarketScanElementCreate,
            unknown
          >
        )({ name, description, source }, options);
      }

      e.preventDefault();
      e.stopPropagation();
    },
    [addItem, closeModal, description, ecosystemType, name, source],
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div />
        <button
          aria-label='Close'
          className={'btn-close'}
          onClick={() => closeModal()}
        />
      </div>
      <div className={styles.content}>
        <InputField
          label={'Title'}
          name='title'
          value={name}
          error={!!nameError}
          errorMessage={nameError}
          onChange={handleNameChange}
          maxLength={NAME_MAX_LENGTH}
        />
        <TextArea
          label={'Description'}
          name='description'
          value={description}
          error={!!descriptionError}
          errorMessage={descriptionError}
          maxLength={DESCRIPTION_MAX_LENGTH}
          onChange={handleDescriptionChange}
        />
        <InputField
          label={'Source'}
          name='source'
          value={source}
          error={!!sourceError}
          errorMessage={sourceError}
          onChange={handleSourceChange}
        />
      </div>
      <div className={styles.footer}>
        <button className='btn btn-light' onClick={() => closeModal()}>
          Cancel
        </button>
        <button
          className='btn btn-primary'
          disabled={
            !name ||
            !description ||
            !source ||
            !!nameError ||
            !!descriptionError ||
            !!sourceError
          }
          onClick={handleSave}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default AddMarketScanElement;
