import { FunctionComponent, useMemo, useState } from 'react';
import RowInfo from '../../../components/Text/RowInfo/RowInfo';
import InputField from '../../../components/Text/InputField/InputField';
import styles from '../styles/aboutDetails.module.scss';
import Select, { StylesConfig } from 'react-select';
import defaultAvatar from '../../../assets/avatar.svg';
import Icon from '../../../components/Icons/Icon/Icon';
import { toast } from 'react-toastify';
import Loading from '../../../components/Loading';
import { IUser } from '../../../../libs/api/types';
import { useUpdateUser } from '../../../hooks/query/account.hook';
import { useAppStore } from '../../../stores/app.store';

const defaultIconProps = {
  width: 20,
  height: 20,
  stroke: '#FFFFFF',
};

//TODO - placeholder options
const COUNTRY_OPTIONS = [
  { value: 'canada', label: '🇨🇦 Canada' },
  { value: 'united states', label: '🇺🇸 United States' },
  { value: 'mexico', label: '🇲🇽 Mexico' },
];

const TIME_ZONE_OPTIONS = [
  { value: 'pst', label: '(GMT -8:00) Pacific Time (US & Canada)' },
  { value: 'mst', label: '(GMT -7:00) Mountain Time (US & Canada)' },
  { value: 'cst', label: '(GMT -6:00) Central Time (US & Canada)' },
  { value: 'est', label: '(GMT -5:00)  Eastern Time (US & Canada)' },
];

const AboutDetails: FunctionComponent = () => {
  const [isFormDisabled, setIsFormDisabled] = useState(true);
  const { mutate: updateUser, isLoading } = useUpdateUser();
  const { user } = useAppStore();
  const [aboutForm, setAboutForm] = useState<Partial<IUser>>({
    firstName: undefined,
    lastName: undefined,
    email: undefined,
    jobTitle: undefined,
    role: undefined,
  });

  const { firstName, lastName, email, jobTitle, role } = aboutForm;

  const resetFormState = () => {
    if (!user) {
      return;
    }
    const { firstName, lastName, email, jobTitle, role } = user;
    setAboutForm({
      firstName,
      lastName,
      email,
      jobTitle,
      role,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAboutForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const userNames = useMemo(
    () => [
      {
        label: 'First Name',
        value: firstName ?? user?.firstName,
        name: 'firstName',
      },
      {
        label: 'Last Name',
        value: lastName ?? user?.lastName,
        name: 'lastName',
      },
    ],
    [user, firstName, lastName],
  );

  const userInfo = useMemo(
    () => [
      {
        label: 'Email',
        value: email ?? user?.email,
        name: 'email',
        isDisabled: isFormDisabled,
      },
      {
        label: 'Job Title',
        value: jobTitle ?? user?.jobTitle,
        name: 'jobTitle',
        isDisabled: isFormDisabled,
      },
      {
        label: 'Aucctus Role',
        value: role ?? user?.role,
        name: 'role',
        isDisabled: true,
      },
    ],
    [user, email, jobTitle, role, isFormDisabled],
  );

  return user ? (
    <form
      className={styles.aboutDetails}
      onSubmit={(e) => {
        e.preventDefault();
        updateUser(aboutForm, {
          onSuccess: () => {
            setIsFormDisabled(true);
          },
          onError: () => {
            toast.error('User could not be updated. Please try again later.');
          },
        });
      }}
    >
      <div className={styles.headerSection}>
        <div className={styles.headerDescription}>
          <h3 className={styles.headerTitle}>Personal Info</h3>
          <div className={styles.headerSubtitle}>Update your photo and personal details here.</div>
        </div>
        <div className={styles.headerActions}>
          {!isFormDisabled && (
            <button
              type='button'
              className={`btn btn-light btn-bold`}
              onClick={(e) => {
                e.preventDefault();
                setIsFormDisabled(true);
                resetFormState();
              }}
            >
              Cancel
            </button>
          )}
          {isFormDisabled ? (
            <button
              type='button'
              className={`btn btn-primary btn-bold`}
              onClick={(e) => {
                e.preventDefault();
                setIsFormDisabled(false);
              }}
            >
              <Icon variant='edit' {...defaultIconProps} />
              Edit
            </button>
          ) : (
            <button className={`btn btn-primary btn-bold`} type='submit' disabled={isLoading}>
              <Icon variant='save' {...defaultIconProps} />
              Save
            </button>
          )}
        </div>
      </div>
      <RowInfo
        label={'Your photo'}
        tooltipContent='photo'
        sublabel='This will be displayed on your profile.'
        render={
          <div className={styles.inputGroup}>
            <img className={styles.avatar} alt='avatar' src={defaultAvatar} />
          </div>
        }
      />
      <RowInfo
        label={'Name'}
        render={
          <div className={styles.inputGroup}>
            {userNames.map((info, i) => (
              <InputField
                key={`${info.name}-${i}`}
                variant='settings'
                name={info.name}
                disabled={isFormDisabled}
                label={info.label}
                autoComplete='on'
                value={info.value}
                onChange={handleInputChange}
              />
            ))}
          </div>
        }
      />
      {userInfo.map((info, i) => (
        <RowInfo
          key={`${info.name}-${i}`}
          label={info.label}
          render={
            <div className={styles.inputGroup}>
              <InputField
                variant='settings'
                name={info.name}
                disabled={info.isDisabled}
                label={''}
                autoComplete='on'
                value={info.value}
                onChange={handleInputChange}
              />
            </div>
          }
        />
      ))}
      <RowInfo
        label={'Based In'}
        render={
          <Select
            isDisabled={isFormDisabled}
            styles={customSelectStyles}
            options={COUNTRY_OPTIONS}
            defaultValue={COUNTRY_OPTIONS[0]}
            isSearchable={false}
          />
        }
      />
      <RowInfo
        label={'Timezone'}
        render={
          <Select
            isDisabled={isFormDisabled}
            styles={customSelectStyles}
            options={TIME_ZONE_OPTIONS}
            defaultValue={TIME_ZONE_OPTIONS[0]}
            isSearchable={false}
          />
        }
      />
    </form>
  ) : (
    <Loading />
  );
};

const customSelectStyles: StylesConfig = {
  container: (provided) => ({
    ...provided,
    position: 'relative',
    display: 'flex',
    flexGrow: 1,
    border: 'none',
    maxWidth: '25rem',
    fontFamily: 'Inter',
    fontSize: '1rem',
    fontWeight: 500,
  }),
  singleValue: (styles) => ({ ...styles, color: 'black' }),
  control: (provided) => ({
    ...provided,
    borderRadius: 8,
    flexGrow: 1,
    background: 'white',
  }),
  menu: (provided) => ({
    ...provided,
    position: 'absolute',
  }),
};

export default AboutDetails;
