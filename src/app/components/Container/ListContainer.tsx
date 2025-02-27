import React from 'react';

interface IListContainerProps {
  title: string;
  items: string[];
}

const ListContainer: React.FC<IListContainerProps> = ({ title, items }) => {
  return (
    <div className='inline-flex w-64 flex-col items-start justify-start gap-2'>
      <span className='aucctus-text-primary aucctus-text-sm-medium self-stretch'>
        {title}
      </span>
      <ul className='flex flex-col items-start justify-start self-stretch'>
        {items.map((item) => (
          <li
            key={item.replace(' ', '-')}
            className='aucctus-text-tertiary aucctus-text-md self-stretch'
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};
export default ListContainer;
