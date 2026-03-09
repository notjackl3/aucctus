import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@libs/utils/react';
import { DynamicIcon } from '@libs/utils/iconMap';
import type { ILeadCapturePayload } from '@libs/api/types/valueDiscovery';

interface LeadCaptureScreenProps {
  onSubmit: (data: ILeadCapturePayload) => void;
  isLoading: boolean;
}

export const LeadCaptureScreen = ({
  onSubmit,
  isLoading,
}: LeadCaptureScreenProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');

  const canSubmit = name.trim().length > 0 && email.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || isLoading) return;

    onSubmit({
      lead_name: name.trim(),
      lead_email: email.trim(),
      lead_role: role.trim() || undefined,
    });
  };

  const inputClasses = cn(
    'aucctus-bg-primary aucctus-border-primary aucctus-text-primary w-full rounded-xl border px-4 py-3 text-sm transition-colors',
    'placeholder:aucctus-text-tertiary',
    'focus:aucctus-border-brand focus:outline-none focus:ring-1 focus:ring-primary-600/30',
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className='aucctus-bg-secondary aucctus-border-secondary rounded-2xl border p-8 shadow-2xl backdrop-blur-2xl'
    >
      <div className='mb-8 text-center'>
        <div className='aucctus-bg-brand-solid mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full'>
          <DynamicIcon
            variant='user-01'
            height={24}
            width={24}
            className='stroke-white'
          />
        </div>
        <h2 className='aucctus-text-primary mb-2 text-2xl font-semibold'>
          Unlock Your AI Innovation Roadmap
        </h2>
        <p className='aucctus-text-tertiary text-sm'>
          Your personalized analysis is being generated. Enter your details to
          unlock the results.
        </p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label className='aucctus-text-secondary mb-1.5 block text-sm font-medium'>
            Full Name <span className='text-red-400'>*</span>
          </label>
          <input
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='John Doe'
            className={inputClasses}
          />
        </div>

        <div>
          <label className='aucctus-text-secondary mb-1.5 block text-sm font-medium'>
            Work Email <span className='text-red-400'>*</span>
          </label>
          <input
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder='john@company.com'
            className={inputClasses}
          />
        </div>

        <div>
          <label className='aucctus-text-secondary mb-1.5 block text-sm font-medium'>
            Role
          </label>
          <input
            type='text'
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder='VP of Innovation'
            className={inputClasses}
          />
        </div>

        <div className='pt-4'>
          <button
            type='submit'
            disabled={!canSubmit || isLoading}
            className={cn(
              'btn btn-primary btn-lg flex w-full items-center justify-center gap-2',
              (!canSubmit || isLoading) && 'cursor-not-allowed opacity-50',
            )}
          >
            <span>{isLoading ? 'Submitting...' : 'Unlock My Roadmap'}</span>
            <DynamicIcon
              variant={isLoading ? 'refresh' : 'sparkles'}
              height={18}
              width={18}
              className={cn('stroke-current', isLoading && 'animate-spin')}
            />
          </button>
        </div>
      </form>
    </motion.div>
  );
};
