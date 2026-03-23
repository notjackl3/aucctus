import { cn } from '@libs/utils/react';
import { motion } from 'framer-motion';
import { FileText, Paperclip, Sparkles, X } from 'lucide-react';
import React, { useRef } from 'react';

interface DescribeStepProps {
  description: string;
  onDescriptionChange: (value: string) => void;
  attachedFiles: File[];
  onFileAdd: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileRemove: (index: number) => void;
  onSubmit: () => void;
  isDisabled: boolean;
}

const DescribeStep: React.FC<DescribeStepProps> = ({
  description,
  onDescriptionChange,
  attachedFiles,
  onFileAdd,
  onFileRemove,
  onSubmit,
  isDisabled,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <motion.div
      key='describe'
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className='flex flex-col items-center px-8 pb-8 pt-10 text-center'
    >
      {/* Top badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05, duration: 0.4 }}
        className='mb-8 inline-flex items-center gap-1.5'
      >
        <span className='relative flex h-1.5 w-1.5'>
          <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60' />
          <span className='relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400' />
        </span>
        <span className='text-[10px] font-medium uppercase tracking-widest text-white/30'>
          New Watchtower
        </span>
      </motion.div>

      {/* Animated scanning eye */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.08, duration: 0.4 }}
        className='relative mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.05]'
      >
        <svg
          width='28'
          height='28'
          viewBox='0 0 24 24'
          fill='none'
          className='overflow-visible text-white/50'
        >
          <path
            d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z'
            stroke='currentColor'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
          <motion.circle
            r='3.5'
            fill='none'
            stroke='currentColor'
            strokeWidth='0.8'
            strokeOpacity='0.4'
            animate={{
              cx: [12, 13.8, 13.2, 11, 10.2, 11.5, 12, 14.2, 13, 12],
              cy: [12, 11.2, 12.3, 12.8, 11.5, 10.8, 11.5, 11.8, 12.5, 12],
              r: [3.5, 3.8, 3.2, 3.6, 3.0, 3.4, 3.5, 3.8, 3.3, 3.5],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.circle
            fill='currentColor'
            animate={{
              cx: [12, 13.8, 13.2, 11, 10.2, 11.5, 12, 14.2, 13, 12],
              cy: [12, 11.2, 12.3, 12.8, 11.5, 10.8, 11.5, 11.8, 12.5, 12],
              r: [2.2, 2.8, 2.0, 2.6, 1.6, 2.4, 2.0, 2.8, 1.8, 2.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </svg>
      </motion.div>

      {/* Heading */}
      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className='mb-2 text-[28px] font-bold leading-tight tracking-tight text-white'
      >
        Deploy Watchers to
        <br />
        Put Signals Under Surveillance
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.4 }}
        className='mb-8 max-w-[360px] text-sm text-white/40'
      >
        Describe signals, activity, or conditions you want to track. Your
        watchers will surveil and report back.
      </motion.p>

      {/* Input area */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className='w-full space-y-3'
      >
        <textarea
          placeholder='Monitor competitor patent filings in biodegradable packaging...'
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className={cn(
            'min-h-[100px] w-full resize-none rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white transition-all',
            'placeholder:text-white/20 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10',
          )}
          autoFocus
        />

        {/* Attached files */}
        {attachedFiles.length > 0 && (
          <div className='flex flex-wrap gap-2'>
            {attachedFiles.map((file, i) => (
              <div
                key={`${file.name}-${file.size}-${file.lastModified}`}
                className='inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.06] px-2.5 py-1 text-xs text-white/60'
              >
                <FileText size={12} />
                <span className='max-w-[120px] truncate'>{file.name}</span>
                <button
                  onClick={() => onFileRemove(i)}
                  className='text-white/30 transition-colors hover:text-white/60'
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Actions row */}
        <div className='flex items-center justify-between'>
          <div>
            <input
              ref={fileInputRef}
              type='file'
              multiple
              accept='.pdf,.doc,.docx,.txt,.csv,.xlsx'
              onChange={onFileAdd}
              className='hidden'
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className='inline-flex items-center gap-1.5 rounded-lg border border-transparent px-3 py-1.5 text-xs text-white/40 transition-all hover:border-white/[0.08] hover:bg-white/[0.04] hover:text-white/70'
            >
              <Paperclip size={14} />
              Attach documents
            </button>
          </div>

          <button
            onClick={onSubmit}
            disabled={isDisabled}
            className='inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-black transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-30'
          >
            <Sparkles size={14} />
            Deploy Watchers
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DescribeStep;
