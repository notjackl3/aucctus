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
import { getLogoUrl } from '@libs/utils/source';

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
  nextSteps?: string[];

  // Metric fields
  revenue?: number | null;
  revenueSourceType?: 'direct' | 'ai_reasoning' | 'unknown' | null;
  revenueSourceLabel?: string | null;
  revenueSourceUrl?: string | null;
  revenueAiExplanation?: string | null;

  employees?: number | null;
  employeesSourceType?: 'direct' | 'ai_reasoning' | 'unknown' | null;
  employeesSourceLabel?: string | null;
  employeesSourceUrl?: string | null;
  employeesAiExplanation?: string | null;

  funding?: number | null;
  fundingSourceType?: 'direct' | 'ai_reasoning' | 'unknown' | null;
  fundingSourceLabel?: string | null;
  fundingSourceUrl?: string | null;
  fundingAiExplanation?: string | null;

  parentCompany?: string | null;
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
  score: number;
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
    score: 0,
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

/**
 * Converts Clearbit logo URLs to Logo.dev URLs
 * If the URL is not a Clearbit URL, returns it as-is
 */
const convertLogoUrl = (
  logoUrl: string | null | undefined,
): string | undefined => {
  if (!logoUrl) return undefined;

  // Check if it's a Clearbit logo URL
  const clearbitMatch = logoUrl.match(/^https?:\/\/logo\.clearbit\.com\/(.+)$/);
  if (clearbitMatch) {
    const domain = clearbitMatch[1];
    return getLogoUrl(domain);
  }

  return logoUrl;
};

const mapCompany = (
  company: IEcosystemCompany,
  oldestYear: number,
  currentYear: number,
): Company => {
  // Calculate establishedScore based on founded year
  // 0 = oldest (top), 100 = newest (bottom)
  const yearRange = currentYear - oldestYear;
  const establishedScore =
    yearRange > 0 ? ((company.foundedYear - oldestYear) / yearRange) * 100 : 50; // Default to middle if all companies same year

  return {
    id: company.id,
    name: company.name,
    type: company.type,
    foundedYear: company.foundedYear,
    headquarters: company.headquarters,
    competitorScore: company.x,
    establishedScore,
    companySizeScore: company.size,
    brandColor: company.brandColor || '#111827',
    logoType: company.logoType,
    logoUrl: convertLogoUrl(company.logoUrl),
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
    nextSteps: company.nextSteps || [],
    // Metric fields
    revenue: company.revenue,
    revenueSourceType: company.revenueSourceType,
    revenueSourceLabel: company.revenueSourceLabel,
    revenueSourceUrl: company.revenueSourceUrl,
    revenueAiExplanation: company.revenueAiExplanation,
    employees: company.employees,
    employeesSourceType: company.employeesSourceType,
    employeesSourceLabel: company.employeesSourceLabel,
    employeesSourceUrl: company.employeesSourceUrl,
    employeesAiExplanation: company.employeesAiExplanation,
    funding: company.funding,
    fundingSourceType: company.fundingSourceType,
    fundingSourceLabel: company.fundingSourceLabel,
    fundingSourceUrl: company.fundingSourceUrl,
    fundingAiExplanation: company.fundingAiExplanation,
    parentCompany: company.parentCompany,
  };
};

export const useEcosystem = (conceptId: string): EcosystemCompanyData => {
  const { data, isLoading, error } = useQuery<IEcosystemV2Response>({
    queryKey: ['ecosystem-v2', conceptId],
    queryFn: () => api.marketScan.getEcosystemV2(conceptId),
    enabled: Boolean(conceptId),
    retry: false, // Don't retry on 404 - data isn't ready yet
    staleTime: 1000 * 60 * 5, // 5 minutes - same as trends query
    cacheTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus - prevents jarring refresh
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

    // Calculate oldest year and current year for establishedScore calculation
    const currentYear = new Date().getFullYear();
    const oldestYear =
      data.ecosystemData.length > 0
        ? Math.min(...data.ecosystemData.map((c) => c.foundedYear))
        : currentYear;

    return {
      ecosystemData: data.ecosystemData.map((company) =>
        mapCompany(company, oldestYear, currentYear),
      ),
      headwinds: data.headwinds,
      tailwinds: data.tailwinds,
      crowdedness: {
        score: data.crowdedness.score,
        directCompetitors: data.crowdedness.directCompetitors,
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
