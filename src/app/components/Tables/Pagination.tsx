import { Icon } from '@components';
import utils from '@libs/utils';
import classNames from 'classnames';
import React from 'react';

interface IPaginationProps {
  page: number;
  numberOfPages: number;
  onPageChange: (page: number) => void;
}

const MAX_PAGINATION_BUTTON = 7;

const Pagination: React.FC<IPaginationProps> = ({ page, numberOfPages, onPageChange }) => {
  const handlePageChange = React.useCallback(
    (value: number) => onPageChange(utils.number.clamp(value, 1, numberOfPages)),
    [numberOfPages, onPageChange],
  );

  const renderPageNumbers = React.useCallback(() => {
    const pageNumbers = utils.array.createPaginationNumbers(page, numberOfPages, MAX_PAGINATION_BUTTON);
    return pageNumbers.map((value) =>
      value == '...' ? (
        <Ellipsis key={utils.string.generateRandomString(5)} />
      ) : (
        <PageNumber
          key={utils.string.generateRandomString(5)}
          page={value}
          disabled={value == page}
          onClick={() => onPageChange(value)}
        />
      ),
    );
  }, [numberOfPages, onPageChange, page]);

  return (
    <>
      <button
        className='btn btn-light'
        onClick={() => handlePageChange(page - 1)}
        aria-label='Previous Page'
        disabled={page <= 1}
      >
        <Icon variant='arrowleft' width={20} height={20} />
        Previous
      </button>
      <div className='inline-flex items-end gap-2'>{renderPageNumbers()}</div>
      <button
        className='btn btn-light'
        onClick={() => handlePageChange(page + 1)}
        disabled={page >= numberOfPages}
        aria-label='Next Page'
      >
        Next
        <Icon variant='arrowright' width={20} height={20} />
      </button>
    </>
  );
};

const Ellipsis: React.FC = () => {
  return <span className='btn btn-light btn-no-border btn-no-hover'>...</span>;
};

interface PageNumberProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  page: number;
}

const PageNumber = React.forwardRef<HTMLButtonElement, PageNumberProps>(({ page, className, ...props }, ref) => {
  return (
    <button ref={ref} className={classNames('btn btn-light btn-no-border', className)} {...props}>
      {page}
    </button>
  );
});

export default Pagination;
