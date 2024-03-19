import { FunctionComponent, useState } from 'react';

import styles from './styles/tablePagination.module.scss';
import Icon from '../Icon';

export interface TablePaginationProps {
  totalPages: number;
  activePage: number;
  setActivePage: (pageNumber: number) => void;
}

const TablePagination: FunctionComponent<TablePaginationProps> = ({ totalPages, activePage, setActivePage }) => {
  const [startPage, setStartPage] = useState(1);
  const MAX_PAGES_PER_PAGE = 10;

  const nextPage = () => {
    if (activePage === totalPages) {
      return;
    }
    if (activePage === startPage + MAX_PAGES_PER_PAGE - 1) {
      setStartPage(startPage + MAX_PAGES_PER_PAGE);
    }
    setActivePage(activePage + 1);
  };

  const previousPage = () => {
    if (activePage === 1) {
      return;
    }
    if (activePage - 1 < startPage) {
      setStartPage(Math.max(activePage - MAX_PAGES_PER_PAGE, 1));
    }
    setActivePage(Math.max(activePage - 1, 1));
  };

  const handlePageClick = (pageNumber: number) => {
    setActivePage(pageNumber);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = startPage; i <= Math.min(startPage + MAX_PAGES_PER_PAGE - 1, totalPages); i++) {
      pageNumbers.push(
        <button
          key={`table-page-${i}`}
          className={`${styles.page} ${activePage === i ? styles.active : ''}`}
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
