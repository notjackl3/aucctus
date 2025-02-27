import { FunctionComponent, useState } from 'react';

import { Icon } from '@components';
import styles from './styles/tablePagination.module.scss';

export interface TablePaginationProps {
  totalPages: number;
  page: number;
  variant: 'client' | 'server';
  setPage: (pageNumber: number) => void;
  nextPageClient?: () => void;
  previousPageClient?: () => void;
  isNextPageDisabled?: boolean;
  isPreviousPageDisabled?: boolean;
}

const TablePagination: FunctionComponent<TablePaginationProps> = ({
  variant,
  totalPages,
  page,
  setPage,
  nextPageClient,
  previousPageClient,
  isNextPageDisabled,
  isPreviousPageDisabled,
}) => {
  const [startPage, setStartPage] = useState(1);
  const MAX_PAGES_PER_PAGE = 10;

  const manualNextPage = () => {
    if (page === totalPages) {
      return;
    }
    if (page === startPage + MAX_PAGES_PER_PAGE - 1) {
      setStartPage(startPage + MAX_PAGES_PER_PAGE);
    }
    setPage(page + 1);
  };

  const manualPreviousPage = () => {
    if (page === 1) {
      return;
    }
    if (page - 1 < startPage) {
      setStartPage(Math.max(page - MAX_PAGES_PER_PAGE, 1));
    }
    setPage(Math.max(page - 1, 1));
  };

  const nextPage = () => {
    switch (variant) {
      case 'client':
        nextPageClient && nextPageClient();
        return;
      case 'server':
        manualNextPage();
    }
  };

  const previousPage = () => {
    switch (variant) {
      case 'client':
        previousPageClient && previousPageClient();
        return;
      case 'server':
        manualPreviousPage();
    }
  };

  const handlePageClick = (pageNumber: number) => {
    switch (variant) {
      case 'client':
        setPage(Math.max(pageNumber - 1, 0));
        return;
      case 'server':
        setPage(pageNumber);
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (
      let i = startPage;
      i <= Math.min(startPage + MAX_PAGES_PER_PAGE - 1, totalPages);
      i++
    ) {
      pageNumbers.push(
        <button
          key={`table-page-${i}`}
          className={`${styles.page} ${page === i ? styles.active : ''}`}
          onClick={() => handlePageClick(i)}
        >
          {i}
        </button>,
      );
    }
    return pageNumbers;
  };

  return (
    <div className={styles.tablePagination}>
      <button
        className='btn btn-light'
        onClick={previousPage}
        disabled={isPreviousPageDisabled}
        aria-label='Previous Page'
      >
        <Icon variant='arrowleft' className={'stroke-yellow-500'} />
        Previous
      </button>
      <div className={styles.pageContainer}>{renderPageNumbers()}</div>
      <button
        className='btn btn-light'
        onClick={nextPage}
        disabled={isNextPageDisabled}
        aria-label='Next Page'
      >
        Next
        <Icon variant='arrowright' className={'stroke-gray-light-900'} />
      </button>
    </div>
  );
};

export default TablePagination;
