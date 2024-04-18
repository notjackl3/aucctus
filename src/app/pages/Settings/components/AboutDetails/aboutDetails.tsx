import { FunctionComponent, useMemo, useState } from 'react';
import RowInfo from '../../../../components/RowInfo/RowInfo';
import InputField from '../../../../components/InputField';
import styles from './styles/aboutDetails.module.scss';
import Select, { StylesConfig } from 'react-select';
import defaultAvatar from '../../../../assets/icons/avatar.svg';
import Icon from '../../../../components/Icon';
import { toast } from 'react-toastify';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import api from '../../../../../libs/api';
import Loading from '../../../../components/Loading';
import { IUser } from '../../../../../libs/api/typings';
import { defaultToastConfig } from '../../../../../libs/toast';
import { setUser } from '../../../../../features/auth/auth.slice';
import { useAppDispatch } from '../../../../hooks';

const defaultIconProps = {
  width: 20,
  height: 20,
  stroke: '#FFFFFF',
};

const customSelectStyles: StylesConfig = {
  container: (provided) => ({
    ...provided,
    position: 'relative',
    display: 'flex',
    flexGrow: 1,
    border: 'none',
    maxWidth: '25rem',
    fontFamily: 'DM Sans',
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
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const [isFormDisabled, setIsFormDisabled] = useState(true);

  const [aboutForm, setAboutForm] = useState<Partial<IUser>>({
    firstName: undefined,
    lastName: undefined,
    email: undefined,
    jobTitle: undefined,
    role: undefined,
  });

  const { firstName, lastName, email, jobTitle, role } = aboutForm;

  const { data } = useQuery({
    queryKey: ['user'],
    retry: 1,
    queryFn: async () => await api.account.getUser(),
    staleTime: Infinity,
  });

  const updateUserMutation = useMutation({
    mutationFn: async (userObj: Partial<IUser>) => {
      return api.account.updateUser(userObj);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      dispatch(setUser(data));
      setIsFormDisabled(true);
    },
    onError: () => {
      toast.error('User could not be updated. Please try again later.', defaultToastConfig);
    },
  });

  const updateUser = () => {
    updateUserMutation.mutate(aboutForm);
  };

  const resetFormState = () => {
    if (!data || !data.user) {
      return;
    }
    const { firstName, lastName, email, jobTitle, role } = data.user;
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
        value: firstName ?? data?.user.firstName,
        name: 'firstName',
      },
      {
        label: 'Last Name',
        value: lastName ?? data?.user.lastName,
        name: 'lastName',
      },
    ],
    [data, firstName, lastName]
  );

  const userInfo = useMemo(
    () => [
      {
        label: 'Email',
        value: email ?? data?.user.email,
        name: 'email',
      },
      {
        label: 'Job Title',
        value: jobTitle ?? data?.user.jobTitle,
        name: 'jobTitle',
      },
      {
        label: 'Aucctus Role',
        value: role ?? data?.user.role,
        name: 'role',
      },
    ],
    [data, email, jobTitle, role]
  );

  return data ? (
    <form
      className={styles.aboutDetails}
      onSubmit={(e) => {
        e.preventDefault();
        updateUser();
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
              type="button"
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
              type="button"
              className={`btn btn-primary btn-bold`}
              onClick={(e) => {
                e.preventDefault();
                setIsFormDisabled(false);
              }}
            >
              <Icon variant="edit" {...defaultIconProps} />
              Edit
            </button>
          ) : (
            <button className={`btn btn-primary btn-bold`} type="submit" disabled={updateUserMutation.isLoading}>
              <Icon variant="save" {...defaultIconProps} />
              Save
            </button>
          )}
        </div>
      </div>
      <RowInfo
        label={'Your photo'}
        tooltipContent="photo"
        sublabel="This will be displayed on your profile."
        render={
          <div className={styles.inputGroup}>
            <img className={styles.avatar} alt="avatar" src={defaultAvatar} />
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
                variant="settings"
                name={info.name}
                disabled={isFormDisabled}
                label={info.label}
                autoComplete="on"
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
                variant="settings"
                name={info.name}
                disabled={isFormDisabled}
                label={''}
                autoComplete="on"
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

export default AboutDetails;
