import NavLogo from '@assets/aucctus_logo.png';
import NavWord from '@assets/aucctus_nav_word.png';
import { cn } from '@libs/utils/react';
import { Turnstile } from '@marsidev/react-turnstile';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, EyeOff, Lightbulb, Loader2, Lock, Send } from 'lucide-react';
import { memo, useCallback, useState } from 'react';

interface VideoBackgroundProps {
  headquartersVideoUrl?: string | null;
  accountName?: string;
  companyLogoUrl: string | null;
  logoFailed: boolean;
  onLogoError: () => void;
}

/**
 * Video background component - memoized to prevent unnecessary rerenders
 * Shows either headquarters video or animated background with company logo/name
 */
export const VideoBackground = memo<VideoBackgroundProps>(
  function VideoBackground({
    headquartersVideoUrl,
    accountName,
    companyLogoUrl,
    logoFailed,
    onLogoError,
  }: VideoBackgroundProps) {
    const hasHeadquartersVideo = !!headquartersVideoUrl;
    const hasValidLogo = companyLogoUrl && !logoFailed;

    return (
      <div className='fixed left-0 top-0 hidden h-screen w-1/2 overflow-hidden lg:block'>
        {/* Background - Either video or animated image */}
        {hasHeadquartersVideo ? (
          <>
            {/* Headquarters Video Background */}
            <video
              autoPlay
              loop
              muted
              playsInline
              className='absolute inset-0 h-full w-full object-cover'
              onLoadedMetadata={(e: React.SyntheticEvent<HTMLVideoElement>) => {
                e.currentTarget.playbackRate = 0.75;
              }}
            >
              <source src={headquartersVideoUrl!} type='video/mp4' />
            </video>
          </>
        ) : (
          <>
            {/* Animated Image Background Fallback (like IdeaPlayground) */}
            <div
              className='absolute -inset-4 bg-cover bg-center bg-no-repeat'
              style={{
                backgroundImage: "url('/images/darker-background.png')",
                filter: 'blur(4px) contrast(1.3)',
                animation: 'moveBackground 30s ease infinite',
                transform: 'scale(1.05)',
              }}
            />
          </>
        )}

        {/* Dark gradient overlay */}
        <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-black/40' />

        {/* Company Logo OR Text - Centered */}
        <div className='absolute inset-0 flex items-center justify-center'>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: 'spring', bounce: 0.3 }}
            className='flex flex-col items-center gap-4'
          >
            {hasValidLogo ? (
              /* Show only logo when available */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 0.75, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                whileHover={{ scale: 1.05, opacity: 0.9 }}
                className='flex items-center justify-center overflow-hidden rounded-md bg-white/30 p-4 backdrop-blur-sm'
              >
                <img
                  src={companyLogoUrl}
                  alt={accountName || 'Company logo'}
                  className='h-24 w-auto max-w-[200px] object-contain'
                  onError={onLogoError}
                />
              </motion.div>
            ) : (
              /* Show only text when no logo */
              accountName && (
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className='text-3xl font-semibold text-white drop-shadow-lg'
                >
                  {accountName}
                </motion.span>
              )
            )}
          </motion.div>
        </div>

        {/* Powered by Aucctus - Centered at Bottom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className='absolute bottom-6 left-0 right-0 flex justify-center'
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
            className='flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 backdrop-blur-sm'
          >
            <span className='text-sm text-white/80'>Powered by</span>
            <div className='flex items-center rounded-md bg-white/50 p-1'>
              <img src={NavLogo} alt='Aucctus' className='h-4 w-4' />
              <img src={NavWord} alt='Aucctus' className='h-4 w-auto' />
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  },
);

interface SubmissionFormData {
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  ideaDescription: string;
  problemStatement: string;
  expectedImpact: string;
  password: string;
  website: string; // Honeypot field
  captchaToken: string; // Cloudflare Turnstile token
}

// Character limits (matching backend constraints)
const MAX_LENGTHS = {
  title: 255,
  ideaDescription: 10000,
  problemStatement: 5000,
  expectedImpact: 5000,
} as const;

interface SubmissionFormProps {
  linkInfo: {
    requiresPassword?: boolean;
    accountName?: string;
  };
  companyLogoUrl: string | null;
  logoFailed: boolean;
  isSubmitting: boolean;
  isError: boolean;
  /** Error message from the API mutation */
  errorMessage?: string | null;
  onSubmit: (data: SubmissionFormData) => void;
}

/**
 * Submission form component - manages its own state to prevent parent rerenders
 */
export const SubmissionForm = memo<SubmissionFormProps>(
  function SubmissionForm({
    linkInfo,
    companyLogoUrl,
    logoFailed,
    isSubmitting,
    isError,
    errorMessage,
    onSubmit,
  }: SubmissionFormProps) {
    // Form state
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [title, setTitle] = useState('');
    const [ideaDescription, setIdeaDescription] = useState('');
    const [problemStatement, setProblemStatement] = useState('');
    const [expectedImpact, setExpectedImpact] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [website, setWebsite] = useState(''); // Honeypot field - should always be empty
    const [captchaToken, setCaptchaToken] = useState('');

    // Validation state
    const [errors, setErrors] = useState<Record<string, string>>({});

    const hasValidLogo = companyLogoUrl && !logoFailed;
    const requiresPassword = linkInfo?.requiresPassword;

    // Validation
    const validateForm = useCallback((): boolean => {
      const newErrors: Record<string, string> = {};

      if (!firstName.trim()) {
        newErrors.firstName = 'First name is required';
      }
      if (!lastName.trim()) {
        newErrors.lastName = 'Last name is required';
      }
      if (!email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = 'Please enter a valid email address';
      }
      if (!title.trim()) {
        newErrors.title = 'Idea title is required';
      } else if (title.length > MAX_LENGTHS.title) {
        newErrors.title = `Title must be ${MAX_LENGTHS.title} characters or less`;
      }
      if (!ideaDescription.trim()) {
        newErrors.ideaDescription = 'Idea description is required';
      } else if (ideaDescription.length > MAX_LENGTHS.ideaDescription) {
        newErrors.ideaDescription = `Description must be ${MAX_LENGTHS.ideaDescription} characters or less`;
      }
      if (!problemStatement.trim()) {
        newErrors.problemStatement = 'Problem statement is required';
      } else if (problemStatement.length > MAX_LENGTHS.problemStatement) {
        newErrors.problemStatement = `Problem statement must be ${MAX_LENGTHS.problemStatement} characters or less`;
      }
      if (expectedImpact.length > MAX_LENGTHS.expectedImpact) {
        newErrors.expectedImpact = `Expected impact must be ${MAX_LENGTHS.expectedImpact} characters or less`;
      }
      if (requiresPassword && !password.trim()) {
        newErrors.password = 'Password is required';
      }
      if (!captchaToken) {
        newErrors.captcha = 'Please complete the security check';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }, [
      firstName,
      lastName,
      email,
      title,
      ideaDescription,
      problemStatement,
      expectedImpact,
      password,
      requiresPassword,
      captchaToken,
    ]);

    const handleSubmit = useCallback(
      (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        onSubmit({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          title: title.trim(),
          ideaDescription: ideaDescription.trim(),
          problemStatement: problemStatement.trim(),
          expectedImpact: expectedImpact.trim(),
          password,
          website, // Honeypot field - should always be empty
          captchaToken,
        });
      },
      [
        validateForm,
        onSubmit,
        firstName,
        lastName,
        email,
        title,
        ideaDescription,
        problemStatement,
        expectedImpact,
        password,
        website,
        captchaToken,
      ],
    );

    // Input class helper
    const getInputClass = (hasError: boolean) =>
      cn(
        'w-full px-4 py-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all',
        hasError ? 'border-red-500' : 'border-gray-300',
      );

    return (
      <div className='flex h-screen w-full flex-col bg-white lg:ml-[50%] lg:w-1/2'>
        {/* Sticky Header */}
        <div className='sticky top-0 z-10 bg-white px-6 pb-6 pt-8 sm:px-8'>
          <div className='mx-auto w-full max-w-lg'>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className='mb-2 flex items-center justify-between gap-3'
            >
              {/* Left side: Icon + Title */}
              <div className='flex items-center gap-3'>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.4, type: 'spring' }}
                  className='aucctus-bg-brand-secondary inline-flex h-10 w-10 items-center justify-center rounded-lg'
                >
                  <Lightbulb className='aucctus-text-brand-primary h-5 w-5' />
                </motion.div>
                <h1 className='text-2xl font-bold text-gray-900'>
                  Submit Your Idea
                </h1>
              </div>
              {/* Right side: Company logo (mobile only) */}
              {hasValidLogo && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className='flex items-center justify-center overflow-hidden rounded-md p-3 lg:hidden'
                >
                  <img
                    src={companyLogoUrl}
                    alt={linkInfo?.accountName || 'Company logo'}
                    className='h-16 w-auto max-w-[100px] object-contain'
                  />
                </motion.div>
              )}
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className='mt-4 text-gray-600'
            >
              {
                'Share your innovative idea with us. We review every submission and will follow up on promising concepts.'
              }
            </motion.p>
          </div>
        </div>

        {/* Scrollable Form Content */}
        <div className='flex-1 overflow-y-auto px-6 pb-8 sm:px-8'>
          <div className='mx-auto w-full max-w-lg'>
            {/* Form */}
            <form onSubmit={handleSubmit} className='space-y-5'>
              {/* Name Row */}
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label
                    htmlFor='firstName'
                    className='mb-1.5 block text-sm font-medium text-gray-700'
                  >
                    First Name <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    id='firstName'
                    value={firstName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setFirstName(e.target.value);
                      if (errors.firstName)
                        setErrors({ ...errors, firstName: '' });
                    }}
                    placeholder='John'
                    className={getInputClass(!!errors.firstName)}
                  />
                  {errors.firstName && (
                    <p className='mt-1 text-sm text-red-500'>
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor='lastName'
                    className='mb-1.5 block text-sm font-medium text-gray-700'
                  >
                    Last Name <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    id='lastName'
                    value={lastName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setLastName(e.target.value);
                      if (errors.lastName)
                        setErrors({ ...errors, lastName: '' });
                    }}
                    placeholder='Doe'
                    className={getInputClass(!!errors.lastName)}
                  />
                  {errors.lastName && (
                    <p className='mt-1 text-sm text-red-500'>
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor='email'
                  className='mb-1.5 block text-sm font-medium text-gray-700'
                >
                  Email Address <span className='text-red-500'>*</span>
                </label>
                <input
                  type='email'
                  id='email'
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                  placeholder='john.doe@company.com'
                  className={getInputClass(!!errors.email)}
                />
                {errors.email && (
                  <p className='mt-1 text-sm text-red-500'>{errors.email}</p>
                )}
              </div>

              {/* Idea Title */}
              <div>
                <div className='mb-1.5 flex items-center justify-between'>
                  <label
                    htmlFor='title'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Idea Title <span className='text-red-500'>*</span>
                  </label>
                  <span
                    className={cn(
                      'text-xs',
                      title.length > MAX_LENGTHS.title
                        ? 'text-red-500'
                        : 'text-gray-400',
                    )}
                  >
                    {title.length}/{MAX_LENGTHS.title}
                  </span>
                </div>
                <input
                  type='text'
                  id='title'
                  value={title}
                  maxLength={MAX_LENGTHS.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setTitle(e.target.value);
                    if (errors.title) setErrors({ ...errors, title: '' });
                  }}
                  placeholder='Give your idea a clear, descriptive title'
                  className={getInputClass(!!errors.title)}
                />
                {errors.title && (
                  <p className='mt-1 text-sm text-red-500'>{errors.title}</p>
                )}
              </div>

              {/* Idea Description */}
              <div>
                <div className='mb-1.5 flex items-center justify-between'>
                  <label
                    htmlFor='ideaDescription'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Idea Description <span className='text-red-500'>*</span>
                  </label>
                  <span
                    className={cn(
                      'text-xs',
                      ideaDescription.length > MAX_LENGTHS.ideaDescription
                        ? 'text-red-500'
                        : 'text-gray-400',
                    )}
                  >
                    {ideaDescription.length}/{MAX_LENGTHS.ideaDescription}
                  </span>
                </div>
                <textarea
                  id='ideaDescription'
                  value={ideaDescription}
                  maxLength={MAX_LENGTHS.ideaDescription}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                    setIdeaDescription(e.target.value);
                    if (errors.ideaDescription)
                      setErrors({ ...errors, ideaDescription: '' });
                  }}
                  placeholder='Describe your idea in detail. Include how it would work, what technologies or processes it involves, who would use it, and any other relevant information that helps us understand your vision.'
                  rows={4}
                  className={cn(
                    getInputClass(!!errors.ideaDescription),
                    'resize-none',
                  )}
                />
                {errors.ideaDescription && (
                  <p className='mt-1 text-sm text-red-500'>
                    {errors.ideaDescription}
                  </p>
                )}
              </div>

              {/* What Problem Does It Solve */}
              <div>
                <div className='mb-1.5 flex items-center justify-between'>
                  <label
                    htmlFor='problemStatement'
                    className='block text-sm font-medium text-gray-700'
                  >
                    What Problem Does It Solve?{' '}
                    <span className='text-red-500'>*</span>
                  </label>
                  <span
                    className={cn(
                      'text-xs',
                      problemStatement.length > MAX_LENGTHS.problemStatement
                        ? 'text-red-500'
                        : 'text-gray-400',
                    )}
                  >
                    {problemStatement.length}/{MAX_LENGTHS.problemStatement}
                  </span>
                </div>
                <textarea
                  id='problemStatement'
                  value={problemStatement}
                  maxLength={MAX_LENGTHS.problemStatement}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                    setProblemStatement(e.target.value);
                    if (errors.problemStatement)
                      setErrors({ ...errors, problemStatement: '' });
                  }}
                  placeholder='Explain the problem or challenge this idea addresses. What pain points does it solve?'
                  rows={3}
                  className={cn(
                    getInputClass(!!errors.problemStatement),
                    'resize-none',
                  )}
                />
                {errors.problemStatement && (
                  <p className='mt-1 text-sm text-red-500'>
                    {errors.problemStatement}
                  </p>
                )}
              </div>

              {/* Expected Impact */}
              <div>
                <div className='mb-1.5 flex items-center justify-between'>
                  <label
                    htmlFor='expectedImpact'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Expected Impact{' '}
                    <span className='text-gray-400'>(Optional)</span>
                  </label>
                  <span
                    className={cn(
                      'text-xs',
                      expectedImpact.length > MAX_LENGTHS.expectedImpact
                        ? 'text-red-500'
                        : 'text-gray-400',
                    )}
                  >
                    {expectedImpact.length}/{MAX_LENGTHS.expectedImpact}
                  </span>
                </div>
                <textarea
                  id='expectedImpact'
                  value={expectedImpact}
                  maxLength={MAX_LENGTHS.expectedImpact}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                    setExpectedImpact(e.target.value);
                    if (errors.expectedImpact)
                      setErrors({ ...errors, expectedImpact: '' });
                  }}
                  placeholder='What impact would launching this idea have? Consider benefits like cost savings, efficiency gains, revenue growth, or customer satisfaction.'
                  rows={3}
                  className={cn(
                    getInputClass(!!errors.expectedImpact),
                    'resize-none',
                  )}
                />
                {errors.expectedImpact && (
                  <p className='mt-1 text-sm text-red-500'>
                    {errors.expectedImpact}
                  </p>
                )}
              </div>

              {/* Honeypot field - hidden from users to detect bots */}
              <input
                type='text'
                name='website'
                value={website}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setWebsite(e.target.value)
                }
                tabIndex={-1}
                autoComplete='off'
                style={{
                  position: 'absolute',
                  left: '-9999px',
                  width: '1px',
                  height: '1px',
                }}
                aria-hidden='true'
              />

              {/* Password (if required) */}
              {requiresPassword && (
                <div>
                  <label
                    htmlFor='password'
                    className='mb-1.5 block text-sm font-medium text-gray-700'
                  >
                    <div className='flex items-center gap-1.5'>
                      <Lock className='h-4 w-4' />
                      Password <span className='text-red-500'>*</span>
                    </div>
                  </label>
                  <div className='relative'>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id='password'
                      value={password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setPassword(e.target.value);
                        if (errors.password)
                          setErrors({ ...errors, password: '' });
                      }}
                      placeholder='Enter the submission password'
                      className={cn(getInputClass(!!errors.password), 'pr-10')}
                    />
                    <motion.button
                      type='button'
                      onClick={() => setShowPassword(!showPassword)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
                    >
                      <AnimatePresence mode='wait'>
                        {showPassword ? (
                          <motion.div
                            key='eye-off'
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                            transition={{ duration: 0.2 }}
                          >
                            <EyeOff className='h-5 w-5' />
                          </motion.div>
                        ) : (
                          <motion.div
                            key='eye'
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Eye className='h-5 w-5' />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </div>
                  {errors.password && (
                    <p className='mt-1 text-sm text-red-500'>
                      {errors.password}
                    </p>
                  )}
                </div>
              )}

              {/* Cloudflare Turnstile CAPTCHA */}
              <div className='flex flex-col items-center'>
                <Turnstile
                  siteKey={
                    import.meta.env.VITE_TURNSTILE_SITE_KEY ||
                    '1x00000000000000000000AA' // Test key - always passes (dev only)
                  }
                  onSuccess={(token: string) => {
                    setCaptchaToken(token);
                    if (errors.captcha) setErrors({ ...errors, captcha: '' });
                  }}
                  onError={() => {
                    setCaptchaToken('');
                    setErrors({
                      ...errors,
                      captcha: 'Security check failed. Please try again.',
                    });
                  }}
                  onExpire={() => {
                    setCaptchaToken('');
                    setErrors({
                      ...errors,
                      captcha: 'Security check expired. Please verify again.',
                    });
                  }}
                  options={{ theme: 'light', size: 'normal' }}
                />
                {errors.captcha && (
                  <p className='mt-2 text-sm text-red-500'>{errors.captcha}</p>
                )}
              </div>

              {/* Submit Button */}
              <motion.button
                type='submit'
                disabled={isSubmitting || !captchaToken}
                whileHover={{ scale: isSubmitting || !captchaToken ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting || !captchaToken ? 1 : 0.98 }}
                transition={{ duration: 0.2 }}
                className='flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-6 py-3.5 font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50'
              >
                <AnimatePresence mode='wait'>
                  {isSubmitting ? (
                    <motion.div
                      key='submitting'
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className='flex items-center gap-2'
                    >
                      <Loader2 className='h-5 w-5 animate-spin' />
                      Submitting...
                    </motion.div>
                  ) : (
                    <motion.div
                      key='submit'
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className='flex items-center gap-2'
                    >
                      <Send className='h-5 w-5' />
                      Submit Idea
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Error message */}
              <AnimatePresence>
                {isError && !errors.password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className='rounded-lg border border-red-200 bg-red-50 p-4'
                  >
                    <p className='text-center text-sm text-red-600'>
                      {errorMessage ||
                        'Something went wrong. Please try again.'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
        </div>
      </div>
    );
  },
);
