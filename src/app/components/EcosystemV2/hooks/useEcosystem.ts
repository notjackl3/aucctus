import { useMemo } from 'react';
import { useQuery } from 'react-query';
import api from '@libs/api';
import type {
  IEcosystemCompany,
  IEcosystemPrediction,
  IEcosystemProduct,
  IEcosystemV2Response,
  ISource,
} from '@libs/api/types';

export interface StrategicTag {
  tag: string;
  confidence: number;
  reason: string;
}

export interface Company {
  id: number;
  name: string;
  type: 'incumbent' | 'startup';
  foundedYear: number;
  headquarters: string;
  competitorScore: number;
  establishedScore: number;
  companySizeScore: number;
  brandColor: string;
  logoType: 'image' | 'text';
  logoUrl?: string;
  logoText?: string;
  product: string;
  differentiator: string;
  website: string;
  description: string;
  competitiveAdvantage: string;
  strategicTags?: StrategicTag[];
  relevantProducts: Array<Product>;
  recommendation: 'monitor' | 'partner' | 'compete';
  recommendationReasoning: string;
}

export interface Product {
  id: number;
  name: string;
  company: string;
  image: string;
  price: string;
  format: string;
  differentiator: string;
  strength: number;
  tags: string[];
  url: string;
}

export interface Headwind {
  id: number;
  description: string;
}

export interface Tailwind {
  id: number;
  description: string;
}

export interface Crowdedness {
  lowValue: number;
  highValue: number;
  directCompetitors: number;
}

export interface FuturePrediction {
  id: number;
  title: string;
  description: string;
  category: string;
  categoryIcon: string;
  sources: ISource[];
}

export interface EcosystemCompanyData {
  ecosystemData: Company[];
  headwinds: Headwind[];
  tailwinds: Tailwind[];
  crowdedness: Crowdedness;
  futurePredictions: FuturePrediction[];
  isLoading: boolean;
  error: unknown;
  needsUpgrade?: boolean;
}

const EMPTY_STATE: Omit<
  EcosystemCompanyData,
  'isLoading' | 'error' | 'needsUpgrade'
> = {
  ecosystemData: [],
  headwinds: [],
  tailwinds: [],
  crowdedness: {
    lowValue: 0,
    highValue: 100,
    directCompetitors: 0,
  },
  futurePredictions: [],
};

const buildAdvantageCopy = (company: IEcosystemCompany) => {
  const base = company.competitiveAdvantage || company.differentiator;
  const sourceSet = new Set<string>();

  company.competitiveAdvantages?.forEach((advantage) => {
    advantage.sources?.forEach((source) => sourceSet.add(source.url));
  });

  if (!sourceSet.size) {
    return base;
  }

  return `${base}\n\nSources: ${Array.from(sourceSet).join(', ')}`;
};

const mapProduct = (
  product: IEcosystemProduct,
  companyName: string,
): Product => ({
  id: product.id,
  name: product.name,
  company: companyName,
  image: product.image || '',
  price: product.price,
  format: product.format,
  differentiator: product.differentiator,
  strength: product.strength,
  tags: product.tags,
  url: product.url,
});

const mapCompany = (company: IEcosystemCompany): Company => ({
  id: company.id,
  name: company.name,
  type: company.type,
  foundedYear: company.foundedYear,
  headquarters: company.headquarters,
  competitorScore: company.x,
  establishedScore: company.y,
  companySizeScore: company.size,
  brandColor: company.brandColor || '#111827',
  logoType: company.logoType,
  logoUrl: company.logoUrl || undefined,
  logoText: company.logoText || undefined,
  product: company.product,
  differentiator: company.differentiator,
  website: company.website,
  description: company.description,
  competitiveAdvantage: buildAdvantageCopy(company),
  strategicTags: company.strategicTags || undefined,
  relevantProducts: (company.relevantProducts || []).map((product) =>
    mapProduct(product, company.name),
  ),
  recommendation: company.recommendation,
  recommendationReasoning: company.recommendationReasoning,
});

export const useEcosystem = (conceptId: string): EcosystemCompanyData => {
  const { data, isLoading, error } = useQuery<IEcosystemV2Response>({
    queryKey: ['ecosystem-v2', conceptId],
    queryFn: () => api.marketScan.getEcosystemV2(conceptId),
    enabled: Boolean(conceptId),
    retry: false, // Don't retry on 404 - data isn't ready yet
    refetchInterval: (data) => {
      // If concept needs upgrade, stop polling
      if (data?.needsUpgrade) return false;
      // If we have data, stop polling
      if (data && data.ecosystemData.length > 0) return false;
      // If no data yet, poll every 3 seconds
      return 3000;
    },
    refetchIntervalInBackground: true,
    onError: () => {
      // Suppress errors - component will handle the upgrade state via needsUpgrade flag
    },
  });

  const ecosystemData = useMemo(() => {
    if (!data) {
      return EMPTY_STATE;
    }

    return {
      ecosystemData: data.ecosystemData.map(mapCompany),
      headwinds: data.headwinds,
      tailwinds: data.tailwinds,
      crowdedness: {
        lowValue: data.crowdedness.lowValue,
        highValue: data.crowdedness.highValue,
        directCompetitors:
          data.crowdedness.score || data.crowdedness.directCompetitors,
      },
      futurePredictions: data.futurePredictions.map(
        (prediction: IEcosystemPrediction) => ({
          id: prediction.id,
          title: prediction.title,
          description: prediction.description,
          category: prediction.category,
          categoryIcon: prediction.categoryIcon || 'sparkles',
          sources: prediction.sources || [],
        }),
      ),
    };
  }, [data]);

  const isGenerating =
    Boolean(data) &&
    !data?.needsUpgrade &&
    (data?.ecosystemData || []).length === 0;

  return {
    ...ecosystemData,
    isLoading: isLoading || (!data && !error) || isGenerating,
    error,
    needsUpgrade: data?.needsUpgrade,
  };
};
