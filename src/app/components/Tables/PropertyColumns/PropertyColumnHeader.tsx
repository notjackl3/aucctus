import { IPropertyDefinition, IPropertyFilter } from '@libs/api/types';
import React from 'react';
import NotionStyleColumnMenu from './NotionStyleColumnMenu';
import { useModal } from '@context/ModalContextProvider';
import { Modal } from '@components';
import PropertyDefinitionModal, {
  IPropertyFormData,
} from '@components/Modal/PropertyDefinitionModal/PropertyDefinitionModal';
import {
  useDeletePropertyDefinition,
  useUpdatePropertyDefinition,
} from '@hooks/query/properties-mutations.hook';

interface IPropertyColumnHeaderProps {
  definition: IPropertyDefinition;
  onFilterChange: (filter: IPropertyFilter) => void;
  onSort?: (direction: 'asc' | 'desc') => void;
  currentFilter?: IPropertyFilter;
  currentSort?: 'asc' | 'desc' | null;
  onReorder?: (draggedId: string, targetId: string) => void;
}

/**
 * Custom hook to manage drag and drop state for property columns
 */
export const usePropertyColumnDragDrop = (
  definition: IPropertyDefinition | null,
  onReorder?: (draggedKey: string, targetKey: string) => void,
) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [dropIndicator, setDropIndicator] = React.useState<{
    position: 'left' | 'right';
  } | null>(null);

  const handleDragStart = React.useCallback(
    (e: React.DragEvent) => {
      if (!definition) return;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', definition.key);
      setIsDragging(true);
    },
    [definition],
  );

  const handleDragEnd = React.useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    // Determine drop position based on mouse position
    const rect = e.currentTarget.getBoundingClientRect();
    const midPoint = rect.left + rect.width / 2;
    const position = e.clientX < midPoint ? 'left' : 'right';

    setDropIndicator({ position });
  }, []);

  const handleDragLeave = React.useCallback(() => {
    setDropIndicator(null);
  }, []);

  const handleDrop = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDropIndicator(null);

      if (!definition) return;
      const draggedKey = e.dataTransfer.getData('text/plain');
      if (draggedKey && draggedKey !== definition.key && onReorder) {
        onReorder(draggedKey, definition.key);
      }
    },
    [definition, onReorder],
  );

  return {
    dragHandlers: {
      draggable: true,
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
    dragState: {
      isDragging,
      dropIndicator,
    },
  };
};

/**
 * Notion-style column header with dropdown menu
 * Provides filter, sort, edit, and delete actions
 */
const PropertyColumnHeader: React.FC<IPropertyColumnHeaderProps> = ({
  definition,
  onFilterChange,
  onSort,
  currentFilter,
  currentSort,
  onReorder,
}) => {
  const { openModal, closeModal } = useModal();
  const updateMutation = useUpdatePropertyDefinition();
  const deleteMutation = useDeletePropertyDefinition();

  const handleEdit = React.useCallback(
    (property: IPropertyDefinition) => {
      openModal(PropertyDefinitionModal, {
        existingProperty: property,
        onSave: (data: IPropertyFormData) => {
          updateMutation.mutate(
            {
              propertyUuid: property.uuid,
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
        },
        onCancel: closeModal,
        isLoading: updateMutation.isLoading,
      });
    },
    [openModal, closeModal, updateMutation],
  );

  const handleDelete = React.useCallback(
    (property: IPropertyDefinition) => {
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
    },
    [openModal, closeModal, deleteMutation],
  );

  return (
    <NotionStyleColumnMenu
      definition={definition}
      onFilterChange={onFilterChange}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onSort={onSort}
      currentFilter={currentFilter}
      currentSort={currentSort}
      onReorder={onReorder}
    />
  );
};

export default PropertyColumnHeader;
