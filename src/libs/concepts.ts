/**
 * Returns the color associated with a given concept status.
 *
 * @param status - The concept status.
 * @returns The color associated with the concept status.
 */
import { ConceptStatus } from './api/typings';

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
