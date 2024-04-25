import { FunctionComponent, useCallback, useState } from 'react';

import styles from './edit-trends-and-driver.module.scss';
import { useModal } from '../../../context/modal/ModalContextProvider';
import { ITrendsAndDrivers } from '../../../../libs/api/types';
import InputField from '../../Text/InputField/InputField';
import TextArea from '../../Text/TextArea/TextArea';
import { useTrendAndDriverUpdate } from '../../../hooks/query/concepts.hook';

interface EditTrendsAndDriverProps {
  trendAndDriver: ITrendsAndDrivers;
}

const NAME_MAX_LENGTH = 36;
const DESCRIPTION_MAX_LENGTH = 500;

const removeProtocol = (source: string) => {
  const unwantedPrefix = ['https://', 'http://'];
  let d = source;
  for (const prefix of unwantedPrefix) {
    if (d.substring(0, prefix.length) === prefix) {
      d = d.slice(prefix.length);
    }
  }
  return d;
};

const EditTrendAndDriver: FunctionComponent<EditTrendsAndDriverProps> = ({ trendAndDriver }) => {
  const { closeModal } = useModal();
  const { mutate } = useTrendAndDriverUpdate();
  const [name, setName] = useState(trendAndDriver.name);
  const [nameError, setNameError] = useState<string | undefined>();
  const [source, setSource] = useState(removeProtocol(trendAndDriver.source));
  const [sourceError, setSourceError] = useState<string | undefined>();
  const [description, setDescription] = useState(trendAndDriver.description);
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
    let d = removeProtocol(e.target.value);
    setSource(d);
  }, []);

  const handleSave = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.preventDefault();
      mutate(
        { ...trendAndDriver, name, description, source },
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
        }
      );
      e.preventDefault();
      e.stopPropagation();
    },
    [mutate, name, description, source, trendAndDriver, closeModal]
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div />
        <button className={'btn-close'} onClick={() => closeModal()} />
      </div>
      <div className={styles.content}>
        <InputField
          label={'Title'}
          name="title"
          value={name}
          error={!!nameError}
          errorMessage={nameError}
          onChange={handleNameChange}
          maxLength={NAME_MAX_LENGTH}
        />
        <TextArea
          label={'Description'}
          name="description"
          value={description}
          error={!!descriptionError}
          errorMessage={descriptionError}
          maxLength={DESCRIPTION_MAX_LENGTH}
          onChange={handleDescriptionChange}
        />
        <InputField
          label={'Source'}
          name="source"
          value={source}
          error={!!sourceError}
          errorMessage={sourceError}
          onChange={handleSourceChange}
        />
      </div>
      <div className={styles.footer}>
        <button
          className={'btn btn-primary'}
          disabled={!name || !description || !source || !!nameError || !!descriptionError || !!sourceError}
          onClick={handleSave}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default EditTrendAndDriver;
