import React from 'react';
import EditModeSwitcher from '@components/Text/EditModeSwitcher/EditModeSwitcher';
import ImageUploadButton from '@components/ConceptOverview/ImageUploadButton';
import ImageToggleControls from '@components/ConceptOverview/ImageToggleControls';
import images from '@assets/img';
import { cn } from '@libs/utils/react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@radix-ui/react-tooltip';

interface ConceptCreator {
  firstName: string;
  lastName: string;
  profileImage?: string;
}

interface ConceptHeroProps {
  titleEdit: {
    value: string;
    validation: { maxLength?: number };
    handleChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => void;
    handleSave: () => void;
    handleCancel: () => void;
  };
  description?: string;
  imageUrl?: string;
  imageAlt?: string;
  creator?: ConceptCreator;
  conceptUuid: string;
  isHistoricalVersion?: boolean;
  uploadMutation: {
    mutate: (file: File, options?: { onSuccess?: () => void }) => void;
    isLoading: boolean;
  };
  isCustomActive?: boolean;
  customImageUrl?: string;
  onRevertToAI?: () => void;
  isRevertingImage?: boolean;
  children?: React.ReactNode;
}

const ConceptHero: React.FC<ConceptHeroProps> = ({
  titleEdit,
  description,
  imageUrl,
  imageAlt = 'Concept image',
  creator,
  conceptUuid,
  isHistoricalVersion,
  uploadMutation,
  isCustomActive,
  customImageUrl,
  onRevertToAI,
  isRevertingImage,
  children,
}) => {
  const resolvedImage = imageUrl || images.aiExplorationsBackground;

  return (
    <div className='aucctus-bg-primary aucctus-border-primary relative flex max-h-[420px] overflow-hidden rounded-xl border shadow-sm'>
      {/* Info side */}
      <div className='relative flex flex-1 flex-col justify-start gap-4 px-8 py-6'>
        {/* Creator avatar */}
        {creator && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className='absolute right-4 top-4'>
                  <div className='aucctus-bg-secondary aucctus-border-secondary flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded-full border'>
                    {creator.profileImage ? (
                      <img
                        src={creator.profileImage}
                        alt={`${creator.firstName} ${creator.lastName}`}
                        className='h-full w-full object-cover'
                      />
                    ) : (
                      <span className='aucctus-text-xs-medium aucctus-text-tertiary'>
                        {creator.firstName?.charAt(0)}
                        {creator.lastName?.charAt(0)}
                      </span>
                    )}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent
                side='bottom'
                className='aucctus-bg-primary aucctus-border-secondary rounded-md border px-3 py-1.5 text-sm shadow-md'
              >
                <p>
                  Created by {creator.firstName} {creator.lastName}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        <EditModeSwitcher
          containerClassName={cn({
            'pointer-events-none select-text select-auto user-select-auto webkit-user-select-auto':
              isHistoricalVersion,
          })}
          pClassName='aucctus-text-brand-primary text-5xl font-extrabold leading-[1.1] tracking-tight'
          textFieldClassName='!text-5xl max-w-[600px]'
          value={titleEdit.value}
          label=''
          name='title'
          maxLength={titleEdit.validation.maxLength}
          rows={1}
          onChange={(e) => titleEdit.handleChange(e)}
          saveOnBlur={true}
          handleSave={() => titleEdit.handleSave()}
          handleCancel={() => titleEdit.handleCancel()}
        />

        {description && (
          <p className='aucctus-text-md aucctus-text-secondary leading-relaxed'>
            {description}
          </p>
        )}
        {children}
      </div>

      {/* Concept image */}
      <div className='group relative w-1/2 flex-shrink-0 p-3 pl-0'>
        <div className='h-full w-full overflow-hidden rounded-lg'>
          <img
            src={resolvedImage}
            alt={imageAlt}
            className='h-full w-full object-cover'
            loading='eager'
          />
        </div>
        {/* Image controls overlay - visible on hover */}
        <div className='absolute right-6 top-6 flex flex-col gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
          <ImageUploadButton
            conceptUuid={conceptUuid}
            isCustomActive={!!isCustomActive}
            uploadMutation={uploadMutation}
          />
          {isCustomActive && customImageUrl && onRevertToAI && (
            <ImageToggleControls
              isReverting={!!isRevertingImage}
              onRevertToAI={onRevertToAI}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ConceptHero;
