import { IConceptSeedAttribute } from '../../../libs/api/types';

export interface ConceptIgnitionInput extends IConceptSeedAttribute {
  placeholder: string;
  rows?: number;
  fieldType: 'input' | 'textarea';
}

export const INITIAL_EXPANDING_IDEA: ConceptIgnitionInput[] = [
  {
    question: 'DESCRIBE',
    placeholder: 'I want to leverage our network of retail stores to deliver healthcare services',
    answer: '',
    rows: 2,
    fieldType: 'textarea',
  },
  {
    question: 'PROBLEM',
    placeholder: 'Busy customers lack healthcare access and the time to juggle their to-do list.',
    answer: '',
    rows: 2,
    fieldType: 'textarea',
  },
  {
    question: 'CUSTOMER',
    placeholder: 'Time-strapped consumers in suburban areas who need to maximize time.',
    answer: '',
    rows: 2,
    fieldType: 'textarea',
  },
  {
    question: 'SUCCESS',
    placeholder: '$15M in new revenue in 24 months.',
    answer: '',
    rows: 1,
    fieldType: 'textarea',
  },
];

export const INITIAL_NEW_OPPORTUNITY: ConceptIgnitionInput[] = [
  {
    question: 'TARGET',
    placeholder: 'Healthcare services',
    answer: '',
    fieldType: 'input',
  },
  {
    question: 'PROBLEM',
    placeholder: 'Customers struggle to be assigned a family doctor and access care quickly',
    answer: '',
    rows: 2,
    fieldType: 'textarea',
  },
  {
    question: 'INTEREST',
    placeholder: 'We have broad reach across the country and have experience training workforces',
    answer: '',
    rows: 3,
    fieldType: 'textarea',
  },
  {
    question: 'SUCCESS',
    placeholder: 'Create a new revenue stream and increase customer satisfaction by 10%',
    answer: '',
    rows: 2,
    fieldType: 'textarea',
  },
];
