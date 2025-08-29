export type CategoryState = 'validated' | 'new-details' | 'needs-input';
export type QuestionState = 'validated' | 'new-detail' | 'needs-input';

export interface StatusDropdownProps {
  currentStatus: CategoryState | QuestionState;
  onStatusChange: (status: CategoryState | QuestionState) => void;
  dropdownId: string;
  isCategory?: boolean;
  activeDropdown: string | null;
  setActiveDropdown: (id: string | null) => void;
  compact?: boolean;
}
