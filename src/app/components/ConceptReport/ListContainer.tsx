import React from 'react';

interface IListContainerProps {
  title: string;
  items: string[];
}

const ListContainer: React.FC<IListContainerProps> = ({ title, items }) => {
  return (
    <div className='inline-flex w-64 flex-col items-start justify-start gap-2'>
      <span className="font-['DM Sans'] self-stretch text-sm font-medium leading-tight text-indigo-900">{title}</span>
      <ul className='flex flex-col items-start justify-start self-stretch'>
        {items.map((item) => (
          <li
            key={item.replace(' ', '-')}
            className="font-['DM Sans'] self-stretch text-base font-normal leading-normal text-gray-500"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};
export default ListContainer;
