import { Modal } from '@components';
import { useModal } from '@context/ModalContextProvider';
import { useSocketEvent } from '@hooks/sockets/aucctus';
import { AppPath } from '@routes/routes';
import useStore from '@stores/store';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const ConceptReportSocketWrapper: React.FC = () => {
  const conceptUuid = useStore((state) => state.conceptReport.conceptUuid);
  const user = useStore((state) => state.auth.user);
  const { openModal, closeModal } = useModal();
  const navigate = useNavigate();

  useSocketEvent('ai.editing.started', (data) => {
    // If the concept uuid is not the same as the concept uuid in the store, ignore the message
    if (data.conceptUuid !== conceptUuid) return;
    if (data.userUuid !== user?.uuid) {
      openModal(
        Modal.Confirmation,
        {
          title: `AI Assistant Editing started by ${data.userFirstName} ${data.userLastName}`,
          subtitle:
            'We apologize for the inconvenience. This concept is temporarily unavailable while an AI Assistant is helping with edits. Please return to the Concept Bank and try again later.',
          actions: [
            {
              title: 'Go to Concept Bank',
              variant: 'primary',
              onClick: () => {
                navigate(AppPath.ConceptBank, {
                  replace: true,
                });
                closeModal();
              },
            },
          ],
        },
        {
          shouldCloseOnOverlayClick: false,
        },
      );
    }
  });

  return null;
};

export default ConceptReportSocketWrapper;
