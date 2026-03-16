import { toast } from '@components';
import LiquidGlassModal from '@components/ui/LiquidGlassModal';
import {
  useConceptShares,
  useCreateShare,
  useRevokeShare,
  useShareConfig,
} from '@hooks/query/conceptShares.hook';
import { cn } from '@libs/utils/react';
import { Building2, Link2, Share2, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

function formatRelativeDateMessage(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return `expired ${Math.abs(diffDays)} days ago`;
  if (diffDays === 0) return 'expires today';
  if (diffDays === 1) return 'expires in 1 day';
  return `expires in ${diffDays} days`;
}

function extractEmailDomain(email: string): string {
  const parts = email.split('@');
  return parts.length === 2 ? parts[1].toLowerCase() : '';
}

function getEmailInitials(email: string): string {
  const local = email.split('@')[0] ?? '';
  const parts = local.split(/[._-]/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return local.slice(0, 2).toUpperCase();
}

interface ShareReportDialogProps {
  conceptIdentifier: string | undefined;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function ShareReportDialog({
  conceptIdentifier,
  open: controlledOpen,
  onOpenChange,
}: ShareReportDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [email, setEmail] = useState('');

  const identifier = conceptIdentifier ?? '';
  const { data: shares, isLoading } = useConceptShares(identifier);
  const { data: shareConfig } = useShareConfig(identifier);
  const createShare = useCreateShare(identifier);
  const revokeShare = useRevokeShare(identifier);

  const allowedDomains = useMemo(() => {
    if (!shareConfig) return [];
    const domains = new Set<string>();
    domains.add(shareConfig.accountDomain);
    domains.add(shareConfig.senderDomain);
    shareConfig.allowedDomains.forEach((d) => domains.add(d));
    return Array.from(domains);
  }, [shareConfig]);

  const domainError = useMemo(() => {
    if (!email.includes('@') || !shareConfig) return null;
    const emailDomain = extractEmailDomain(email);
    if (!emailDomain) return null;
    const isAllowed = allowedDomains.some(
      (d) => emailDomain === d || emailDomain.endsWith(`.${d}`),
    );
    if (!isAllowed) {
      return `Email must be from ${allowedDomains.join(' or ')}`;
    }
    return null;
  }, [email, shareConfig, allowedDomains]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    if (domainError) {
      toast.error('Invalid domain', domainError);
      return;
    }

    createShare.mutate(
      { recipientEmail: email.trim() },
      {
        onSuccess: () => {
          setEmail('');
        },
      },
    );
  };

  const handleRevoke = (shareUuid: string) => {
    revokeShare.mutate(shareUuid);
  };

  const handleCopyLink = useCallback((token: string) => {
    const url = `${window.location.origin}/shared-report/${token}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Link Copied', 'Link copied to clipboard');
    });
  }, []);

  const activeShares = shares?.filter((s) => s.status === 'active') ?? [];
  const revokedShares = shares?.filter((s) => s.status === 'revoked') ?? [];

  return (
    <>
      {controlledOpen === undefined && (
        <button
          onClick={() => setOpen(true)}
          className='aucctus-border-primary aucctus-text-primary aucctus-bg-primary-hover flex items-center gap-2 rounded-lg border px-4 py-2 transition-colors'
          aria-label='Share Report'
        >
          <Share2 className='h-4 w-4' />
          Share
        </button>
      )}
      <LiquidGlassModal
        open={open}
        onOpenChange={setOpen}
        size='md'
        title='Share This Concept'
        headerClassName='p-5 pb-3'
      >
        {/* Invite input section */}
        <div className='p-5'>
          <form onSubmit={handleSubmit} className='flex items-start gap-2'>
            <div className='min-w-0 flex-1'>
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  shareConfig
                    ? `colleague@${shareConfig.accountDomain}`
                    : 'Email address'
                }
                className={cn(
                  'aucctus-text-sm aucctus-bg-secondary aucctus-text-primary h-9 w-full rounded-md border px-3 focus:outline-none focus:ring-2',
                  domainError
                    ? 'border-red-500 focus:ring-red-500'
                    : 'aucctus-border-primary focus:ring-primary-500',
                )}
                required
              />
            </div>
            <button
              type='submit'
              disabled={createShare.isLoading || !email.trim() || !!domainError}
              className={cn(
                'btn btn-primary btn-sm h-9 flex-shrink-0 px-4',
                (createShare.isLoading || !!domainError) && 'opacity-50',
              )}
            >
              {createShare.isLoading ? 'Sending...' : 'Invite'}
            </button>
          </form>
          {domainError && (
            <p className='mt-2 text-[11px] text-red-500'>{domainError}</p>
          )}
          {!domainError && shareConfig && (
            <p className='aucctus-text-secondary mt-2 flex items-center gap-1 text-[11px]'>
              <Building2 className='h-3 w-3' />
              Only @{shareConfig.accountDomain} emails are allowed
            </p>
          )}
        </div>

        {/* People list */}
        <div className='aucctus-border-primary border-t'>
          <div className='max-h-[280px] space-y-1 overflow-y-auto px-5 py-3'>
            {isLoading ? (
              <div className='aucctus-text-secondary py-4 text-center text-sm'>
                Loading...
              </div>
            ) : (
              <>
                {activeShares.map((share) => (
                  <div
                    key={share.uuid}
                    className='aucctus-bg-primary-hover -mx-1 flex items-center gap-3 rounded-md px-1 py-2 transition-colors'
                  >
                    <span className='aucctus-bg-secondary aucctus-text-secondary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium'>
                      {getEmailInitials(share.recipientEmail)}
                    </span>
                    <div className='min-w-0 flex-1'>
                      <div className='aucctus-text-primary flex items-center gap-2 truncate text-sm font-medium'>
                        {share.recipientEmail.split('@')[0]}
                        {share.accessCount > 0 && (
                          <span className='aucctus-bg-secondary aucctus-text-secondary inline-flex h-4 items-center rounded-full px-1.5 text-[10px] font-normal'>
                            {share.accessCount} view
                            {share.accessCount !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <div className='aucctus-text-secondary truncate text-xs'>
                        {share.recipientEmail}
                        {' · '}
                        {formatRelativeDateMessage(share.expiresAt)}
                      </div>
                    </div>
                    <div className='flex flex-shrink-0 items-center gap-0.5'>
                      {share.token && (
                        <button
                          onClick={() => handleCopyLink(share.token!)}
                          className='aucctus-text-secondary aucctus-bg-primary-hover rounded-md p-1.5 transition-colors'
                          title='Copy link'
                          aria-label={`Copy share link for ${share.recipientEmail}`}
                        >
                          <Link2 className='h-3.5 w-3.5' />
                        </button>
                      )}
                      <button
                        onClick={() => handleRevoke(share.uuid)}
                        disabled={revokeShare.isLoading}
                        className='rounded-md p-1.5 text-red-500/70 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20'
                        aria-label={`Revoke access for ${share.recipientEmail}`}
                      >
                        <Trash2 className='h-3.5 w-3.5' />
                      </button>
                    </div>
                  </div>
                ))}

                {revokedShares.map((share) => (
                  <div
                    key={share.uuid}
                    className='-mx-1 flex items-center gap-3 rounded-md px-1 py-2 opacity-40'
                  >
                    <span className='aucctus-bg-secondary aucctus-text-secondary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium'>
                      {getEmailInitials(share.recipientEmail)}
                    </span>
                    <div className='min-w-0 flex-1'>
                      <div className='aucctus-text-secondary truncate text-sm line-through'>
                        {share.recipientEmail.split('@')[0]}
                      </div>
                      <div className='aucctus-text-secondary truncate text-xs'>
                        {share.recipientEmail}
                      </div>
                    </div>
                  </div>
                ))}

                {shares?.length === 0 && (
                  <div className='aucctus-text-secondary py-6 text-center text-sm'>
                    No shares yet. Invite a colleague to get started.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </LiquidGlassModal>
    </>
  );
}
