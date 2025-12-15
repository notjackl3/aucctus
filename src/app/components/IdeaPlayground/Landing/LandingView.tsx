import React, { useRef, useState } from 'react';
import { animated } from 'react-spring';
import { Icon, toast } from '@components';
import { cn } from '@libs/utils/react';
import { getAnimationStyle } from '@components/Card/ConceptGeneration/UserExploration/components/util/animation-keyframes';

/** Maximum file size: 10MB */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** Supported file extensions for Gemini API */
const SUPPORTED_EXTENSIONS = [
  'pdf',
  'docx',
  'txt',
  'html',
  'xlsx',
  'csv',
  'pptx',
  'png',
  'jpg',
  'jpeg',
  'webp',
  'gif',
  'mp3',
  'wav',
  'mp4',
  'mov',
];

interface LandingViewProps {
  inputValue: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onFileChange?: (file: File | null) => void;
  selectedFile?: File | null;
  style?: any;
}

const LandingView: React.FC<LandingViewProps> = ({
  inputValue,
  onInputChange,
  onKeyPress,
  onFileChange,
  selectedFile,
  style,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error(
        `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds maximum allowed size (10MB).`,
      );
      return false;
    }

    // Check file extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !SUPPORTED_EXTENSIONS.includes(extension)) {
      toast.error(
        `File type not supported. Supported types: ${SUPPORTED_EXTENSIONS.join(', ')}`,
      );
      return false;
    }

    return true;
  };

  const handleFileSelect = (file: File | null) => {
    if (file && !validateFile(file)) {
      return;
    }
    onFileChange?.(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileSelect(file);
    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0] || null;
    handleFileSelect(file);
  };

  const handleRemoveFile = () => {
    onFileChange?.(null);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <animated.div
      style={style}
      className='pointer-events-none absolute inset-0 z-20 flex items-center justify-center'
    >
      <div className='relative'>
        <div className='relative z-20 space-y-6 px-6 text-center sm:px-8'>
          <div
            className='space-y-4'
            style={getAnimationStyle('fadeIn', 800, 300)}
          >
            <h1 className='aucctus-header-2xl-bold aucctus-text-white'>
              Idea Playground
            </h1>
            <p className='aucctus-text-xl aucctus-text-white opacity-80'>
              Where curiosity becomes innovation
            </p>
          </div>

          <div
            className='pointer-events-auto mx-auto w-full max-w-lg'
            style={getAnimationStyle('fadeIn', 800, 600)}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div
              className={cn('relative', {
                'rounded-3xl ring-2 ring-white/40': isDragging,
              })}
            >
              <input
                value={inputValue}
                onChange={onInputChange}
                onKeyPress={onKeyPress}
                placeholder='Describe a problem, idea or focus area on your mind'
                className='aucctus-text-md shadow-glass aucctus-text-white w-full rounded-3xl border border-white/20 bg-white/10 py-6 pl-8 pr-24 backdrop-blur-md transition-all duration-300 placeholder:text-white/60 focus:border-white/40 focus:bg-white/20'
              />

              {/* File upload button */}
              <button
                type='button'
                onClick={handleUploadClick}
                className={cn(
                  'absolute right-14 top-1/2 -translate-y-1/2 transform rounded-lg p-1.5 transition-all duration-200',
                  {
                    'opacity-60 hover:bg-white/10 hover:opacity-100':
                      !selectedFile,
                    'bg-white/20 opacity-100': selectedFile,
                  },
                )}
                title={
                  selectedFile
                    ? `${selectedFile.name} (${formatFileSize(selectedFile.size)})`
                    : 'Attach a file (optional)'
                }
              >
                <Icon
                  variant='file-attachment'
                  className='aucctus-stroke-white h-5 w-5'
                />
              </button>

              <Icon
                variant='lightbulb'
                className='aucctus-stroke-white absolute right-6 top-1/2 -translate-y-1/2 transform opacity-60'
                height={24}
                width={24}
              />

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type='file'
                onChange={handleFileInputChange}
                accept={SUPPORTED_EXTENSIONS.map((ext) => `.${ext}`).join(',')}
                className='hidden'
              />
            </div>

            {/* Selected file indicator */}
            {selectedFile && (
              <div
                className='mt-3 flex items-center justify-center gap-2'
                style={getAnimationStyle('fadeIn', 300, 0)}
              >
                <div className='flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-md'>
                  <Icon
                    variant='file'
                    className='aucctus-stroke-white h-4 w-4 opacity-80'
                  />
                  <span className='aucctus-text-sm aucctus-text-white max-w-48 truncate opacity-80'>
                    {selectedFile.name}
                  </span>
                  <span className='aucctus-text-xs aucctus-text-white opacity-60'>
                    ({formatFileSize(selectedFile.size)})
                  </span>
                  <button
                    type='button'
                    onClick={handleRemoveFile}
                    className='ml-1 rounded-full p-0.5 transition-colors hover:bg-white/20'
                    title='Remove file'
                  >
                    <Icon
                      variant='closeX'
                      className='aucctus-stroke-white h-3.5 w-3.5 opacity-80'
                    />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div style={getAnimationStyle('fadeIn', 800, 1500)}>
            <p className='aucctus-text-xl aucctus-text-white opacity-60'>
              Start typing to begin exploring...
            </p>
          </div>
        </div>
      </div>
    </animated.div>
  );
};

export default LandingView;
