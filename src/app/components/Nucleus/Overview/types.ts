import { ProposedAddition } from '../NucleusPage/types';

export interface OverviewProps {
  companyContext: any;
  disruptionRisk: number;
  activeTimelineTab: string;
  setActiveTimelineTab: (tab: string) => void;
  shortTermCarousel: number;
  setShortTermCarousel: (index: number) => void;
  midTermCarousel: number;
  setMidTermCarousel: (index: number) => void;
  longTermCarousel: number;
  setLongTermCarousel: (index: number) => void;
  expandedCategory: string | null;
  setExpandedCategory: (categoryId: string | null) => void;
  proposedAdditions: ProposedAddition[];
}

export interface RiskFactor {
  text: string;
  type: 'tailwind' | 'headwind' | 'watch';
}
