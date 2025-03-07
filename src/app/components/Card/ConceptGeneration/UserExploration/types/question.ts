interface QuestionOption {
  value: string;
  label: string;
  description: string;
  icon: string;
}

interface Question {
  label: string;
  fieldType: 'multiSelect' | 'radioButton' | 'text';
  options: QuestionOption[];
}

export type QuestionEntry = [string, Question];
