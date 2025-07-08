import { jwtDecode } from 'jwt-decode';

export interface JWTPayload {
  exp: number;
  iat: number;
  sub: string;
  [key: string]: any;
}

export class TokenExpiredError extends Error {
  constructor(message: string = 'Token has expired') {
    super(message);
    this.name = 'TokenExpiredError';
  }
}

export class InvalidTokenError extends Error {
  constructor(message: string = 'Invalid token format') {
    super(message);
    this.name = 'InvalidTokenError';
  }
}

/**
 * Decode JWT token and return payload
 */
export function decodeToken(token: string): JWTPayload {
  try {
    return jwtDecode<JWTPayload>(token);
  } catch (error) {
    throw new InvalidTokenError('Failed to decode JWT token');
  }
}

/**
 * Check if token is expired
 * @param token - JWT token string
 * @param bufferSeconds - Buffer time in seconds before actual expiry (default: 60)
 */
export function isTokenExpired(
  token: string,
  bufferSeconds: number = 60,
): boolean {
  try {
    const decoded = decodeToken(token);
    const currentTime = Math.floor(Date.now() / 1000);
    const expiryTime = decoded.exp - bufferSeconds;

    return currentTime >= expiryTime;
  } catch (error) {
    // If we can't decode the token, consider it expired
    return true;
  }
}

/**
 * Get token expiration time in seconds
 */
export function getTokenExpirationTime(token: string): number {
  const decoded = decodeToken(token);
  return decoded.exp;
}

/**
 * Get time until token expires in seconds
 */
export function getTimeUntilExpiry(token: string): number {
  const decoded = decodeToken(token);
  const currentTime = Math.floor(Date.now() / 1000);
  return Math.max(0, decoded.exp - currentTime);
}

/**
 * Check if token needs refresh (within buffer time)
 */
export function shouldRefreshToken(
  token: string,
  bufferSeconds: number = 300,
): boolean {
  try {
    const decoded = decodeToken(token);
    const currentTime = Math.floor(Date.now() / 1000);
    const refreshTime = decoded.exp - bufferSeconds;

    return currentTime >= refreshTime;
  } catch (error) {
    return true;
  }
}
