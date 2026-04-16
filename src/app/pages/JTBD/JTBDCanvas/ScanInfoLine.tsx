import type { IJTBDScan } from '@libs/api/types/jtbd';
import { Calendar } from 'lucide-react';
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

const ScanInfoLine: React.FC<{
  scans: IJTBDScan[];
  jobCount: number;
}> = ({ scans, jobCount }) => {
  const currentScan = scans.find((s) => s.isCurrent);
  if (!currentScan) return null;

  return (
    <div className='flex items-center gap-3 text-[11px] text-white/40'>
      <div className='flex items-center gap-1.5'>
        <Calendar className='h-3 w-3' />
        <span>Scanned {formatScanDate(currentScan.scannedAt)}</span>
      </div>
      <span className='text-white/20'>·</span>
      <span>
        {jobCount} job{jobCount !== 1 ? 's' : ''} discovered
      </span>
    </div>
  );
};

export default ScanInfoLine;
