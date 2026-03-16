import { Loading } from '@components';
import type { ConceptTab } from '@components/ConceptReport/ConceptNavigation';
import ConceptNavigation from '@components/ConceptReport/ConceptNavigation';
import {
  useSendVerificationCode,
  useShareInfo,
  useSharedReport,
  useVerifyCode,
} from '@hooks/query/sharedReport.hook';
import images from '@assets/img';
import type { ISharedReport } from '@libs/api/types/sharedReport';
import { fireConfetti } from '@libs/utils/confetti';
import { cn } from '@libs/utils/react';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import AssumptionsWrapper from '@pages/Concept/Report/AssumptionsWrapper';
import CustomerProfile from '@pages/Concept/Report/CustomerProfile/CustomerProfile';
import EcosystemWrapper from '@pages/Concept/Report/EcosystemWrapper';
import FinancialProjectionsWrapper from '@pages/Concept/Report/FinancialProjectionsWrapper';
import OverviewWrapper from '@pages/Concept/Report/OverviewWrapper';
import Testing from '@pages/Concept/Report/Testing/Testing';
import TrendsWrapper from '@pages/Concept/Report/TrendsWrapper';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  BarChart3,
  BookOpen,
  CheckCircle,
  DollarSign,
  Eye,
  FlaskConical,
  Globe,
  Lock,
  Mail,
  Shield,
  TrendingUp,
  Users,
} from 'lucide-react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useParams } from 'react-router-dom';
import SharedReportProvider from './SharedReportProvider';

type Phase = 'info' | 'verification' | 'report';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '';

export default function SharedReportPage() {
  const { token } = useParams<{ token: string }>();
  const [phase, setPhase] = useState<Phase>('info');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [error, setError] = useState('');
  const turnstileRef = useRef<TurnstileInstance>(null);

  const {
    data: shareInfo,
    isLoading: infoLoading,
    isError: infoError,
  } = useShareInfo(token ?? '');
  const sendCode = useSendVerificationCode(token ?? '');
  const verifyCode = useVerifyCode(token ?? '');
  const { data: report, isLoading: reportLoading } = useSharedReport(
    token ?? '',
    isVerified,
  );

  useEffect(() => {
    if (report) {
      fireConfetti();
    }
  }, [report]);

  const handleSendCode = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      if (TURNSTILE_SITE_KEY && !captchaToken) {
        setError('Please complete the CAPTCHA verification');
        return;
      }

      sendCode.mutate(
        {
          email: email.trim(),
          captchaToken: captchaToken || 'dev-bypass',
          website: '',
        },
        {
          onSuccess: () => {
            setPhase('verification');
          },
          onError: (err: unknown) => {
            const message = (
              err as { response?: { data?: { detail?: string } } }
            )?.response?.data?.detail;
            setError(message ?? 'Failed to send verification code');
            turnstileRef.current?.reset();
            setCaptchaToken('');
          },
        },
      );
    },
    [email, captchaToken, sendCode],
  );

  const handleVerifyCode = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      verifyCode.mutate(
        { email: email.trim(), code: code.trim() },
        {
          onSuccess: () => {
            setIsVerified(true);
            setPhase('report');
          },
          onError: (err: unknown) => {
            const message = (
              err as { response?: { data?: { detail?: string } } }
            )?.response?.data?.detail;
            setError(message ?? 'Invalid or expired verification code');
          },
        },
      );
    },
    [email, code, verifyCode],
  );

  // Loading state
  if (infoLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <Loading />
      </div>
    );
  }

  // Not found / expired
  if (infoError || !shareInfo) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='max-w-md rounded-xl bg-white p-8 text-center shadow-lg'>
          <AlertCircle className='mx-auto mb-4 h-12 w-12 text-red-500' />
          <h1 className='mb-2 text-xl font-bold text-gray-900'>
            Share Link Not Found
          </h1>
          <p className='text-gray-600'>
            This share link may have expired or been revoked. Please contact the
            person who shared this report with you.
          </p>
        </div>
      </div>
    );
  }

  // Info phase - enter email
  if (phase === 'info') {
    return (
      <div className='aucctus-bg-primary flex min-h-screen items-center justify-center p-4'>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className='w-full max-w-[500px]'
        >
          <div className='liquid-glass-modal-shell'>
            <div
              className='liquid-glass-modal-rim liquid-glass-modal-rim-animated'
              aria-hidden='true'
            >
              <div className='rim-orb rim-orb-1' />
              <div className='rim-orb rim-orb-2' />
            </div>
            <div className='liquid-glass-modal-surface'>
              <div className='relative z-10 p-8 text-center'>
                {/* Icon with lock badge */}
                <div className='relative mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-600/10'>
                  <Mail className='h-7 w-7 text-gray-600' />
                  <div className='aucctus-bg-secondary absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white'>
                    <Lock className='aucctus-stroke-secondary h-2.5 w-2.5' />
                  </div>
                </div>

                <h2 className='aucctus-text-primary mb-2 text-xl font-semibold'>
                  Enter Your Email To Confirm Access
                </h2>
                <p className='aucctus-text-secondary mb-6 text-sm'>
                  Enter your email address to verify your access to this shared
                  concept report.
                </p>

                <form onSubmit={handleSendCode} className='space-y-3'>
                  <input
                    id='email'
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={`you@${shareInfo.requiredEmailDomain}`}
                    className='aucctus-bg-primary aucctus-text-primary aucctus-border-primary h-11 w-full rounded-md border px-3 py-2 text-center text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
                    required
                  />

                  {TURNSTILE_SITE_KEY && (
                    <div className='flex justify-center'>
                      <Turnstile
                        ref={turnstileRef}
                        siteKey={TURNSTILE_SITE_KEY}
                        onSuccess={(token: string) => setCaptchaToken(token)}
                        onExpire={() => setCaptchaToken('')}
                      />
                    </div>
                  )}

                  {error && (
                    <div className='rounded-lg bg-red-50 p-3 text-sm text-red-600'>
                      {error}
                    </div>
                  )}

                  <motion.button
                    type='submit'
                    disabled={sendCode.isLoading || !email.trim()}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      'btn btn-primary btn-md h-11 w-full',
                      (sendCode.isLoading || !email.trim()) &&
                        'cursor-not-allowed opacity-50',
                    )}
                  >
                    {sendCode.isLoading ? 'Sending...' : 'Continue'}
                  </motion.button>
                </form>

                <p className='aucctus-text-secondary mt-4 text-[11px]'>
                  Only authorized team members can view this concept
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Verification phase - enter code
  if (phase === 'verification') {
    return (
      <div className='aucctus-bg-primary flex min-h-screen items-center justify-center p-4'>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className='w-full max-w-[400px]'
        >
          <div className='liquid-glass-modal-shell'>
            <div
              className='liquid-glass-modal-rim liquid-glass-modal-rim-animated'
              aria-hidden='true'
            >
              <div className='rim-orb rim-orb-1' />
              <div className='rim-orb rim-orb-2' />
            </div>
            <div className='liquid-glass-modal-surface'>
              <div className='relative z-10 p-8 text-center'>
                {/* Icon with check badge */}
                <div className='relative mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-600/10'>
                  <Shield className='h-7 w-7 text-gray-600' />
                  <div className='aucctus-bg-secondary absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white'>
                    <CheckCircle className='h-2.5 w-2.5 text-green-600' />
                  </div>
                </div>

                <h2 className='aucctus-text-primary mb-2 text-xl font-semibold'>
                  Check Your Email
                </h2>
                <p className='aucctus-text-secondary mb-6 text-sm'>
                  We sent a 6-digit code to <strong>{email}</strong>
                </p>

                <form onSubmit={handleVerifyCode} className='space-y-3'>
                  <input
                    id='code'
                    type='text'
                    value={code}
                    onChange={(e) =>
                      setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                    }
                    placeholder='000000'
                    className='aucctus-bg-primary aucctus-text-primary aucctus-border-primary h-11 w-full rounded-md border px-4 py-2.5 text-center font-mono text-2xl tracking-[0.5em] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
                    maxLength={6}
                    required
                  />

                  {error && (
                    <div className='rounded-lg bg-red-50 p-3 text-sm text-red-600'>
                      {error}
                    </div>
                  )}

                  <motion.button
                    type='submit'
                    disabled={verifyCode.isLoading || code.length !== 6}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      'btn btn-primary btn-md h-11 w-full',
                      (verifyCode.isLoading || code.length !== 6) &&
                        'cursor-not-allowed opacity-50',
                    )}
                  >
                    {verifyCode.isLoading ? 'Verifying...' : 'Verify Code'}
                  </motion.button>

                  <motion.button
                    type='button'
                    onClick={() => {
                      setPhase('info');
                      setCode('');
                      setError('');
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className='aucctus-text-secondary mt-1 w-full text-center text-sm transition-colors hover:text-gray-700'
                  >
                    Use a different email
                  </motion.button>
                </form>

                <p className='aucctus-text-secondary mt-4 text-[11px]'>
                  Only authorized team members can view this concept
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Report phase - display read-only report
  if (reportLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <Loading />
      </div>
    );
  }

  if (!report) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='max-w-md rounded-xl bg-white p-8 text-center shadow-lg'>
          <AlertCircle className='mx-auto mb-4 h-12 w-12 text-red-500' />
          <h1 className='mb-2 text-xl font-bold text-gray-900'>
            Report Not Available
          </h1>
          <p className='text-gray-600'>
            The report data could not be loaded. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return <SharedReportView report={report} email={email} />;
}

/* ------------------------------------------------------------------ */
/*  Full Report View — renders standard report components via cache    */
/*  seeding so the shared report looks identical to the authenticated  */
/*  concept report.                                                    */
/* ------------------------------------------------------------------ */

type SharedTab =
  | 'overview'
  | 'trends'
  | 'ecosystem'
  | 'financial'
  | 'customers'
  | 'assumptions'
  | 'testing';

const SharedReportView: React.FC<{ report: ISharedReport; email: string }> = ({
  report,
  email,
}) => {
  const [activeTab, setActiveTab] = useState<SharedTab>('overview');
  const resolvedImage =
    report.concept.conceptImageUrl || images.aiExplorationsBackground;

  const showTestingTab =
    report.featureVersions?.assumptions === 'v2' &&
    (report.testingTests !== null || report.testingAssumptions !== null);
  const tabs = useMemo(() => {
    const t: ConceptTab[] = [
      { label: 'OVERVIEW', value: 'overview', icon: BarChart3 },
      { label: 'TRENDS', value: 'trends', icon: TrendingUp },
      { label: 'ECOSYSTEM', value: 'ecosystem', icon: Globe },
      { label: 'FINANCIAL', value: 'financial', icon: DollarSign },
      { label: 'CUSTOMERS', value: 'customers', icon: Users },
      { label: 'ASSUMPTIONS', value: 'assumptions', icon: BookOpen },
    ];

    if (showTestingTab) {
      t.push({ label: 'TESTING', value: 'testing', icon: FlaskConical });
    }

    return t;
  }, [showTestingTab]);

  const onTabSelect = useCallback((value: string) => {
    setActiveTab(value as SharedTab);
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewWrapper />;
      case 'trends':
        return <TrendsWrapper />;
      case 'ecosystem':
        return <EcosystemWrapper />;
      case 'financial':
        return <FinancialProjectionsWrapper />;
      case 'customers':
        return <CustomerProfile />;
      case 'assumptions':
        return <AssumptionsWrapper />;
      case 'testing':
        return <Testing />;
      default:
        return null;
    }
  };

  return (
    <SharedReportProvider report={report} onTabChange={onTabSelect}>
      <div className='min-h-screen'>
        {/* Sticky Read-Only Banner */}
        <div
          className='sticky top-0 z-50 px-4 py-1.5'
          style={{
            background: 'rgb(209, 224, 255)',
            color: 'rgb(41, 123, 255)',
          }}
        >
          <div className='mx-auto flex max-w-7xl items-center justify-center gap-3 text-xs'>
            <div className='flex items-center gap-1.5'>
              <Mail className='h-3 w-3' />
              <span className='font-medium'>{email}</span>
            </div>
            <span style={{ opacity: 0.5 }}>&bull;</span>
            <div className='flex items-center gap-1.5'>
              <Eye className='h-3 w-3' />
              <span>View Only</span>
            </div>
          </div>
        </div>

        {/* Hero Banner — matches ConceptHero layout */}
        <div className='mx-auto max-w-[1200px] px-8 pt-6'>
          <div className='aucctus-bg-primary aucctus-border-primary relative flex max-h-[420px] overflow-hidden rounded-xl border shadow-sm'>
            {/* Info side */}
            <div className='relative flex flex-1 flex-col justify-center gap-4 px-8 py-6'>
              <p className='aucctus-text-secondary text-sm'>
                Shared by {report.sharedByName} from {report.accountName}
              </p>
              <h1 className='aucctus-text-brand-primary text-5xl font-extrabold leading-[1.1] tracking-tight'>
                {report.concept.title}
              </h1>
              {report.concept.summary && (
                <p className='aucctus-text-secondary line-clamp-5 leading-relaxed'>
                  {report.concept.summary}
                </p>
              )}
            </div>

            {/* Concept image */}
            <div className='relative w-1/2 flex-shrink-0 p-3 pl-0'>
              <div className='aucctus-bg-secondary h-full w-full overflow-hidden rounded-lg'>
                <img
                  src={resolvedImage}
                  alt={report.concept.title}
                  className='h-full w-full object-cover'
                  loading='eager'
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation + Content */}
        <div className='mx-auto max-w-[1200px] px-8 py-6'>
          <ConceptNavigation
            tabs={tabs}
            activeTab={activeTab}
            onTabSelect={onTabSelect}
          />

          <div className='mt-6'>
            <div key={activeTab} className='animate-fade-in'>
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </SharedReportProvider>
  );
};
