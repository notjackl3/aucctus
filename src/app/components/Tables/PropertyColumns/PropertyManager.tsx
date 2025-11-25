import { Icon, Modal } from '@components';
import * as Menubar from '@radix-ui/react-menubar';
import { IPropertyDefinition } from '@libs/api/types';
import React from 'react';
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

  return (
    <Menubar.Root className='flex flex-row'>
      <Menubar.Menu>
        <Menubar.Trigger className='aucctus-bg-secondary-hover flex h-8 w-8 items-center justify-center rounded-md transition-colors duration-200'>
          <Icon
            variant='plus'
            height={16}
            width={16}
            className='aucctus-stroke-secondary'
          />
        </Menubar.Trigger>
        <Menubar.Portal>
          <Menubar.Content
            className='aucctus-bg-primary z-[9999] flex w-[280px] flex-col gap-1 rounded-md p-2 shadow-lg'
            align='end'
            sideOffset={5}
          >
            <div className='box-border flex w-full flex-col'>
              {/* Add New Property */}
              <Menubar.Item
                className={cn(
                  'aucctus-bg-primary-hover group rounded-md transition-colors duration-300 hover:outline-none focus:outline-none focus-visible:outline-none',
                  'inline-flex h-[38px] cursor-pointer items-center gap-2 px-2.5 py-[9px]',
                )}
                onClick={handleCreateProperty}
              >
                <Icon
                  variant='plus'
                  className='aucctus-stroke-brand-primary h-4 w-4'
                />
                <span className='aucctus-text-sm-medium aucctus-text-brand-primary'>
                  Add Property
                </span>
              </Menubar.Item>

              {propertyDefinitions && propertyDefinitions.length > 0 && (
                <>
                  <Menubar.Separator className='aucctus-bg-secondary my-1 h-px' />

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
                        <Icon
                          variant={getPropertyIcon(def) as IconVariant}
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
                          }}
                          className='hover:aucctus-bg-secondary rounded p-1'
                          title='Edit property'
                        >
                          <Icon
                            variant='edit'
                            className='aucctus-stroke-tertiary h-3.5 w-3.5'
                          />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProperty(def);
                          }}
                          className='hover:aucctus-bg-error-secondary rounded p-1'
                          title='Delete property'
                        >
                          <Icon
                            variant='trash'
                            className='aucctus-stroke-error-primary h-3.5 w-3.5'
                          />
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </Menubar.Content>
        </Menubar.Portal>
      </Menubar.Menu>
    </Menubar.Root>
  );
};

export default PropertyManager;
