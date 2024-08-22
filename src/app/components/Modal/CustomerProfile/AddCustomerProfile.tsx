import utils from '@libs/utils';
import { FunctionComponent, useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { useModal } from '../../../context/ModalContextProvider';
import { useCustomerProfileCreate } from '../../../hooks/query/concepts.hook';
import InputField from '../../Input/InputField/InputField';
import TextArea from '../../Input/TextArea/TextArea';
import styles from './add-customer-profile.module.scss';

interface IAddCustomerProfileProps {
  conceptUuid: string;
}

const NICKNAME_MAX_LENGTH = 250;
const NAME_MAX_LENGTH = 250 / 2;

const AddCustomerProfile: FunctionComponent<IAddCustomerProfileProps> = ({ conceptUuid }) => {
  const { closeModal } = useModal();
  const [nickname, setNickname] = useState('');
  const [nicknameError, setNicknameError] = useState<string | undefined>(undefined);
  const [firstName, setFirstName] = useState('');
  const [firstNameError, setFirstNameError] = useState<string | undefined>(undefined);
  const [lastName, setLastName] = useState('');
  const [lastNameError, setLastNameError] = useState<string | undefined>(undefined);
  const [description, setDescription] = useState('');
  const [descriptionError, setDescriptionError] = useState<string | undefined>(undefined);
  const [ageUpper, setUpperAgeRange] = useState(0);
  const [ageUpperError, setUpperAgeRangeError] = useState<string | undefined>(undefined);
  const [ageLower, setLowerAgeRange] = useState(0);
  const [ageLowerError, setLowerAgeRangeError] = useState<string | undefined>(undefined);
  const [incomeUpper, setUpperIncomeRange] = useState(0);
  const [incomeUpperError, setUpperIncomeRangeError] = useState<string | undefined>(undefined);
  const [incomeLower, setLowerIncomeRange] = useState(0);
  const [incomeLowerError, setLowerIncomeRangeError] = useState<string | undefined>(undefined);
  const [familySize, setFamilySize] = useState(0);
  const [familySizeError, setFamilySizeError] = useState<string | undefined>(undefined);
  const [geoLocation, setGeoLocation] = useState('');
  const [geoLocationError, setGeoLocationError] = useState<string | undefined>(undefined);

  const { mutate } = useCustomerProfileCreate(conceptUuid);

  const handleTextFieldChange = useCallback(
    (
      fieldName: string,
      setText: React.Dispatch<React.SetStateAction<string>>,
      setError: React.Dispatch<React.SetStateAction<string | undefined>>,
      maxLength?: number,
    ) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const input = e.target.value;

        setError(undefined);

        if (input.length === 0) {
          setError(`${fieldName} is required. `);
        } else if (maxLength && input.length > maxLength) {
          setError(`${fieldName} exceeds the maximum allowed length.`);
        }

        setText(input);
      },
    [],
  );

  const handleRangeValueChange = useCallback(
    (
      type: 'lower' | 'upper',
      setRange: React.Dispatch<React.SetStateAction<number>>,
      setRangeError: React.Dispatch<React.SetStateAction<string | undefined>>,
      setInverseRangeError: React.Dispatch<React.SetStateAction<string | undefined>>,
      inverseValue: number,
    ) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        const num = parseInt(input);

        setRangeError(undefined);
        setInverseRangeError(undefined);

        if (type === 'lower' && num > inverseValue) {
          setRangeError('Lower range cannot be greater than upper range');
        } else if (type === 'upper' && num < inverseValue) {
          setRangeError('Upper range cannot be less than lower range');
        }

        setRange(num);
      },
    [],
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div />
        <button aria-label='Close' className='btn-close' onClick={() => closeModal()} />
      </div>
      <div className={styles.content}>
        <InputField
          label='Nickname'
          name='nickname'
          value={nickname}
          errorMessage={nicknameError}
          onChange={handleTextFieldChange('Nickname', setNickname, setNicknameError, NICKNAME_MAX_LENGTH)}
        />
        <div className={styles.inputRow}>
          <InputField
            label='First Name'
            name='firstName'
            value={firstName}
            errorMessage={firstNameError}
            onChange={handleTextFieldChange('First Name', setFirstName, setFirstNameError, NAME_MAX_LENGTH)}
          />
          <InputField
            label='Last Name'
            name='lastName'
            value={lastName}
            errorMessage={lastNameError}
            onChange={handleTextFieldChange('Last Name', setLastName, setLastNameError, NAME_MAX_LENGTH)}
          />
        </div>
        <TextArea
          label='Overview'
          name='overview'
          value={description}
          errorMessage={descriptionError}
          onChange={handleTextFieldChange('Description', setDescription, setDescriptionError)}
        />
        <h4>Demographics</h4>
        <InputField
          label='Geo Location'
          name='geoLocation'
          value={geoLocation}
          errorMessage={geoLocationError}
          onChange={handleTextFieldChange('Geolocation', setGeoLocation, setGeoLocationError)}
        />
        <div className={styles.inputRow}>
          <InputField
            label='Lower Age Ranger'
            name='lowerAgeRange'
            value={ageLower}
            errorMessage={ageLowerError}
            type='number'
            onChange={handleRangeValueChange(
              'lower',
              setLowerAgeRange,
              setLowerAgeRangeError,
              setUpperAgeRangeError,
              ageUpper,
            )}
          />
          <InputField
            label='Upper Age Ranger'
            name='upperAgeRange'
            value={ageUpper}
            errorMessage={ageUpperError}
            min={ageLower}
            type='number'
            onChange={handleRangeValueChange(
              'upper',
              setUpperAgeRange,
              setUpperAgeRangeError,
              setLowerAgeRangeError,
              ageLower,
            )}
          />
        </div>
        <InputField
          label='Family Size'
          name='familySize'
          value={familySize}
          type='number'
          errorMessage={familySizeError}
          onChange={(e) => {
            setFamilySize(parseInt(e.target.value));
          }}
        />
        <div className={styles.inputRow}>
          <InputField
            label='Lower Income Ranger'
            name='lowerIncomeRange'
            value={incomeLower}
            errorMessage={incomeLowerError}
            type='number'
            onChange={handleRangeValueChange(
              'lower',
              setLowerIncomeRange,
              setLowerIncomeRangeError,
              setUpperIncomeRangeError,
              incomeUpper,
            )}
          />
          <InputField
            label='Upper Income Ranger'
            name='upperIncomeRange'
            value={incomeUpper}
            errorMessage={incomeUpperError}
            min={incomeUpper}
            type='number'
            onChange={handleRangeValueChange(
              'upper',
              setUpperIncomeRange,
              setUpperIncomeRangeError,
              setLowerIncomeRangeError,
              incomeLower,
            )}
          />
        </div>
      </div>
      <div className={styles.footer}>
        <button className='btn btn-light' onClick={() => closeModal()}>
          Cancel
        </button>
        <button
          className='btn btn-primary'
          disabled={
            !!incomeLowerError ||
            !!incomeUpperError ||
            !!ageLowerError ||
            !!ageUpperError ||
            !!familySizeError ||
            !!geoLocationError ||
            !!descriptionError ||
            !!lastNameError ||
            !!firstNameError ||
            !!nicknameError ||
            !nickname ||
            !firstName ||
            !lastName ||
            !description ||
            !ageLower ||
            !ageUpper ||
            !incomeLower ||
            !incomeUpper ||
            !familySize ||
            !geoLocation
          }
          onClick={() => {
            mutate(
              {
                nickname,
                name: `${firstName} ${lastName}`,
                description: description,
                ageUpper,
                ageLower,
                incomeUpper,
                incomeLower,
                familySize,
                geoLocation,
                quotes: [] as string[],
                jobs: [] as string[],
                pains: [] as string[],
              },
              {
                onSuccess: () => {
                  closeModal();
                },
                onError: (error) => {
                  const message = utils.osiris.parseFormError(error);

                  if (
                    error.response &&
                    error.response.data &&
                    error.response.data.error &&
                    typeof error.response.data.error !== 'string'
                  ) {
                    const {
                      nickname: nName,
                      name: fullname,
                      description: overview,
                      geoLocation: gLocation,
                      familySize: fSize,
                      ageLower: aLower,
                      ageUpper: aUpper,
                      incomeLower: iLower,
                      incomeUpper: iUpper,
                    } = error.response.data.error;
                    if (nName) {
                      setNicknameError(nName[0].message);
                    }
                    if (fullname) {
                      setFirstNameError(fullname[0].message);
                    }
                    if (overview) {
                      setDescriptionError(overview[0].message);
                    }
                    if (gLocation) {
                      setGeoLocationError(gLocation[0].message);
                    }
                    if (fSize) {
                      setFamilySizeError(fSize[0].message);
                    }
                    if (aLower) {
                      setLowerAgeRangeError(aLower[0].message);
                    }
                    if (aUpper) {
                      setUpperAgeRangeError(aUpper[0].message);
                    }
                    if (iLower) {
                      setLowerIncomeRangeError(iLower[0].message);
                    }
                    if (iUpper) {
                      setUpperIncomeRangeError(iUpper[0].message);
                    }
                  }
                  toast.error(message);
                },
              },
            );
            closeModal();
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default AddCustomerProfile;
