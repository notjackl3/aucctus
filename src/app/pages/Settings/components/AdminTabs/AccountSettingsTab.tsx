import { FunctionComponent, useState } from 'react';
import { Icon } from '@components';
import {
  useNucleusReportLatest,
  useGenerateNucleusReport,
  useGenerateNucleusVideo,
} from '@hooks/query/nucleus.hook';
import { useAccountLogo, useUploadAccountLogo } from '@hooks/query/admin.hook';
import { cn } from '@libs/utils/react';
import { ProcessingStatus } from '@libs/api/types';

/**
 * Get status configuration for nucleus report display
 */
const getStatusConfig = (status: ProcessingStatus | undefined) => {
  switch (status) {
    case 'completed':
      return {
        label: 'Completed',
        description: 'Your Nucleus report is ready and available.',
        iconVariant: 'check-circle-broken' as const,
        iconClass: 'aucctus-stroke-success-primary',
        badgeClass: 'aucctus-bg-success-subtle aucctus-text-success-primary',
      };
    case 'processing':
      return {
        label: 'Processing',
        description: 'Your Nucleus report is currently being generated.',
        iconVariant: 'loading-02' as const,
        iconClass: 'aucctus-stroke-brand-primary animate-spin',
        badgeClass: 'aucctus-bg-brand-subtle aucctus-text-brand-primary',
      };
    case 'pending':
      return {
        label: 'Pending',
        description: 'Your Nucleus report generation is queued.',
        iconVariant: 'clock' as const,
        iconClass: 'aucctus-stroke-warning-primary',
        badgeClass: 'aucctus-bg-warning-subtle aucctus-text-warning-primary',
      };
    case 'failed':
      return {
        label: 'Failed',
        description:
          'The last generation attempt failed. You can try generating again.',
        iconVariant: 'alert-circle' as const,
        iconClass: 'aucctus-stroke-error-primary',
        badgeClass: 'aucctus-bg-error-subtle aucctus-text-error-primary',
      };
    default:
      return {
        label: 'Not Generated',
        description: 'No Nucleus report exists for this account yet.',
        iconVariant: 'file-text' as const,
        iconClass: 'aucctus-stroke-secondary',
        badgeClass: 'aucctus-bg-secondary aucctus-text-secondary',
      };
  }
};

const AccountSettingsTab: FunctionComponent = () => {
  // Fetch account logo from dedicated endpoint
  const { logoUrl: existingLogoUrl } = useAccountLogo();

  // Fetch nucleus report status
  const { nucleusReport, isLoading, isNoReportFound } =
    useNucleusReportLatest();

  // Generate nucleus report mutation
  const {
    generateReport,
    isGenerating,
    isSuccess: isGenerationStarted,
  } = useGenerateNucleusReport();

  // Generate nucleus video mutation
  const {
    generateVideo,
    isGenerating: isVideoGenerating,
    isSuccess: isVideoGenerationStarted,
  } = useGenerateNucleusVideo();

  // Upload account logo mutation
  const {
    uploadLogo,
    isUploading: isLogoUploading,
    isSuccess: isLogoUploadSuccess,
    uploadedLogoUrl,
    reset: resetLogoUpload,
  } = useUploadAccountLogo();

  // Video generation form state
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Logo upload form state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Determine current status
  const currentStatus = isNoReportFound
    ? undefined
    : nucleusReport?.processingStatus;
  const statusConfig = getStatusConfig(currentStatus);

  // Disable generate button if processing or generation just started
  const isGenerateDisabled =
    isLoading ||
    isGenerating ||
    isGenerationStarted ||
    currentStatus === 'processing' ||
    currentStatus === 'pending';

  const handleGenerate = () => {
    if (!isGenerateDisabled) {
      generateReport();
    }
  };

  // Video generation handlers
  const isVideoGenerateDisabled = isVideoGenerating || isVideoGenerationStarted;

  const handleGenerateVideo = () => {
    if (!isVideoGenerateDisabled) {
      generateVideo({
        image: imageFile || undefined,
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
  };

  const handleClearFile = () => {
    setImageFile(null);
    // Reset the file input
    const input = document.getElementById('hq-image-file') as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  };

  // Logo upload handlers
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setLogoFile(file);
    resetLogoUpload();

    // Create preview URL
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
    } else {
      setLogoPreview(null);
    }
  };

  const handleClearLogoFile = () => {
    setLogoFile(null);
    setLogoPreview(null);
    resetLogoUpload();
    const input = document.getElementById(
      'account-logo-file',
    ) as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  };

  const handleUploadLogo = () => {
    if (logoFile && !isLogoUploading) {
      uploadLogo(logoFile);
    }
  };

  // Get the current logo URL (newly uploaded or existing from API)
  const currentLogoUrl = uploadedLogoUrl || existingLogoUrl;

  return (
    <div className='flex w-full flex-col gap-6'>
      {/* Generate Nucleus Card */}
      <div className='aucctus-bg-primary rounded-lg border border-gray-200 p-6'>
        <div className='flex items-start justify-between'>
          <div className='flex-1'>
            <div className='mb-2 flex items-center gap-3'>
              <Icon
                variant='sparkles'
                className='aucctus-stroke-brand-primary h-5 w-5'
              />
              <h4 className='aucctus-text-lg-semibold aucctus-text-primary'>
                Generate Nucleus
              </h4>
            </div>
            <p className='aucctus-text-sm aucctus-text-secondary mb-4'>
              Generate a comprehensive Nucleus report with company context,
              strategic insights, and organizational intelligence used by
              Aucctus AI agents.
            </p>

            {/* Status Display */}
            <div className='mb-4 flex items-center gap-3'>
              <span className='aucctus-text-sm aucctus-text-tertiary'>
                Status:
              </span>
              {isLoading ? (
                <div className='flex items-center gap-2'>
                  <div className='h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600' />
                  <span className='aucctus-text-sm aucctus-text-secondary'>
                    Loading...
                  </span>
                </div>
              ) : (
                <div className='flex items-center gap-2'>
                  <Icon
                    variant={statusConfig.iconVariant}
                    className={cn('h-4 w-4', statusConfig.iconClass)}
                  />
                  <span
                    className={cn(
                      'aucctus-text-sm-medium rounded-full px-2 py-0.5',
                      statusConfig.badgeClass,
                    )}
                  >
                    {statusConfig.label}
                  </span>
                </div>
              )}
            </div>

            {/* Status Description */}
            {!isLoading && (
              <p className='aucctus-text-xs aucctus-text-tertiary'>
                {statusConfig.description}
              </p>
            )}
          </div>

          {/* Generate Button */}
          <div className='ml-6'>
            <button
              onClick={handleGenerate}
              disabled={isGenerateDisabled}
              className={cn(
                'btn btn-primary btn-md inline-flex items-center gap-2',
                {
                  'cursor-not-allowed opacity-50': isGenerateDisabled,
                },
              )}
            >
              {isGenerating || isGenerationStarted ? (
                <>
                  <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Icon
                    variant='sparkles'
                    className='h-4 w-4 fill-white stroke-white'
                  />
                  <span>Generate</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Generate Nucleus Video Card */}
      <div className='aucctus-bg-primary rounded-lg border border-gray-200 p-6'>
        <div className='flex items-start justify-between'>
          <div className='flex-1'>
            <div className='mb-2 flex items-center gap-3'>
              <Icon
                variant='play-square'
                className='aucctus-stroke-brand-primary h-5 w-5'
              />
              <h4 className='aucctus-text-lg-semibold aucctus-text-primary'>
                Generate Nucleus Video
              </h4>
            </div>
            <p className='aucctus-text-sm aucctus-text-secondary mb-4'>
              Generate a cinematic headquarters video for use in Nucleus
              reports. The AI agent will search for company HQ images or use a
              custom image you provide.
            </p>

            {/* Image File Input */}
            <div className='mb-4'>
              <label
                htmlFor='hq-image-file'
                className='aucctus-text-sm-medium aucctus-text-primary mb-1 block'
              >
                HQ Image (optional)
              </label>
              <div className='flex items-center gap-3'>
                <label
                  className={cn(
                    'btn btn-secondary btn-sm inline-flex cursor-pointer items-center gap-2',
                    {
                      'cursor-not-allowed opacity-50': isVideoGenerateDisabled,
                    },
                  )}
                >
                  <Icon
                    variant='upload'
                    className='aucctus-stroke-secondary h-4 w-4'
                  />
                  <span>Choose Image</span>
                  <input
                    id='hq-image-file'
                    type='file'
                    accept='image/*'
                    onChange={handleFileChange}
                    disabled={isVideoGenerateDisabled}
                    className='hidden'
                  />
                </label>
                {imageFile && (
                  <div className='flex items-center gap-2 rounded-md bg-gray-100 px-3 py-1.5'>
                    <Icon
                      variant='image'
                      className='aucctus-stroke-secondary h-4 w-4'
                    />
                    <span className='aucctus-text-sm aucctus-text-secondary max-w-[200px] truncate'>
                      {imageFile.name}
                    </span>
                    <button
                      type='button'
                      onClick={handleClearFile}
                      disabled={isVideoGenerateDisabled}
                      className='ml-1 rounded-full p-0.5 hover:bg-gray-200'
                    >
                      <Icon
                        variant='closeX'
                        className='aucctus-stroke-tertiary h-3 w-3'
                      />
                    </button>
                  </div>
                )}
              </div>
              <p className='aucctus-text-xs aucctus-text-tertiary mt-1'>
                Leave empty to auto-search for company HQ image
              </p>
            </div>

            {/* Success Message */}
            {isVideoGenerationStarted && (
              <div className='flex items-center gap-2 rounded-md bg-green-50 p-3'>
                <Icon
                  variant='check-circle-broken'
                  className='aucctus-stroke-success-primary h-4 w-4'
                />
                <span className='aucctus-text-sm aucctus-text-success-primary'>
                  Video generation started. This may take several minutes.
                </span>
              </div>
            )}
          </div>

          {/* Generate Video Button */}
          <div className='ml-6'>
            <button
              onClick={handleGenerateVideo}
              disabled={isVideoGenerateDisabled}
              className={cn(
                'btn btn-primary btn-md inline-flex items-center gap-2',
                {
                  'cursor-not-allowed opacity-50': isVideoGenerateDisabled,
                },
              )}
            >
              {isVideoGenerating || isVideoGenerationStarted ? (
                <>
                  <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Icon
                    variant='play-square'
                    className='h-4 w-4 stroke-white'
                  />
                  <span>Generate Video</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Account Logo Card */}
      <div className='aucctus-bg-primary rounded-lg border border-gray-200 p-6'>
        <div className='flex items-start justify-between'>
          <div className='flex-1'>
            <div className='mb-2 flex items-center gap-3'>
              <Icon
                variant='image'
                className='aucctus-stroke-brand-primary h-5 w-5'
              />
              <h4 className='aucctus-text-lg-semibold aucctus-text-primary'>
                Account Logo
              </h4>
            </div>
            <p className='aucctus-text-sm aucctus-text-secondary mb-4'>
              Upload a custom logo for your account. This logo will be displayed
              on the Nucleus page and public idea submission forms. PNG format
              with transparent background is recommended.
            </p>

            {/* Current Logo Display */}
            {currentLogoUrl && (
              <div className='mb-4'>
                <label className='aucctus-text-sm-medium aucctus-text-primary mb-2 block'>
                  Current Logo
                </label>
                <div className='inline-flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-4'>
                  <img
                    src={currentLogoUrl}
                    alt='Account logo'
                    className='h-16 max-w-[200px] object-contain'
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}

            {/* Logo File Input */}
            <div className='mb-4'>
              <label
                htmlFor='account-logo-file'
                className='aucctus-text-sm-medium aucctus-text-primary mb-1 block'
              >
                {currentLogoUrl ? 'Upload New Logo' : 'Upload Logo'}
              </label>
              <div className='flex items-center gap-3'>
                <label
                  className={cn(
                    'btn btn-secondary btn-sm inline-flex cursor-pointer items-center gap-2',
                    {
                      'cursor-not-allowed opacity-50': isLogoUploading,
                    },
                  )}
                >
                  <Icon
                    variant='upload'
                    className='aucctus-stroke-secondary h-4 w-4'
                  />
                  <span>Choose File</span>
                  <input
                    id='account-logo-file'
                    type='file'
                    accept='image/*'
                    onChange={handleLogoFileChange}
                    disabled={isLogoUploading}
                    className='hidden'
                  />
                </label>
                {logoFile && (
                  <div className='flex items-center gap-2 rounded-md bg-gray-100 px-3 py-1.5'>
                    <Icon
                      variant='image'
                      className='aucctus-stroke-secondary h-4 w-4'
                    />
                    <span className='aucctus-text-sm aucctus-text-secondary max-w-[200px] truncate'>
                      {logoFile.name}
                    </span>
                    <button
                      type='button'
                      onClick={handleClearLogoFile}
                      disabled={isLogoUploading}
                      className='ml-1 rounded-full p-0.5 hover:bg-gray-200'
                    >
                      <Icon
                        variant='closeX'
                        className='aucctus-stroke-tertiary h-3 w-3'
                      />
                    </button>
                  </div>
                )}
              </div>
              <p className='aucctus-text-xs aucctus-text-tertiary mt-1'>
                Max file size: 5MB. PNG format recommended for transparent
                backgrounds.
              </p>
            </div>

            {/* Logo Preview */}
            {logoPreview && (
              <div className='mb-4'>
                <label className='aucctus-text-sm-medium aucctus-text-primary mb-2 block'>
                  Preview
                </label>
                <div className='inline-flex items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4'>
                  <img
                    src={logoPreview}
                    alt='Logo preview'
                    className='h-16 max-w-[200px] object-contain'
                  />
                </div>
              </div>
            )}

            {/* Success Message */}
            {isLogoUploadSuccess && (
              <div className='flex items-center gap-2 rounded-md bg-green-50 p-3'>
                <Icon
                  variant='check-circle-broken'
                  className='aucctus-stroke-success-primary h-4 w-4'
                />
                <span className='aucctus-text-sm aucctus-text-success-primary'>
                  Logo uploaded successfully.
                </span>
              </div>
            )}
          </div>

          {/* Upload Button */}
          <div className='ml-6'>
            <button
              onClick={handleUploadLogo}
              disabled={!logoFile || isLogoUploading}
              className={cn(
                'btn btn-primary btn-md inline-flex items-center gap-2',
                {
                  'cursor-not-allowed opacity-50': !logoFile || isLogoUploading,
                },
              )}
            >
              {isLogoUploading ? (
                <>
                  <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Icon variant='upload' className='h-4 w-4 stroke-white' />
                  <span>Upload</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsTab;
