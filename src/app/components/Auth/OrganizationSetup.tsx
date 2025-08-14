import { FunctionComponent, useEffect, useState } from 'react';
import {
  useOrganization,
  useOrganizationList,
  useUser,
} from '@clerk/clerk-react';
import { toast } from '@components';
import telemetry from '@libs/telemetry';

interface IOrganizationSetupProps {
  onComplete: () => void;
  onSkip?: () => void;
}

/**
 * Component to handle automatic organization creation for new Clerk users
 * This ensures that every user has an organization associated with their account
 */
const OrganizationSetup: FunctionComponent<IOrganizationSetupProps> = ({
  onComplete,
  onSkip,
}) => {
  const { user } = useUser();
  const { organization } = useOrganization();
  const { createOrganization, userMemberships, isLoaded } =
    useOrganizationList();
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [orgName, setOrgName] = useState<string>('');

  useEffect(() => {
    if (isLoaded && user) {
      // Auto-populate organization name based on user's name
      const defaultOrgName = user.firstName
        ? `${user.firstName}'s Organization`
        : `${user.primaryEmailAddress?.emailAddress?.split('@')[0] || 'My'} Organization`;
      setOrgName(defaultOrgName);

      // If user already has an organization, complete setup
      if (
        organization ||
        (userMemberships.data && userMemberships.data.length > 0)
      ) {
        onComplete();
      }
    }
  }, [isLoaded, user, organization, userMemberships.data, onComplete]);

  const handleCreateOrganization = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    if (!orgName.trim() || !createOrganization) return;

    setIsCreating(true);

    try {
      const newOrg = await createOrganization({ name: orgName.trim() });

      if (newOrg) {
        toast.success(`Organization "${orgName}" created successfully!`);
        onComplete();
      }
    } catch (err: any) {
      telemetry.error('Organization creation error:', err);
      if (err.errors?.[0]?.message) {
        toast.error(err.errors[0].message);
      } else {
        toast.error('Failed to create organization. Please try again.');
      }
    } finally {
      setIsCreating(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        Loading...
      </div>
    );
  }

  // If user already has an organization, don't show this component
  if (
    organization ||
    (userMemberships.data && userMemberships.data.length > 0)
  ) {
    return null;
  }

  return (
    <div className='flex flex-col items-center justify-center gap-4 self-stretch'>
      <span className='aucctus-text-brand-primary aucctus-header-sm-medium relative self-stretch'>
        Set Up Your Organization
      </span>
      <span className='aucctus-text-md aucctus-text-tertiary relative self-stretch'>
        Create an organization to get started with Aucctus
      </span>

      <form
        className='aucctus-text-sm-medium flex flex-col items-center gap-8 self-stretch'
        onSubmit={handleCreateOrganization}
      >
        <div className='w-full'>
          <label className='aucctus-text-sm aucctus-text-primary mb-2 block font-medium'>
            Organization Name
          </label>
          <input
            type='text'
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            className='form-control w-full'
            placeholder='Enter organization name'
            required
          />
        </div>

        <button
          type='submit'
          className='btn btn-primary'
          disabled={!orgName.trim() || isCreating}
        >
          {isCreating ? 'Creating Organization...' : 'Create Organization'}
        </button>

        {onSkip && (
          <button
            type='button'
            onClick={onSkip}
            className='aucctus-text-brand-primary hover:aucctus-text-brand-primary-hover aucctus-text-sm underline'
          >
            Skip for now
          </button>
        )}
      </form>
    </div>
  );
};

export default OrganizationSetup;
