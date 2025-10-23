import React, { useState, useRef } from 'react';
import { Icon, Loading, toast } from '@components';
import { animated } from 'react-spring';
import { useExpandCollapseTransition } from '@hooks/animation/animation.hook';
import { useUploadTestCollateralImage } from '@hooks/query/testing.hook';

interface UploadImageCollateralProps {
  conceptUuid?: string;
  testUuid?: string;
  isDisabled?: boolean;
}

const UploadImageCollateral: React.FC<UploadImageCollateralProps> = ({
  conceptUuid,
  testUuid,
  isDisabled = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const uploadImageCollateral = useUploadTestCollateralImage();
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(
    null,
  );
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isUploadingImage = uploadImageCollateral.isLoading;

  const transitions = useExpandCollapseTransition({
    isExpanded,
    withOpacity: true,
    collapsedHeight: 0,
    maxHeight: 600,
    duration: 300,
  });

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedUploadFile(null);
      return;
    }

    setSelectedUploadFile(file);
    const baseTitle = file.name.replace(/\.[^/.]+$/, '');
    setUploadTitle(baseTitle || 'Uploaded Collateral');
  };

  const clearUploadForm = () => {
    setSelectedUploadFile(null);
    setUploadTitle('');
    setUploadDescription('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadSubmit = async () => {
    if (!conceptUuid || !testUuid) {
      toast.error('Missing concept or test information');
      return;
    }

    if (!selectedUploadFile) {
      toast.error('Select an image to upload');
      return;
    }

    try {
      await uploadImageCollateral.mutateAsync({
        conceptUuid,
        testUuid,
        file: selectedUploadFile,
        title: uploadTitle.trim() || undefined,
        description: uploadDescription.trim() || undefined,
      });
      clearUploadForm();
      setIsExpanded(false); // Collapse after successful upload
    } catch (_error) {
      // Errors handled by mutation hook toast
    }
  };

  const formatFileSize = (sizeInBytes: number) => {
    if (!sizeInBytes) return '';
    const mb = sizeInBytes / (1024 * 1024);
    if (mb >= 1) {
      return `${mb.toFixed(1)} MB`;
    }
    const kb = sizeInBytes / 1024;
    return `${kb.toFixed(0)} KB`;
  };

  return (
    <div className='overflow-hidden rounded-lg border border-black'>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        disabled={isDisabled}
        className='aucctus-bg-secondary-subtle flex w-full items-center justify-between p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50'
        type='button'
      >
        <div className='flex items-center gap-2'>
          <Icon variant='upload' className='aucctus-stroke-tertiary h-5 w-5' />
          <span className='aucctus-text-sm-semibold aucctus-text-tertiary'>
            Upload Image Collateral
          </span>
        </div>
        <Icon
          variant={isExpanded ? 'chevronup' : 'chevrondown'}
          className='aucctus-stroke-tertiary h-4 w-4'
        />
      </button>

      {transitions(
        (style, item) =>
          item && (
            <animated.div style={style}>
              <div className='space-y-3 px-4 pb-4 pt-4'>
                <p className='aucctus-text-xs-regular aucctus-text-secondary'>
                  Add your own imagery to reuse across synthetic interviews and
                  collateral workflows.
                </p>
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='image/*'
                  className='hidden'
                  onChange={handleFileSelection}
                  disabled={isDisabled || isUploadingImage}
                />
                <div className='flex flex-col gap-2'>
                  <button
                    type='button'
                    className='btn btn-secondary btn-sm self-start'
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isDisabled || isUploadingImage}
                  >
                    {selectedUploadFile ? 'Change Image' : 'Choose Image'}
                  </button>
                  {selectedUploadFile ? (
                    <div className='aucctus-bg-secondary-subtle aucctus-border-secondary rounded border px-3 py-2 text-xs'>
                      <div className='aucctus-text-xs-semibold aucctus-text-primary'>
                        {selectedUploadFile.name}
                      </div>
                      <div className='aucctus-text-xs-regular aucctus-text-tertiary'>
                        {formatFileSize(selectedUploadFile.size)}
                      </div>
                    </div>
                  ) : (
                    <span className='aucctus-text-xs-regular aucctus-text-tertiary'>
                      PNG or JPG, up to 10 MB.
                    </span>
                  )}
                </div>
                <input
                  type='text'
                  value={uploadTitle}
                  onChange={(event) => setUploadTitle(event.target.value)}
                  placeholder='Title'
                  className='aucctus-bg-primary aucctus-border-secondary aucctus-text-primary placeholder:aucctus-text-placeholder focus:aucctus-border-brand-primary w-full rounded border px-3 py-2 text-sm focus:outline-none'
                  disabled={isUploadingImage || isDisabled}
                />
                <textarea
                  value={uploadDescription}
                  onChange={(event) => setUploadDescription(event.target.value)}
                  placeholder='Description (optional)'
                  rows={2}
                  className='aucctus-bg-primary aucctus-border-secondary aucctus-text-primary placeholder:aucctus-text-placeholder focus:aucctus-border-brand-primary w-full rounded border px-3 py-2 text-sm focus:outline-none'
                  disabled={isUploadingImage || isDisabled}
                />
                <div className='flex items-center justify-between gap-2'>
                  <button
                    type='button'
                    className='btn btn-tertiary btn-sm'
                    onClick={clearUploadForm}
                    disabled={
                      isUploadingImage ||
                      (!selectedUploadFile &&
                        !uploadTitle &&
                        !uploadDescription)
                    }
                  >
                    Clear
                  </button>
                  <button
                    type='button'
                    className='btn btn-primary btn-sm flex items-center gap-1 disabled:opacity-50'
                    onClick={handleUploadSubmit}
                    disabled={
                      !selectedUploadFile ||
                      !conceptUuid ||
                      !testUuid ||
                      isUploadingImage ||
                      isDisabled
                    }
                  >
                    {isUploadingImage ? <Loading isSmall /> : null}
                    {isUploadingImage ? 'Uploading…' : 'Upload'}
                  </button>
                </div>
              </div>
            </animated.div>
          ),
      )}
    </div>
  );
};

export default UploadImageCollateral;
