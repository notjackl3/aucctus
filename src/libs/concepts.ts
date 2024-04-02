import { AssumptionType, ConceptStatus } from './api/typings';

type StatusColor = 'blue' | 'green' | 'purple' | 'pink' | 'red';

/**
 * Returns the color associated with a given concept status.
 *
 * @param status - The concept status.
 * @returns The color associated with the concept status.
 */
export function getConceptStatusColor(status: ConceptStatus): StatusColor {
  const statusColorObj: Record<ConceptStatus, StatusColor> = {
    [ConceptStatus.new]: 'blue',
    [ConceptStatus.ideating]: 'blue',
    [ConceptStatus.inReview]: 'blue',
    [ConceptStatus.commercialized]: 'green',
    [ConceptStatus.prototyping]: 'purple',
    [ConceptStatus.proofOfConcept]: 'purple',
    [ConceptStatus.minimumViableProduct]: 'pink',
    [ConceptStatus.archived]: 'red',
  };

  return statusColorObj[status];
}

type AssumptionHexColor = '#7839EE' | '#0E9384' | '#088AB2' | '#155EEF';

/**
 * Returns the active color associated with a given assumption type.
 *
 * @param assumption - The assumption type.
 * @returns The color associated with the active assumption type.
 */
export function getAssumptionActiveHexColor(assumption: AssumptionType): AssumptionHexColor {
  const assumptionColorObj: Record<AssumptionType, AssumptionHexColor> = {
    [AssumptionType.desirability]: '#7839EE',
    [AssumptionType.viability]: '#0E9384',
    [AssumptionType.feasibility]: '#088AB2',
    [AssumptionType.adaptability]: '#155EEF',
  };

  return assumptionColorObj[assumption];
}

type AssumptionBackgroundHexColor = '#ECE9FE' | '#CCFBEF' | '#CFF9FE' | '#D1E0FF';

/**
 * Returns the color associated with a given assumption type.
 *
 * @param assumption - The assumption type.
 * @returns The color associated with the assumption type.
 */
export function getAssumptionHexColor(assumption: AssumptionType): AssumptionBackgroundHexColor {
  const assumptionColorObj: Record<AssumptionType, AssumptionBackgroundHexColor> = {
    [AssumptionType.desirability]: '#ECE9FE',
    [AssumptionType.viability]: '#CCFBEF',
    [AssumptionType.feasibility]: '#CFF9FE',
    [AssumptionType.adaptability]: '#D1E0FF',
  };

  return assumptionColorObj[assumption];
}
