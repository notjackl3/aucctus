import { IConceptPage } from '../../../libs/api/typings';
import { calculatePercent } from '../../../libs/utils';

export const getConceptStagePercent = (statusCounts: IConceptPage['statusCounts']) => {
  if (!statusCounts) {
    return [];
  }
  const proofOfConceptPercent = calculatePercent(statusCounts.proofOfConcept, statusCounts.prototyping);
  const minimumViableProductPercent = calculatePercent(statusCounts.minimumViableProduct, statusCounts.proofOfConcept);
  const commercializedPercent = calculatePercent(statusCounts.commercialized, statusCounts.minimumViableProduct);
  return [proofOfConceptPercent, minimumViableProductPercent, commercializedPercent];
};

export const getConceptTotalPercents = (statusCounts: IConceptPage['statusCounts'], totalActiveConcepts: number) => {
  if (!statusCounts || !totalActiveConcepts) {
    return [];
  }

  const proofOfConceptPercent = calculatePercent(statusCounts.proofOfConcept, totalActiveConcepts);
  const minimumViableProductPercent = calculatePercent(statusCounts.minimumViableProduct, totalActiveConcepts);
  const commercializedPercent = calculatePercent(statusCounts.commercialized, totalActiveConcepts);
  return [proofOfConceptPercent, minimumViableProductPercent, commercializedPercent];
};
