import { Table } from '@tanstack/react-table';
import {
  ConceptSort,
  ConceptStatus,
  IConcept,
  IUser,
} from '../../../libs/api/types';
import { Dispatch, SetStateAction } from 'react';

export interface IConceptFilterOptions {
  status: Set<ConceptStatus>;
  createdBy?: IUser;
  search?: string;
  sort?: ConceptSort;
}

export interface UseConceptBankResult {
  isLoading: boolean;
  numberOfPages: number;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  table: Table<IConcept>;
  updateTableFiltering: (value: Partial<IConceptFilterOptions>) => void;
  resetFilter: () => void;
  filterOptions: IConceptFilterOptions;
  handleRowClick: (rowId: string) => void;
}

export function useConceptBank(
  externalFilterOptions?: IConceptFilterOptions,
  externalUpdateTableFiltering?: (
    value: Partial<IConceptFilterOptions>,
  ) => void,
): UseConceptBankResult;
