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
  const [isEditing, setIsEditing] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isEditing || !ref.current) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsEditing(false);
        setList(data);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [data, isEditing]);

  const handleUpdate = useCallback(
    (newList: string[]) => mutate({ uuid: profileUuid, [field]: newList }),
    [field, mutate, profileUuid]
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
    [handleUpdate]
  );

  const handleDelete = useCallback(
    (value: string) => {
      setList((prev) => {
        const newList = prev.filter((v) => v !== value);

        handleUpdate(newList);
        return newList;
      });
    },
    [handleUpdate]
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length > MAX_INPUT_LENGTH) {
      setInputError(`Max length is ${MAX_INPUT_LENGTH} characters`);
    }
    setNewItem(e.target.value);
  }, []);

  return (
    <div ref={ref}>
      <ConceptDetailCard
        cardClassName={styles.customerCards}
        title={title}
        icon={icon}
        headerAction={
          <button className="btn btn-light" onClick={() => setIsEditing(!isEditing)}>
            <Icon variant="edit" height={20} width={20} />
          </button>
        }
        isHideFooter
      >
        <div className={styles.cardContent}>
          {list.map((value) => (
            <span>
              <p key={value} className={styles.text}>
                {field === 'quotes' ? `"${value}"` : value}
              </p>

              {isEditing ? (
                <button
                  className="btn btn-light"
                  onClick={(e) => {
                    handleDelete(value);
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <Icon variant="trash" height={20} width={20} />
                </button>
              ) : null}
            </span>
          ))}

          {isEditing ? (
            <span>
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
                className="btn btn-light"
                onClick={(e) => {
                  handleSave(newItem);
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <Icon variant="alert" height={20} width={20} />
              </button>
            </span>
          ) : null}
        </div>
      </ConceptDetailCard>
    </div>
  );
};

export default CustomerProfileContextList;
