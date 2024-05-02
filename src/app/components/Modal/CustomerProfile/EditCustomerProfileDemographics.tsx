import { FunctionComponent, useCallback, useState } from 'react';
import styles from './add-customer-profile.module.scss';
import { useCustomerProfileUpdate } from '../../../hooks/query/concepts.hook';
import { useModal } from '../../../context/modal/ModalContextProvider';
import InputField from '../../Text/InputField/InputField';

import { parseFormError } from '../../../../libs/utils';
import { toast } from 'react-toastify';
import { ICustomerProfile } from '../../../../libs/api/types';

interface IEditCustomerProfileDemographicsProps {
  conceptUuid?: string;
  profile: ICustomerProfile;
}

const EditCustomerProfileDemographics: FunctionComponent<IEditCustomerProfileDemographicsProps> = ({
  conceptUuid,
  profile,
}) => {
  const { closeModal } = useModal();
  const [ageUpper, setUpperAgeRange] = useState(profile.ageUpper);
  const [ageUpperError, setUpperAgeRangeError] = useState<string | undefined>(undefined);
  const [ageLower, setLowerAgeRange] = useState(profile.ageLower);
  const [ageLowerError, setLowerAgeRangeError] = useState<string | undefined>(undefined);
  const [incomeUpper, setUpperIncomeRange] = useState(profile.incomeUpper);
  const [incomeUpperError, setUpperIncomeRangeError] = useState<string | undefined>(undefined);
  const [incomeLower, setLowerIncomeRange] = useState(profile.incomeLower);
  const [incomeLowerError, setLowerIncomeRangeError] = useState<string | undefined>(undefined);
  const [familySize, setFamilySize] = useState(profile.familySize);
  const [familySizeError, setFamilySizeError] = useState<string | undefined>(undefined);
  const [geoLocation, setGeoLocation] = useState(profile.geoLocation);
  const [geoLocationError, setGeoLocationError] = useState<string | undefined>(undefined);

  const { mutate } = useCustomerProfileUpdate(profile.uuid, conceptUuid);

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
        <button aria-label="Close" className="btn-close" onClick={() => closeModal()} />
      </div>
      <div className={styles.content}>
        <h4>Demographics</h4>
        <InputField
          label="Geo Location"
          name="geoLocation"
          value={geoLocation}
          errorMessage={geoLocationError}
          onChange={handleTextFieldChange('Geolocation', setGeoLocation, setGeoLocationError)}
        />
        <div className={styles.inputRow}>
          <InputField
            label="Lower Age Ranger"
            name="lowerAgeRange"
            value={ageLower}
            errorMessage={ageLowerError}
            type="number"
            onChange={handleRangeValueChange(
              'lower',
              setLowerAgeRange,
              setLowerAgeRangeError,
              setUpperAgeRangeError,
              ageUpper,
            )}
          />
          <InputField
            label="Upper Age Ranger"
            name="upperAgeRange"
            value={ageUpper}
            errorMessage={ageUpperError}
            min={ageLower}
            type="number"
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
          label="Family Size"
          name="familySize"
          value={familySize}
          type="number"
          errorMessage={familySizeError}
          onChange={(e) => {
            setFamilySize(parseInt(e.target.value));
          }}
        />
        <div className={styles.inputRow}>
          <InputField
            label="Lower Income Ranger"
            name="lowerIncomeRange"
            value={incomeLower}
            errorMessage={incomeLowerError}
            type="number"
            onChange={handleRangeValueChange(
              'lower',
              setLowerIncomeRange,
              setLowerIncomeRangeError,
              setUpperIncomeRangeError,
              incomeUpper,
            )}
          />
          <InputField
            label="Upper Income Ranger"
            name="upperIncomeRange"
            value={incomeUpper}
            errorMessage={incomeUpperError}
            min={incomeUpper}
            type="number"
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
        <button className="btn btn-light" onClick={() => closeModal()}>
          Cancel
        </button>
        <button
          className="btn btn-primary"
          disabled={
            !!incomeLowerError ||
            !!incomeUpperError ||
            !!ageLowerError ||
            !!ageUpperError ||
            !!familySizeError ||
            !!geoLocationError ||
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
                uuid: profile.uuid,
                ageUpper,
                ageLower,
                incomeUpper,
                incomeLower,
                familySize,
                geoLocation,
              },
              {
                onSuccess: () => {
                  closeModal();
                },
                onError: (error) => {
                  const message = parseFormError(error);

                  if (
                    error.response &&
                    error.response.data &&
                    error.response.data.error &&
                    typeof error.response.data.error !== 'string'
                  ) {
                    const {
                      geoLocation: gLocation,
                      familySize: fSize,
                      ageLower: aLower,
                      ageUpper: aUpper,
                      incomeLower: iLower,
                      incomeUpper: iUpper,
                    } = error.response.data.error;

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

export default EditCustomerProfileDemographics;
