import { FunctionComponent, useState } from 'react';

import styles from './styles/tablePagination.module.scss';
import Icon from '../Icon';

export interface TablePaginationProps {
  totalPages: number;
  page: number;
  setPage: (pageNumber: number) => void;
}

const TablePagination: FunctionComponent<TablePaginationProps> = ({ totalPages, page, setPage }) => {
  const [startPage, setStartPage] = useState(1);
  const MAX_PAGES_PER_PAGE = 10;

  const nextPage = () => {
    if (page === totalPages) {
      return;
    }
    if (page === startPage + MAX_PAGES_PER_PAGE - 1) {
      setStartPage(startPage + MAX_PAGES_PER_PAGE);
    }
    setPage(page + 1);
  };

  const previousPage = () => {
    if (page === 1) {
      return;
    }
    if (page - 1 < startPage) {
      setStartPage(Math.max(page - MAX_PAGES_PER_PAGE, 1));
    }
    setPage(Math.max(page - 1, 1));
  };

  const handlePageClick = (pageNumber: number) => {
    setPage(pageNumber);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = startPage; i <= Math.min(startPage + MAX_PAGES_PER_PAGE - 1, totalPages); i++) {
      pageNumbers.push(
        <button
          key={`table-page-${i}`}
          className={`${styles.page} ${page === i ? styles.active : ''}`}
          onClick={() => handlePageClick(i)}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  };

  return (
    <div className={styles.tablePagination}>
      <button className={styles.button} onClick={previousPage}>
        <Icon variant="arrowLeft" width={20} height={20} />
        Previous
      </button>
      <div className={styles.pageContainer}>{renderPageNumbers()}</div>
      <button className={styles.button} onClick={nextPage}>
        Next
        <Icon variant="arrowRight" width={20} height={20} />
      </button>
    </div>
  );
};

export default TablePagination;
