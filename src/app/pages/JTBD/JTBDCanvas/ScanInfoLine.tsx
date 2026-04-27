import type { IJTBDJob, IJTBDScan } from '@libs/api/types/jtbd';
import { Calendar, GitMerge } from 'lucide-react';
import React from 'react';

export const formatScanDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffHours < 1) return 'just now';
  if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
  if (diffDays < 7) return `${Math.floor(diffDays)}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const pluralize = (n: number, word: string): string =>
  `${n} ${word}${n !== 1 ? 's' : ''}`;

const ScanInfoLine: React.FC<{
  scans: IJTBDScan[];
  jobs: IJTBDJob[];
}> = ({ scans, jobs }) => {
  const currentScan = scans.find((s) => s.isCurrent);
  if (!currentScan) return null;

  const total = jobs.length;
  const mergedCount = jobs.filter((j) => j.mergedFromScanUuid).length;
  const newCount = total - mergedCount;

  const countLabel =
    total === 0
      ? 'no jobs on canvas'
      : mergedCount === 0
        ? `${pluralize(total, 'job')} discovered`
        : newCount === 0
          ? `${pluralize(total, 'job')} merged from prior scan`
          : `${newCount} new · ${mergedCount} merged from prior scan`;

  return (
    <div className='flex items-center gap-3 text-[11px] text-white/40'>
      <div className='flex items-center gap-1.5'>
        <Calendar className='h-3 w-3' />
        <span>Scanned {formatScanDate(currentScan.scannedAt)}</span>
      </div>
      <span className='text-white/20'>·</span>
      <div className='flex items-center gap-1.5'>
        {mergedCount > 0 && <GitMerge className='h-3 w-3' />}
        <span>{countLabel}</span>
      </div>
    </div>
  );
};

export default ScanInfoLine;
