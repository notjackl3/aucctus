import Icon from '@components/Icon';
import React from 'react';

interface DocumentUploadProps {}

const DocumentUpload: React.FC<DocumentUploadProps> = ({}) => {
  return (
    <div className='col-span-3 flex flex-col gap-3'>
      {/* Document Upload Widget */}
      <div className='flex-[1.8]'>
        <div className='aucctus-bg-secondary aucctus-border-primary h-full rounded-lg border p-4 shadow-sm'>
          <h3 className='aucctus-text-xs-semibold aucctus-text-tertiary mb-3 uppercase tracking-widest'>
            QUICK CONTEXT UPLOAD
          </h3>
          <div
            className='aucctus-border-brand hover:aucctus-border-brand-alt hover:aucctus-bg-brand-secondary flex flex-1 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 text-center transition-colors'
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.multiple = true;
              input.accept = '.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx';
              input.onchange = (e) => {
                const files = (e.target as HTMLInputElement).files;
                if (files) {
                  // TODO: Handle file upload
                }
              };
              input.click();
            }}
          >
            <Icon
              variant='upload'
              className='aucctus-stroke-brand-primary mb-2 h-6 w-6'
            />
            <p className='aucctus-text-sm-medium aucctus-text-primary mb-1'>
              Drop files here
            </p>
            <p className='aucctus-text-xs aucctus-text-secondary'>
              PDF, DOC, XLS, PPT
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;
