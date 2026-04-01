import images from '@assets/img';
import ImageToggleControls from '@components/ConceptOverview/ImageToggleControls';
import ImageUploadButton from '@components/ConceptOverview/ImageUploadButton';
import EditModeSwitcher from '@components/Text/EditModeSwitcher/EditModeSwitcher';
import { cn } from '@libs/utils/react';
import ComponentTooltip from '@components/ToolTip/ComponentTooltip';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import React from 'react';

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
  const [imageLoaded, setImageLoaded] = React.useState(false);

  React.useEffect(() => {
    setImageLoaded(false);
  }, [resolvedImage]);

  const [descriptionOpen, setDescriptionOpen] = React.useState(false);
  const [isTruncated, setIsTruncated] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const [collapsedHeight, setCollapsedHeight] = React.useState<
    number | undefined
  >(undefined);
  const descriptionRef = React.useRef<HTMLParagraphElement>(null);
  const descriptionContainerRef = React.useRef<HTMLDivElement>(null);

  const checkIfTruncated = React.useCallback(() => {
    if (descriptionRef.current) {
      const el = descriptionRef.current;
      const wasClamped = el.style.webkitLineClamp;
      // Temporarily apply line-clamp to measure collapsed height
      el.style.display = '-webkit-box';
      el.style.webkitLineClamp = '5';
      el.style.webkitBoxOrient = 'vertical';
      el.style.overflow = 'hidden';
      const clamped = el.clientHeight;
      const full = el.scrollHeight;
      // Restore
      el.style.display = '';
      el.style.webkitLineClamp = wasClamped;
      el.style.webkitBoxOrient = '';
      el.style.overflow = '';
      setCollapsedHeight(clamped);
      setIsTruncated(full > clamped);
    }
  }, []);

  React.useLayoutEffect(() => {
    checkIfTruncated();
  }, [description, checkIfTruncated]);

  React.useEffect(() => {
    const handleResize = () => checkIfTruncated();
    const handleClickOutside = (event: MouseEvent) => {
      if (
        descriptionContainerRef.current &&
        !descriptionContainerRef.current.contains(event.target as Node)
      ) {
        setDescriptionOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [checkIfTruncated]);

  return (
    <div className='aucctus-bg-primary aucctus-border-primary relative flex max-h-[1000px] overflow-hidden rounded-xl border shadow-sm'>
      {/* Info side */}
      <div className='relative flex flex-1 flex-col justify-center gap-4 px-8 py-6'>
        {/* Creator avatar */}
        {creator && (
          <ComponentTooltip
            tip={
              <div className='aucctus-bg-primary aucctus-border-secondary rounded-md border px-3 py-1.5 text-sm shadow-md'>
                <p>
                  Created by {creator.firstName} {creator.lastName}
                </p>
              </div>
            }
            preferredPosition='below'
          >
            <div className='absolute right-4 top-4'>
              <div className='aucctus-bg-secondary aucctus-border-secondary flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border'>
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
          </ComponentTooltip>
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
          <div
            ref={descriptionContainerRef}
            className='relative'
            onClick={() => isTruncated && setDescriptionOpen((prev) => !prev)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <motion.p
              ref={descriptionRef}
              className={cn(
                'aucctus-text-md aucctus-text-secondary overflow-hidden leading-relaxed',
                {
                  'cursor-pointer': isTruncated,
                },
              )}
              initial={false}
              animate={{
                height: descriptionOpen
                  ? (descriptionRef.current?.scrollHeight ?? 'auto')
                  : (collapsedHeight ?? 'auto'),
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              {description}
            </motion.p>
            {!descriptionOpen && isTruncated && (
              <>
                <span className='pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-inherit to-transparent' />
                <span className='absolute inset-x-0 bottom-0 flex w-full justify-center'>
                  {isHovered && (
                    <button className='btn btn-light btn-xs mb-1'>
                      See More <ArrowDown className='h-3 w-3' />
                    </button>
                  )}
                </span>
              </>
            )}
          </div>
        )}
        {children}
      </div>

      {/* Concept image */}
      <div className='group relative w-1/2 flex-shrink-0 p-3 pl-0'>
        <div className='aucctus-bg-secondary aspect-video w-full overflow-hidden rounded-lg'>
          <img
            src={resolvedImage}
            alt={imageAlt}
            className={cn(
              'h-full w-full object-cover transition-opacity duration-300',
              {
                'opacity-0': !imageLoaded,
                'opacity-100': imageLoaded,
              },
            )}
            loading='eager'
            onLoad={() => setImageLoaded(true)}
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
