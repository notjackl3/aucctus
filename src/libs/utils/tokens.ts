import {
  ExpiryTimeNotFoundError,
  TokenStructureError,
} from '../api/customErrors';

export const hasTokenExpired = (token: string): boolean => {
  // analytics.debug('Checking token expiry...');
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new TokenStructureError('Token structure incorrect');
  }

  const payload = parts[1];
  // Use atob for base64 decoding in the browser
  const decodedPayload = atob(payload);
  const payloadData = JSON.parse(decodedPayload);

  const exp = payloadData.exp;

  if (!exp) {
    throw new ExpiryTimeNotFoundError('Expiry time not found in token.');
  }

  // analytics.debug('Token expiry:', new Date(exp * 1000));
  const expiryDate = new Date(exp * 1000);
  const now = new Date();

  return expiryDate <= now;
};
