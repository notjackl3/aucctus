import { Modal } from '@components';
import * as Popover from '@radix-ui/react-popover';
import { IPropertyDefinition } from '@libs/api/types';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@libs/utils/react';
import PropertyDefinitionModal, {
  IPropertyFormData,
} from '@components/Modal/PropertyDefinitionModal/PropertyDefinitionModal';
import {
  useCreatePropertyDefinition,
  useDeletePropertyDefinition,
  useUpdatePropertyDefinition,
} from '@hooks/query/properties-mutations.hook';
import { useModal } from '@context/ModalContextProvider';
import useStore from '@stores/store';
import { getPropertyIcon } from '@libs/utils/propertyIcons';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { DynamicIcon } from '@libs/utils/iconMap';

interface IPropertyManagerProps {
  propertyDefinitions?: IPropertyDefinition[];
}

const PropertyManager: React.FC<IPropertyManagerProps> = ({
  propertyDefinitions,
}) => {
  const accountUuid = useStore((state) => state.auth.user?.account?.uuid);
  const { openModal, closeModal } = useModal();

  const createMutation = useCreatePropertyDefinition();
  const updateMutation = useUpdatePropertyDefinition();
  const deleteMutation = useDeletePropertyDefinition();

  const handleCreateProperty = () => {
    const ModalWithLoading = () => {
      return (
        <PropertyDefinitionModal
          onSave={(data: IPropertyFormData) => handleSaveProperty(data)}
          onCancel={closeModal}
          isLoading={createMutation.isLoading}
        />
      );
    };
    openModal(ModalWithLoading, {});
  };

  const handleEditProperty = (property: IPropertyDefinition) => {
    const ModalWithLoading = () => {
      return (
        <PropertyDefinitionModal
          existingProperty={property}
          onSave={(data: IPropertyFormData) =>
            handleSaveProperty(data, property.uuid)
          }
          onCancel={closeModal}
          isLoading={updateMutation.isLoading}
        />
      );
    };
    openModal(ModalWithLoading, {});
  };

  const handleDeleteProperty = (property: IPropertyDefinition) => {
    openModal(Modal.Confirmation, {
      title: 'Delete Property?',
      subtitle: `Are you sure you want to delete "${property.name}"? This will delete the property and associated data from all concepts.`,
      actions: [
        {
          title: 'Cancel',
          variant: 'secondary',
          onClick: closeModal,
        },
        {
          title: 'Delete',
          variant: 'danger',
          onClick: () => {
            deleteMutation.mutate(property.uuid);
            closeModal();
          },
        },
      ],
    });
  };

  const handleSaveProperty = (
    data: IPropertyFormData,
    propertyUuid?: string,
  ) => {
    if (!accountUuid) return;

    if (propertyUuid) {
      // Update existing property
      updateMutation.mutate(
        {
          propertyUuid,
          name: data.name,
          config: data.config,
          description: data.description,
          is_required: data.is_required,
          default_value: data.default_value,
          icon: data.icon,
        },
        {
          onSuccess: () => {
            closeModal();
          },
        },
      );
    } else {
      // Create new property
      createMutation.mutate(
        {
          accountUuid,
          name: data.name,
          key: data.key,
          property_type: data.property_type,
          config: data.config,
          description: data.description,
          is_required: data.is_required,
          default_value: data.default_value,
          icon: data.icon,
        },
        {
          onSuccess: () => {
            closeModal();
          },
        },
      );
    }
  };

  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <button className='aucctus-bg-secondary-hover flex h-8 w-8 items-center justify-center rounded-md transition-colors duration-200'>
          <Plus size={16} className='aucctus-stroke-secondary' />
        </button>
      </Popover.Trigger>
      <Popover.Portal forceMount>
        <Popover.Content
          forceMount
          className='z-[9999]'
          align='end'
          side='bottom'
          sideOffset={5}
          style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
        >
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -4 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className='aucctus-bg-primary flex w-[280px] flex-col gap-1 rounded-md p-2 shadow-lg'>
                  <div className='box-border flex w-full flex-col'>
                    {/* Add New Property */}
                    <button
                      className={cn(
                        'aucctus-bg-primary-hover group rounded-md transition-colors duration-300 hover:outline-none focus:outline-none focus-visible:outline-none',
                        'inline-flex h-[38px] cursor-pointer items-center gap-2 px-2.5 py-[9px]',
                      )}
                      onClick={() => {
                        handleCreateProperty();
                        setIsOpen(false);
                      }}
                    >
                      <Plus className='aucctus-stroke-brand-primary h-4 w-4' />
                      <span className='aucctus-text-sm-medium aucctus-text-brand-primary'>
                        Add Property
                      </span>
                    </button>

                    {propertyDefinitions && propertyDefinitions.length > 0 && (
                      <>
                        <div className='aucctus-bg-secondary my-1 h-px' />

                        {/* Existing Properties */}
                        {propertyDefinitions.map((def) => (
                          <div
                            key={def.uuid}
                            className={cn(
                              'aucctus-bg-primary-hover group rounded-md transition-colors duration-300',
                              'flex h-[38px] items-center justify-between px-2.5 py-[9px]',
                            )}
                          >
                            <div className='flex items-center gap-2 overflow-hidden'>
                              <DynamicIcon
                                variant={getPropertyIcon(def) as string}
                                className='aucctus-stroke-tertiary h-4 w-4 flex-shrink-0'
                              />
                              <span className='aucctus-text-sm aucctus-text-secondary truncate'>
                                {def.name}
                              </span>
                            </div>
                            <div className='flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditProperty(def);
                                  setIsOpen(false);
                                }}
                                className='hover:aucctus-bg-secondary rounded p-1'
                                title='Edit property'
                              >
                                <Pencil className='aucctus-stroke-tertiary h-3.5 w-3.5' />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteProperty(def);
                                  setIsOpen(false);
                                }}
                                className='hover:aucctus-bg-error-secondary rounded p-1'
                                title='Delete property'
                              >
                                <Trash2 className='aucctus-stroke-error-primary h-3.5 w-3.5' />
                              </button>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default PropertyManager;
