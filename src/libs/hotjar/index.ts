/**
 * Hotjar User Identification Service
 * @see https://help.hotjar.com/hc/en-us/articles/360038394053-How-to-Set-Up-User-Attributes
 * @see https://help.hotjar.com/hc/en-us/articles/36820006120721-Identify-API-Reference
 */

interface HotjarUserAttributes {
  email?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  role?: string;
  accountId?: string;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Identifies the current user to Hotjar for session filtering and analytics.
 * Must include userId when sending PII (email) for GDPR compliance.
 *
 * @param userId - Unique user identifier (user.uuid)
 * @param attributes - User attributes for filtering in Hotjar dashboard
 */
export const identifyHotjarUser = (
  userId: string,
  attributes: HotjarUserAttributes,
): void => {
  if (typeof window !== 'undefined' && typeof window.hj === 'function') {
    window.hj('identify', userId, attributes);
  }
};

/**
 * Clears the Hotjar user identification.
 * Call this on user logout to end the identified session.
 */
export const clearHotjarIdentity = (): void => {
  if (typeof window !== 'undefined' && typeof window.hj === 'function') {
    window.hj('identify', null);
  }
};
