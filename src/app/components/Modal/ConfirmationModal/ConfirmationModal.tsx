import { FunctionComponent } from 'react';

export interface IActionButton {
  title: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  variant:
    | 'primary'
    | 'secondary'
    | 'danger'
    | 'warning'
    | 'success'
    | 'info'
    | 'light'
    | 'dark';
}

interface IConfirmationModalProps {
  title: string;
  subtitle?: string;
  actions: IActionButton[];
}

const ConfirmationModal: FunctionComponent<IConfirmationModalProps> = ({
  title,
  subtitle,
  actions,
}) => {
  return (
    <div className='aucctus-bg-primary flex max-w-[400px] flex-col gap-4 rounded-lg p-6'>
      <div className='flex flex-grow flex-col gap-4'>
        <h1 className='aucctus-text-xl-semibold aucctus-text-primary'>
          {title}
        </h1>
        <p className='aucctus-text-md aucctus-text-secondary'>{subtitle}</p>
      </div>
      <div className='flex flex-row justify-between gap-4 self-stretch'>
        {actions.map((action, index) => (
          <button
            key={`confirmation-button-${index}`}
            className={`btn btn-${action.variant} w-1/2`}
            onClick={action.onClick}
          >
            {action.title}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ConfirmationModal;
