import { Input, Loading, toast } from '@components';
import useStore from '@stores/store';
import { FunctionComponent, useMemo, useState } from 'react';
import { IUser } from '../../../../libs/api/types';
import RowInfo from '../../../components/Text/RowInfo/RowInfo';
import { useUpdateUser } from '../../../hooks/query/account.hook';
import { Pencil, Save } from 'lucide-react';

const defaultIconProps = {
  width: 20,
  height: 20,
  className: 'stroke-white',
};

const AboutDetails: FunctionComponent = () => {
  const [isFormDisabled, setIsFormDisabled] = useState(true);
  const { mutate: updateUser, isLoading } = useUpdateUser();
  const user = useStore((state) => state.auth.user);
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
        isDisabled: true,
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
      className='flex h-full w-full flex-col items-start'
      onSubmit={(e) => {
        e.preventDefault();
        if (
          aboutForm.firstName === '' ||
          aboutForm.lastName === '' ||
          aboutForm.jobTitle === ''
        ) {
          toast.error('Empty Fields', 'Fields cannot be empty');
          return;
        }
        updateUser(aboutForm, {
          onSuccess: () => {
            setIsFormDisabled(true);
          },
          onError: () => {
            toast.error(
              'Update Failed',
              'User could not be updated. Please try again later',
            );
          },
        });
      }}
    >
      <div className='mb-8 flex w-full items-start justify-between'>
        <div className='flex flex-col'>
          <h3 className='aucctus-text-xl-semibold aucctus-text-brand-secondary'>
            Personal Info
          </h3>
          <div className='aucctus-text-sm aucctus-text-secondary'>
            Update your personal details here.
          </div>
        </div>
        <div className='flex gap-2'>
          {!isFormDisabled && (
            <button
              type='button'
              className='btn btn-light btn-bold'
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
              className='btn btn-primary btn-bold'
              onClick={(e) => {
                e.preventDefault();
                setIsFormDisabled(false);
              }}
            >
              <Pencil {...defaultIconProps} />
              Edit
            </button>
          ) : (
            <button
              className='btn btn-primary btn-bold'
              type='submit'
              disabled={isLoading}
            >
              <Save {...defaultIconProps} />
              Save
            </button>
          )}
        </div>
      </div>
      <RowInfo
        label={'Name'}
        render={
          <div className='flex flex-1 gap-4'>
            {userNames.map((info, i) => (
              <Input.Field
                key={`${info.name}-${i}`}
                variant='settings'
                name={info.name}
                disabled={isFormDisabled}
                label={info.label}
                autoComplete='on'
                value={info.value}
                onChange={handleInputChange}
                placeholder='Required'
                error={!user?.[info.name as keyof IUser]}
                required={true}
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
            <div className='flex flex-1 gap-4'>
              <Input.Field
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
    </form>
  ) : (
    <Loading />
  );
};

export default AboutDetails;
