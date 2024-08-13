import { FunctionComponent, useCallback, useState } from 'react';

import utils from '@libs/utils';
import { AxiosError } from 'axios';
import { UseMutateFunction } from 'react-query';
import { Ecosystem, IFormError, ITrendsAndDrivers } from '../../../../libs/api/types';
import { useModal } from '../../../context/ModalContextProvider';
import Icon from '../../Icons/Icon/Icon';
import InputField from '../../Text/InputField/InputField';
import TextArea from '../../Text/TextArea/TextArea';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';
import styles from './edit-trends-and-driver.module.scss';

interface EditTrendsAndDriverProps<T = Ecosystem | ITrendsAndDrivers> {
  updateItem: UseMutateFunction<T, AxiosError<IFormError<T>, any>, Partial<T> & { uuid: string }, unknown>;
  deleteItem: UseMutateFunction<T, AxiosError<IFormError<T>, any>, string, unknown>;
  item: T;
}

const NAME_MAX_LENGTH = 36;
const DESCRIPTION_MAX_LENGTH = 500;

const isEcosystemItem = (item: unknown) => {
  return (item as Ecosystem).ecosystemType !== undefined;
};

const EditMarketScanElement: FunctionComponent<EditTrendsAndDriverProps> = ({ item, updateItem, deleteItem }) => {
  const { closeModal } = useModal();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [name, setName] = useState(item.name);
  const [nameError, setNameError] = useState<string | undefined>();
  const [source, setSource] = useState(utils.string.removeProtocol(item.source));
  const [sourceError, setSourceError] = useState<string | undefined>();
  const [description, setDescription] = useState(item.description);
  const [descriptionError, setDescriptionError] = useState<string | undefined>();

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    setNameError(undefined);

    if (input.length === 0) {
      setNameError('Title is required.');
    } else if (input.length > NAME_MAX_LENGTH) {
      setNameError('Title exceeds the maximum allowed length.');
    }

    setName(input);
  }, []);

  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target.value;

    setDescriptionError(undefined);

    if (input.length === 0) {
      setDescriptionError('Description is required.');
    } else if (input.length > DESCRIPTION_MAX_LENGTH) {
      setDescriptionError('Description exceeds the maximum allowed length.');
    }

    setDescription(input);
  }, []);

  const handleSourceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSourceError(undefined);
    let d = utils.string.removeProtocol(e.target.value);
    setSource(d);
  }, []);

  const handleSave = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      updateItem(
        { ...item, name, description, source },
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
              const { name, description, source } = error.response.data.error;
              if (name) {
                setNameError(name[0].message);
              }
              if (description) {
                setDescriptionError(description[0].message);
              }

              if (source) {
                setSourceError(source[0].message);
              }
            }
          },
        },
      );
      e.preventDefault();
      e.stopPropagation();
    },
    [updateItem, name, description, source, item, closeModal],
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
        {isEcosystemItem(item) ? (
          <InputField
            label={'Source'}
            name='source'
            value={source}
            error={!!sourceError}
            errorMessage={sourceError}
            onChange={handleSourceChange}
          />
        ) : null}
      </div>
      <div className={styles.footer}>
        <button className='btn btn-light' disabled={showConfirmation} onClick={() => closeModal()}>
          Cancel
        </button>
        <button
          className='btn btn-primary'
          disabled={
            !name || !description || !source || !!nameError || !!descriptionError || !!sourceError || showConfirmation
          }
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
                  deleteItem(item.uuid, {
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

export default EditMarketScanElement;
