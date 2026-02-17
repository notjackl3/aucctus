import React, { useCallback, useRef } from 'react';
import { toast } from '@components';
import { Loader2, Upload } from 'lucide-react';

interface ImageUploadButtonProps {
  conceptUuid: string;
  isCustomActive?: boolean;
  onUploadSuccess?: () => void;
  uploadMutation: {
    mutate: (file: File, options?: { onSuccess?: () => void }) => void;
    isLoading: boolean;
  };
  className?: string;
}

const ImageUploadButton: React.FC<ImageUploadButtonProps> = ({
  isCustomActive = false,
  onUploadSuccess,
  uploadMutation,
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return 'Please select a valid image file (JPEG, PNG, or WebP)';
    }

    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return 'File size must be less than 5MB';
    }

    return null;
  }, []);

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const validationError = validateFile(file);
      if (validationError) {
        toast.error(validationError);
        return;
      }

      uploadMutation.mutate(file, {
        onSuccess: () => {
          // Clear the input value to allow re-uploading the same file
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          onUploadSuccess?.();
        },
      });
    },
    [validateFile, uploadMutation, onUploadSuccess],
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <>
      <input
        ref={fileInputRef}
        type='file'
        accept='image/*'
        onChange={handleFileSelect}
        className='hidden'
        disabled={uploadMutation.isLoading}
      />
      <button
        onClick={handleClick}
        disabled={uploadMutation.isLoading}
        className={`aucctus-bg-primary-hover aucctus-border-secondary aucctus-text-primary group flex items-center gap-2 rounded-lg border px-3 py-2 shadow-sm transition-all duration-200 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        aria-label={
          isCustomActive ? 'Replace custom image' : 'Upload custom image'
        }
      >
        {uploadMutation.isLoading ? (
          <>
            <Loader2 className='aucctus-stroke-primary h-4 w-4 animate-spin' />
            <span className='aucctus-text-sm-medium'>Uploading...</span>
          </>
        ) : (
          <>
            <Upload className='aucctus-stroke-brand-primary h-4 w-4 transition-colors' />
            <span className='aucctus-text-sm-medium'>
              {isCustomActive ? 'Replace Image' : 'Upload Image'}
            </span>
          </>
        )}
      </button>
    </>
  );
};

export default ImageUploadButton;
