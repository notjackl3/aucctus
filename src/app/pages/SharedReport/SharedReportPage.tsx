import { Loading } from '@components';
import {
  useSendVerificationCode,
  useShareInfo,
  useSharedReport,
  useVerifyCode,
} from '@hooks/query/sharedReport.hook';
import { cn } from '@libs/utils/react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  BarChart3,
  BookOpen,
  CheckCircle,
  DollarSign,
  FlaskConical,
  Globe,
  Lock,
  Mail,
  Shield,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { ISharedReport } from '@libs/api/types/sharedReport';
import ConceptNavigation from '@components/ConceptReport/ConceptNavigation';
import type { ConceptTab } from '@components/ConceptReport/ConceptNavigation';
import SharedReportProvider from './SharedReportProvider';
import OverviewWrapper from '@pages/Concept/Report/OverviewWrapper';
import TrendsWrapper from '@pages/Concept/Report/TrendsWrapper';
import EcosystemWrapper from '@pages/Concept/Report/EcosystemWrapper';
import FinancialProjectionsWrapper from '@pages/Concept/Report/FinancialProjectionsWrapper';
import CustomerProfile from '@pages/Concept/Report/CustomerProfile/CustomerProfile';
import AssumptionsWrapper from '@pages/Concept/Report/AssumptionsWrapper';
import Testing from '@pages/Concept/Report/Testing/Testing';

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
      <div className='flex min-h-screen items-center justify-center bg-gray-50 p-4'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='w-full max-w-md rounded-xl bg-white p-8 shadow-lg'
        >
          <div className='mb-6 text-center'>
            <Shield className='mx-auto mb-3 h-10 w-10 text-red-600' />
            <h1 className='mb-1 text-xl font-bold text-gray-900'>
              {shareInfo.conceptTitle}
            </h1>
            <p className='text-sm text-gray-500'>
              Shared by {shareInfo.accountName}
            </p>
          </div>

          <div className='mb-6 rounded-lg bg-gray-50 p-4'>
            <div className='flex items-start gap-3'>
              <Lock className='mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400' />
              <p className='text-sm text-gray-600'>
                This report is restricted to{' '}
                <strong>@{shareInfo.requiredEmailDomain}</strong> email
                addresses. Enter your email to receive a verification code.
              </p>
            </div>
          </div>

          <form onSubmit={handleSendCode}>
            <div className='mb-4'>
              <label
                htmlFor='email'
                className='mb-1.5 block text-sm font-medium text-gray-700'
              >
                Email address
              </label>
              <div className='relative'>
                <Mail className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
                <input
                  id='email'
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={`you@${shareInfo.requiredEmailDomain}`}
                  className='w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500'
                  required
                />
              </div>
            </div>

            {TURNSTILE_SITE_KEY && (
              <div className='mb-4 flex justify-center'>
                <Turnstile
                  ref={turnstileRef}
                  siteKey={TURNSTILE_SITE_KEY}
                  onSuccess={(token: string) => setCaptchaToken(token)}
                  onExpire={() => setCaptchaToken('')}
                />
              </div>
            )}

            {error && (
              <div className='mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600'>
                {error}
              </div>
            )}

            <button
              type='submit'
              disabled={sendCode.isLoading || !email.trim()}
              className={cn(
                'w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700',
                (sendCode.isLoading || !email.trim()) &&
                  'cursor-not-allowed opacity-50',
              )}
            >
              {sendCode.isLoading ? 'Sending...' : 'Send Verification Code'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // Verification phase - enter code
  if (phase === 'verification') {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50 p-4'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='w-full max-w-md rounded-xl bg-white p-8 shadow-lg'
        >
          <div className='mb-6 text-center'>
            <Mail className='mx-auto mb-3 h-10 w-10 text-red-600' />
            <h1 className='mb-1 text-xl font-bold text-gray-900'>
              Check your email
            </h1>
            <p className='text-sm text-gray-500'>
              We sent a 6-digit code to <strong>{email}</strong>
            </p>
          </div>

          <form onSubmit={handleVerifyCode}>
            <div className='mb-4'>
              <label
                htmlFor='code'
                className='mb-1.5 block text-sm font-medium text-gray-700'
              >
                Verification code
              </label>
              <input
                id='code'
                type='text'
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                }
                placeholder='000000'
                className='w-full rounded-lg border border-gray-300 px-4 py-2.5 text-center font-mono text-2xl tracking-[0.5em] focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500'
                maxLength={6}
                required
              />
            </div>

            {error && (
              <div className='mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600'>
                {error}
              </div>
            )}

            <button
              type='submit'
              disabled={verifyCode.isLoading || code.length !== 6}
              className={cn(
                'w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700',
                (verifyCode.isLoading || code.length !== 6) &&
                  'cursor-not-allowed opacity-50',
              )}
            >
              {verifyCode.isLoading ? 'Verifying...' : 'Verify Code'}
            </button>

            <button
              type='button'
              onClick={() => {
                setPhase('info');
                setCode('');
                setError('');
              }}
              className='mt-3 w-full text-center text-sm text-gray-500 hover:text-gray-700'
            >
              Use a different email
            </button>
          </form>
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

  return <SharedReportView report={report} />;
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

const SharedReportView: React.FC<{ report: ISharedReport }> = ({ report }) => {
  const [activeTab, setActiveTab] = useState<SharedTab>('overview');

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
        {/* Header */}
        <div className='aucctus-border-secondary border-b'>
          <div className='mx-auto flex max-w-[1200px] items-center justify-between px-8 py-4'>
            <div>
              <div className='flex items-center gap-2'>
                <CheckCircle className='h-5 w-5 text-green-500' />
                <span className='text-xs font-medium text-green-600'>
                  Verified Access
                </span>
              </div>
              <h1 className='aucctus-text-brand-primary mt-1 text-xl font-bold'>
                {report.concept.title}
              </h1>
              <p className='aucctus-text-secondary text-sm'>
                Shared by {report.sharedByName} from {report.accountName}
              </p>
            </div>
            <div className='aucctus-bg-secondary rounded-lg px-3 py-1.5 text-xs font-medium'>
              Read Only
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
