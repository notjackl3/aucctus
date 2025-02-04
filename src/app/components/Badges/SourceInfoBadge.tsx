import React, { useEffect, useState } from 'react';
import { ISource } from '@libs/api/types';
import { useQuery } from 'react-query';
import { AucctusQueryKeys } from '@hooks/query/query-keys';
import images from '@assets/img';

interface ClearbitCompanyData {
  name: string;
}

interface SourceInfoBadgeProps {
  source: ISource;
  onClick?: () => void;
  badgeClassName?: string;
}

const SourceInfoBadge: React.FC<SourceInfoBadgeProps> = ({
  source,
  onClick,
  badgeClassName = '',
}) => {
  const getBaseUrl = (url: string): string => {
    try {
      const urlObject = new URL(url);
      return urlObject.hostname.replace(/^www\./, '');
    } catch (e) {
      return url;
    }
  };

  const [sourceTitle, setSourceTitle] = useState<string>('loading...');
  const baseUrl = getBaseUrl(source.url);

  const clearbitCompanyQuery = useQuery<ClearbitCompanyData[]>({
    queryKey: [AucctusQueryKeys.clearbitCompany, baseUrl],
    queryFn: async () => {
      const response = await fetch(
        `https://autocomplete.clearbit.com/v1/companies/suggest?query=${baseUrl}`,
      );
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
  });

  useEffect(() => {
    if (clearbitCompanyQuery?.data?.[0]?.name) {
      setSourceTitle(clearbitCompanyQuery.data[0].name);
    } else {
      setSourceTitle(getBaseUrl(source.url));
    }
  }, [clearbitCompanyQuery.data, source.url]);

  const renderSourceLogo = (source: ISource) => {
    const sourceBaseUrl = getBaseUrl(source.url);
    return (
      <div className='flex h-6 w-6 items-center justify-center overflow-hidden rounded-full border border-transparent'>
        <img
          className='h-full w-full object-contain'
          alt='source-logo'
          src={`https://logo.clearbit.com/${sourceBaseUrl || ''}`}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              images.companyLogoDefault;
          }}
        />
      </div>
    );
  };

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2 rounded-full border border-gray-200 p-1 ${badgeClassName}
      ${onClick ? 'cursor-pointer transition-all !duration-200 hover:bg-gray-100' : ''}`}
    >
      {renderSourceLogo(source)}
      <span className='pr-2 text-sm font-medium'>{sourceTitle}</span>
    </div>
  );
};

export default SourceInfoBadge;
