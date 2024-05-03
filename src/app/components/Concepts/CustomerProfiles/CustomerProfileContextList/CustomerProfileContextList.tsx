import { FunctionComponent, useCallback, useEffect, useRef, useState } from 'react';
import ConceptDetailCard from '../../../Cards/ConceptDetailCard/ConceptDetailCard';

import styles from './customer-profile-context.module.scss';
import { useCustomerProfileUpdate } from '../../../../hooks/query/concepts.hook';
import Icon from '../../../Icons/Icon/Icon';
import InputField from '../../../Text/InputField/InputField';

interface ICustomerProfileDetailsLists {
  title: string;
  icon: IconVariant;
  field: 'jobs' | 'pains' | 'quotes';
  profileUuid: string;
  data: string[];
}

const MAX_INPUT_LENGTH = 30;

const CustomerProfileContextList: FunctionComponent<ICustomerProfileDetailsLists> = ({
  profileUuid,
  title,
  icon,
  data,
  field,
}) => {
  const { mutate } = useCustomerProfileUpdate(profileUuid);
  const [list, setList] = useState(data);
  const [newItem, setNewItem] = useState('');
  const [inputError, setInputError] = useState<string | undefined>();

  useEffect(() => {
    setList(data);
  }, [data]);

  const handleUpdate = useCallback(
    (newList: string[]) => mutate({ uuid: profileUuid, [field]: newList }),
    [field, mutate, profileUuid],
  );
  const handleSave = useCallback(
    (item: string) => {
      setList((prev) => {
        const newList = [...prev, item];
        handleUpdate(newList);
        return newList;
      });
      setNewItem('');
    },
    [handleUpdate],
  );

  const handleUpdateElement = useCallback(
    (index: number) => (item: string) => {
      setList((prev) => {
        const newList = [...prev];
        newList[index] = item;
        handleUpdate(newList);
        return newList;
      });
    },
    [handleUpdate],
  );

  const handleDelete = useCallback(
    (value: string) => {
      setList((prev) => {
        const newList = prev.filter((v) => v !== value);

        handleUpdate(newList);
        return newList;
      });
    },
    [handleUpdate],
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length > MAX_INPUT_LENGTH) {
      setInputError(`Max length is ${MAX_INPUT_LENGTH} characters`);
    }
    setNewItem(e.target.value);
  }, []);

  return (
    <div>
      <ConceptDetailCard cardClassName={styles.customerCards} title={title} icon={icon} isHideFooter>
        <div className={styles.cardContent}>
          {list.map((value, index) => (
            <CustomerProfileListItem
              key={value}
              value={value}
              field={field}
              handleDelete={handleDelete}
              handleSave={handleUpdateElement(index)}
            />
          ))}

          <span className={styles.footer}>
            <InputField
              label={''}
              name={'new'}
              value={newItem}
              onChange={handleChange}
              error={!!inputError}
              errorMessage={inputError}
              maxLength={MAX_INPUT_LENGTH}
            />
            <button
              className='btn btn-light'
              onClick={(e) => {
                handleSave(newItem);
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <Icon variant='plus' height={20} width={20} />
            </button>
          </span>
        </div>
      </ConceptDetailCard>
    </div>
  );
};

interface ICustomerProfileListItemProps {
  value: string;
  field: 'jobs' | 'pains' | 'quotes';

  handleDelete: (value: string) => void;
  handleSave: (value: string) => void;
}

const CustomerProfileListItem: FunctionComponent<ICustomerProfileListItemProps> = ({
  value,
  handleDelete,
  field,
  handleSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputError, setInputError] = useState<string | undefined>();
  const [newValue, setNewValue] = useState(value);

  const ref = useRef<HTMLInputElement>(null);

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputError(undefined);
    if (e.target.value.length > MAX_INPUT_LENGTH) {
      setInputError(`Max length is ${MAX_INPUT_LENGTH} characters`);
    }
    setNewValue(e.target.value);
  }, []);

  useEffect(() => {
    if (!isEditing || !ref.current) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        setIsEditing(false);
        if (newValue !== value) {
          handleSave(newValue);
        }
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsEditing(false);
        if (newValue !== value) {
          handleSave(newValue);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleSave, isEditing, newValue, value]);

  return (
    <span
      onClick={(e) => {
        e.preventDefault();
        setIsEditing(true);
      }}
    >
      {!isEditing ? (
        <p className={styles.text}>{field === 'quotes' ? `"${value}"` : value}</p>
      ) : (
        <InputField
          ref={ref}
          label={''}
          name={'new'}
          value={newValue}
          maxLength={MAX_INPUT_LENGTH}
          onChange={onInputChange}
          errorMessage={inputError}
        />
      )}

      <button
        className='btn btn-light'
        onClick={(e) => {
          handleDelete(value);
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <Icon variant='trash' height={20} width={20} />
      </button>
    </span>
  );
};

export default CustomerProfileContextList;
