import utils from '@libs/utils';
import classNames from 'classnames';
import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface IPaginationProps {
  page: number;
  numberOfPages: number;
  onPageChange: (page: number) => void;
  hideNavText?: boolean;
}

const MAX_PAGINATION_BUTTON = 7;

const Pagination: React.FC<IPaginationProps> = ({
  page,
  numberOfPages,
  onPageChange,
  hideNavText = false,
}) => {
  const handlePageChange = React.useCallback(
    (value: number) =>
      onPageChange(utils.number.clamp(value, 1, numberOfPages)),
    [numberOfPages, onPageChange],
  );

  const renderPageNumbers = React.useCallback(() => {
    const pageNumbers = utils.array.createPaginationNumbers(
      page,
      numberOfPages,
      MAX_PAGINATION_BUTTON,
    );
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
    <div className='inline-flex h-[68px] w-full items-center justify-between self-end px-6 pb-4 pt-3'>
      <button
        className='btn btn-light'
        onClick={() => handlePageChange(page - 1)}
        aria-label='Previous Page'
        disabled={page <= 1}
      >
        <ArrowLeft size={20} />
        {!hideNavText ? 'Previous' : ''}
      </button>
      <div className='inline-flex items-end gap-2'>{renderPageNumbers()}</div>
      <button
        className='btn btn-light'
        onClick={() => handlePageChange(page + 1)}
        disabled={page >= numberOfPages}
        aria-label='Next Page'
      >
        {!hideNavText ? 'Next' : ''}
        <ArrowRight size={20} />
      </button>
    </div>
  );
};

const Ellipsis: React.FC = () => {
  return <span className='btn btn-light btn-no-border btn-no-hover'>...</span>;
};

interface PageNumberProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  page: number;
}

// eslint-disable-next-line react/display-name
const PageNumber = React.forwardRef<HTMLButtonElement, PageNumberProps>(
  ({ page, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={classNames('btn btn-light btn-no-border', className)}
        {...props}
      >
        {page}
      </button>
    );
  },
);

export default Pagination;
