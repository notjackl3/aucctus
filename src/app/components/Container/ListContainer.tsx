import React from 'react';

interface IListContainerProps {
  title: string;
  items: string[];
  /**
   * If true, the list will initially be truncated (show fewer items)
   * and a "View More" button will appear.
   * Defaults to false for backward compatibility.
   */
  truncate?: boolean;
}

/**
 * A simple list container that can optionally truncate its items.
 */
const ListContainer: React.FC<IListContainerProps> = ({
  title,
  items,
  truncate = false, // default to false
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Number of items we want to show when truncated
  const DEFAULT_VISIBLE_COUNT = 2;

  // If truncate is true and we're not in the "expanded" state,
  // only show the first few items. Otherwise, show all.
  const visibleItems =
    truncate && !isExpanded ? items.slice(0, DEFAULT_VISIBLE_COUNT) : items;

  // Toggle between truncated and expanded views
  const handleToggle = () => setIsExpanded((prev) => !prev);

  return (
    <div className='inline-flex w-64 flex-col items-start justify-start gap-2'>
      <span className='aucctus-text-primary aucctus-text-sm-medium self-stretch'>
        {title}
      </span>
      <ul className='flex flex-col items-start justify-start self-stretch overflow-hidden'>
        {visibleItems.map((item) => (
          <li
            key={item.replace(/\s+/g, '-')}
            className='aucctus-text-tertiary aucctus-text-md self-stretch'
          >
            {item}
          </li>
        ))}
      </ul>

      {/* Show the toggle button only if "truncate" is true AND 
          there are more items than the DEFAULT_VISIBLE_COUNT. */}
      {truncate && items.length > DEFAULT_VISIBLE_COUNT && (
        <button
          className='mt-2 font-medium text-blue-500 hover:text-blue-700'
          onClick={handleToggle}
        >
          <span className='aucctus-text-brand-primary aucctus-text-xs-bold py-1'>
            {isExpanded ? 'View Less' : 'View More'}
          </span>
        </button>
      )}
    </div>
  );
};

export default ListContainer;
