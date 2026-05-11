import images from '@assets/img';
import { toast } from '@components';
import { useScoringConfigs } from '@hooks/query/scoringConfig.hook';
import api from '@libs/api';
import {
  ICreateSubmissionLink,
  ISubmissionLink,
  IUpdateSubmissionLink,
} from '@libs/api/types/ideaSubmissions';
import { cn } from '@libs/utils/react';
import useStore from '@stores/store';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowLeft,
  ChevronDown,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  LockKeyhole,
  X,
} from 'lucide-react';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { useMutation } from 'react-query';

interface SubmissionLinkModalProps {
  link: ISubmissionLink | null;
  onClose: () => void;
  onSuccess: (link: ISubmissionLink) => void;
  /** Optional callback for "Go Back" button - shows back arrow instead of X */
  onBack?: () => void;
  /** Whether to show the modal in standalone mode (with overlay) or embedded mode */
  embedded?: boolean;
}

// Slug validation: lowercase alphanumeric and hyphens, 3-200 chars
const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{1,198}[a-z0-9]$/;

/**
 * Modal for creating or editing a submission link
 */
const SubmissionLinkModal: FunctionComponent<SubmissionLinkModalProps> = ({
  link,
  onClose,
  onSuccess,
  onBack,
  embedded = false,
}) => {
  const account = useStore((state) => state.auth.account);
  const isEditing = !!link;

  // Scoring configs
  const { configs: scoringConfigs } = useScoringConfigs(account?.uuid);

  // Form state
  const [title, setTitle] = useState(link?.title || '');
  const [slug, setSlug] = useState(link?.slug || '');
  const [scoringConfigUuid, setScoringConfigUuid] = useState<string>(
    link?.defaultScoringConfigUuid || '',
  );
  const [hasPassword, setHasPassword] = useState(
    link?.requiresPassword || false,
  );
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [clearPassword, setClearPassword] = useState(false);

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Close on Escape key
  useEffect(() => {
    if (embedded) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [embedded, onClose]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEditing && title && !slug) {
      const generated = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 200);
      setSlug(generated);
    }
  }, [title, isEditing, slug]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: ICreateSubmissionLink) =>
      api.ideaSubmissions.createSubmissionLink(data),
    onSuccess: (createdLink) => {
      toast.success('Submission link created successfully');
      onSuccess(createdLink);
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.detail || 'Failed to create submission link';
      toast.error(message);
      if (message.includes('slug')) {
        setErrors({ slug: 'This slug is already in use' });
      }
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({
      uuid,
      data,
    }: {
      uuid: string;
      data: IUpdateSubmissionLink;
    }) => api.ideaSubmissions.updateSubmissionLink(uuid, data),
    onSuccess: (updatedLink) => {
      toast.success('Submission link updated successfully');
      onSuccess(updatedLink);
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.detail || 'Failed to update submission link';
      toast.error(message);
      if (message.includes('slug')) {
        setErrors({ slug: 'This slug is already in use' });
      }
    },
  });

  const isLoading = createMutation.isLoading || updateMutation.isLoading;

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!slug.trim()) {
      newErrors.slug = 'Slug is required';
    } else if (!SLUG_REGEX.test(slug)) {
      newErrors.slug =
        'Slug must be 3-200 characters, lowercase letters, numbers, and hyphens only';
    }

    if (hasPassword && !password) {
      // Password is required when enabling password protection:
      // 1. Creating a new link with password protection, OR
      // 2. Editing a link that didn't have password protection (enabling it now)
      const isEnablingPasswordProtection =
        !isEditing || !link?.requiresPassword;

      if (isEnablingPasswordProtection) {
        newErrors.password =
          'Password is required when enabling password protection';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    if (isEditing && link) {
      // Update existing link
      const data: IUpdateSubmissionLink = {
        title,
        slug,
      };

      // Handle scoring config changes
      if (scoringConfigUuid !== (link.defaultScoringConfigUuid || '')) {
        data.scoring_config_uuid = scoringConfigUuid || null;
      }

      // Handle password changes
      if (clearPassword) {
        data.password = null;
      } else if (password) {
        data.password = password;
      }

      updateMutation.mutate({ uuid: link.uuid, data });
    } else {
      // Create new link
      const data: ICreateSubmissionLink = {
        title,
        slug,
        password: hasPassword ? password : undefined,
        scoring_config_uuid: scoringConfigUuid || undefined,
      };

      createMutation.mutate(data);
    }
  };

  // Handle slug input - auto-format
  const handleSlugChange = (value: string) => {
    const formatted = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSlug(formatted);
    if (errors.slug) {
      setErrors({ ...errors, slug: '' });
    }
  };

  // Generate URL preview - use namespace or fallback to formatted name
  const accountSlug =
    account?.namespace ||
    account?.name?.toLowerCase().replace(/\s+/g, '-') ||
    account?.uuid;
  const fullUrl = `${accountSlug}.aucctus.com/${slug || 'your-slug'}`;

  // Copy URL to clipboard
  const copyUrl = () => {
    navigator.clipboard.writeText(`https://${fullUrl}`);
    toast.success('URL copied to clipboard');
  };

  // Open URL in new tab
  const openUrl = () => {
    window.open(`https://${fullUrl}`, '_blank');
  };

  // Generate random password
  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    const newPassword = Array.from(
      { length: 12 },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join('');
    setPassword(newPassword);
    setClearPassword(false);
    if (errors.password) setErrors({ ...errors, password: '' });
  };

  const modalContent = (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'w-full max-w-xl overflow-hidden',
        embedded && 'rounded-lg',
      )}
    >
      {/* Header with Background Image */}
      <div
        className='relative px-6 pb-10 pt-6'
        style={{
          backgroundImage: `url(${images.aiExplorationsBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Close Button */}
        <button
          type='button'
          onClick={onClose}
          aria-label='Close'
          className='absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white'
        >
          <X className='h-4 w-4' />
        </button>

        {/* Back Button (when onBack is provided) */}
        {onBack && !isEditing && (
          <button
            onClick={onBack}
            className='mb-4 flex items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-white'
          >
            <ArrowLeft className='h-3.5 w-3.5' />
            Go Back
          </button>
        )}

        {/* Title & Description */}
        <div className='text-center'>
          <h2 className='text-2xl font-semibold text-white'>
            {isEditing ? 'Edit Submission Link' : 'New Submission Link'}
          </h2>
          <p className='mt-1 text-white/70'>
            {isEditing ? (
              <span>Update your submission link details below.</span>
            ) : (
              <>
                <span className='block'>
                  Collect external ideas. You&apos;ll review them
                </span>
                <span className='block'>
                  before they&apos;re added to your concept bank.
                </span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className='space-y-6 p-6'>
        {/* Link Name */}
        <div className='space-y-2'>
          <label className='aucctus-text-xs aucctus-text-tertiary block font-medium uppercase tracking-wide'>
            Link Name
          </label>
          <input
            type='text'
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors({ ...errors, title: '' });
            }}
            placeholder='Q1 Innovation Challenge'
            className={cn(
              'aucctus-bg-secondary/20 aucctus-border-secondary/50 aucctus-text-primary focus:aucctus-bg-primary h-11 w-full rounded-lg border px-4 transition-colors placeholder:italic focus:outline-none',
              errors.title
                ? 'aucctus-border-error focus:aucctus-border-error'
                : 'focus:aucctus-border-brand/50',
            )}
          />
          {errors.title && (
            <p className='aucctus-text-xs aucctus-text-error-primary flex items-center gap-1'>
              <AlertCircle className='h-3 w-3' />
              {errors.title}
            </p>
          )}
        </div>

        {/* Customize URL */}
        <div className='space-y-2'>
          <label className='aucctus-text-xs aucctus-text-tertiary block font-medium uppercase tracking-wide'>
            Customize URL
          </label>
          <div className='space-y-2'>
            <div
              className={cn(
                'aucctus-bg-secondary/20 aucctus-border-secondary/50 focus-within:aucctus-bg-primary flex w-full items-center overflow-hidden rounded-lg border transition-colors',
                errors.slug
                  ? 'aucctus-border-error'
                  : 'focus-within:aucctus-border-brand/50',
              )}
            >
              <span className='aucctus-text-sm aucctus-text-tertiary aucctus-border-secondary/50 shrink-0 border-r px-3 py-2.5'>
                {accountSlug}.aucctus.com/
              </span>
              <input
                type='text'
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                className='aucctus-text-primary h-10 min-w-0 flex-1 border-0 bg-transparent px-2 font-mono text-sm focus:outline-none focus:ring-0'
              />
            </div>
            <div className='flex items-center gap-1'>
              <button
                type='button'
                onClick={() => {
                  const newState = !hasPassword;
                  setHasPassword(newState);
                  if (newState && !password) {
                    generatePassword();
                  }
                  if (!newState) {
                    setPassword('');
                    setClearPassword(isEditing);
                  }
                }}
                className={cn(
                  'aucctus-text-tertiary hover:aucctus-text-primary h-9 w-9 shrink-0 rounded-lg transition-colors',
                  hasPassword
                    ? 'bg-[hsl(25,15%,12%)] text-white hover:bg-[hsl(25,15%,18%)]'
                    : 'hover:aucctus-bg-secondary',
                )}
                title={
                  hasPassword
                    ? 'Password protection enabled'
                    : 'Enable password protection'
                }
              >
                <LockKeyhole className='mx-auto h-4 w-4' />
              </button>
              <button
                type='button'
                onClick={copyUrl}
                className='aucctus-text-tertiary hover:aucctus-text-primary hover:aucctus-bg-secondary h-9 w-9 shrink-0 rounded-lg transition-colors'
                title='Copy URL'
              >
                <Copy className='mx-auto h-4 w-4' />
              </button>
              <button
                type='button'
                onClick={openUrl}
                className='aucctus-text-tertiary hover:aucctus-text-primary hover:aucctus-bg-secondary h-9 w-9 shrink-0 rounded-lg transition-colors'
                title='Open URL'
              >
                <ExternalLink className='mx-auto h-4 w-4' />
              </button>
            </div>
          </div>
          {errors.slug && (
            <p className='aucctus-text-xs aucctus-text-error-primary flex items-center gap-1'>
              <AlertCircle className='h-3 w-3' />
              {errors.slug}
            </p>
          )}

          {/* Password Field (shown when password protection is enabled) */}
          {hasPassword && (
            <div className='mt-2 flex items-center gap-2'>
              <div className='relative flex-1'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setClearPassword(false);
                    if (errors.password) setErrors({ ...errors, password: '' });
                  }}
                  placeholder={
                    isEditing && link?.requiresPassword
                      ? 'Enter new password'
                      : 'Enter password for this link'
                  }
                  className={cn(
                    'aucctus-bg-secondary/20 aucctus-border-secondary/50 aucctus-text-primary focus:aucctus-bg-primary h-10 w-full rounded-lg border px-4 pr-10 font-mono transition-colors focus:outline-none',
                    errors.password
                      ? 'aucctus-border-error focus:aucctus-border-error'
                      : 'focus:aucctus-border-brand/50',
                  )}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='aucctus-text-tertiary hover:aucctus-text-secondary absolute right-3 top-1/2 -translate-y-1/2'
                >
                  {showPassword ? (
                    <EyeOff className='h-4 w-4' />
                  ) : (
                    <Eye className='h-4 w-4' />
                  )}
                </button>
              </div>
              <button
                type='button'
                onClick={() => {
                  navigator.clipboard.writeText(password);
                  toast.success('Password copied');
                }}
                className='aucctus-text-tertiary hover:aucctus-text-primary hover:aucctus-bg-secondary h-10 w-10 shrink-0 rounded-lg transition-colors'
                title='Copy password'
              >
                <Copy className='mx-auto h-4 w-4' />
              </button>
            </div>
          )}
          {errors.password && (
            <p className='aucctus-text-xs aucctus-text-error-primary flex items-center gap-1'>
              <AlertCircle className='h-3 w-3' />
              {errors.password}
            </p>
          )}
        </div>

        {/* Scoring Config */}
        {scoringConfigs.length > 0 && (
          <div className='space-y-2'>
            <label className='aucctus-text-xs aucctus-text-tertiary block font-medium uppercase tracking-wide'>
              Scoring Criteria
            </label>
            <div className='relative'>
              <select
                value={scoringConfigUuid}
                onChange={(e) => setScoringConfigUuid(e.target.value)}
                className='aucctus-bg-secondary/20 aucctus-border-secondary/50 aucctus-text-primary focus:aucctus-bg-primary focus:aucctus-border-brand/50 h-11 w-full appearance-none rounded-lg border px-4 pr-10 transition-colors focus:outline-none'
              >
                <option value=''>Use Account Default</option>
                {scoringConfigs.map((config) => (
                  <option key={config.uuid} value={config.uuid}>
                    {config.name}
                    {config.isDefault ? ' (Account Default)' : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className='aucctus-text-tertiary pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2' />
            </div>
            <p className='aucctus-text-xs aucctus-text-tertiary'>
              New submissions under this link will be scored with this criteria.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className='flex items-center justify-end gap-3 pt-4'>
          <motion.button
            type='button'
            onClick={onBack || onClose}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className='btn btn-secondary btn-md'
            disabled={isLoading}
          >
            Cancel
          </motion.button>
          <motion.button
            type='submit'
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className='btn btn-primary btn-md'
            disabled={isLoading || !title.trim()}
          >
            {isLoading
              ? isEditing
                ? 'Saving...'
                : 'Creating...'
              : isEditing
                ? 'Save Changes'
                : 'Create Link'}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );

  // If embedded mode, just return the content without overlay
  if (embedded) {
    return modalContent;
  }

  // Standalone mode with glass overlay
  return (
    <div
      className='glass-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4'
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className='relative w-full max-w-xl'>
        <div className='liquid-glass-modal-shell'>
          <div
            aria-hidden='true'
            className='liquid-glass-modal-rim liquid-glass-modal-rim-animated'
          >
            <div className='rim-orb rim-orb-1' />
            <div className='rim-orb rim-orb-2' />
          </div>
          <div className='liquid-glass-modal-surface overflow-hidden'>
            {modalContent}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionLinkModal;
