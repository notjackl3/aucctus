import { AxiosError, isAxiosError } from 'axios';
import { isError } from 'react-query';
import { IFormError } from './api/types';
import analytics from './analytics';
import { ExpiryTimeNotFoundError, TokenStructureError } from './api/customErrors';

/** Validate Email
 *
 * @param email
 * @returns
 */
export const validEmail = (email: string) => {
  return email
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    );
};

/** Validate Domain
 *
 * @param domain
 * @returns
 */
export const validDomain = (domain: string) => {
  return domain.toLowerCase().match(/^([A-Za-z0-9-]+\.([A-Za-z]{3,}|[A-Za-z]{2}\.[A-Za-z]{2}|[A-za-z]{2}))/);
};

/** Generate Random String
 *
 * @param length
 * @returns
 */
export function generateRandomString(length: number) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

export function differenceInHours(firstDate: Date, secondDate: Date) {
  let difference = (firstDate.getTime() - secondDate.getTime()) / 1000;
  difference /= 60 * 60;
  return Math.abs(Math.round(difference));
}

export const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
});

export const formatNumber = (num: number) => {
  // Ensure num is a number and format it, otherwise return empty string
  return num.toLocaleString('en-US', {
    maximumFractionDigits: 0, // Ensure no fractional digits in the formatted output
  });
};

export function parseFormError<T = object>(error: unknown | AxiosError) {
  let message = 'Unexpected Error Occurred';
  if (isAxiosError<IFormError<T>>(error)) {
    // Check if there is an error response from the server otherwise we will use the default message
    if (error.response) {
      const errorResponse = error.response.data;
      if (typeof errorResponse.error === 'string') {
        message = errorResponse.error;
      } else if (!!errorResponse.error) {
        // For now we are only going to show the first error message
        // Most errors ar caught before they reach the server
        const key = Object.keys(errorResponse.error)[0] as keyof T;
        const value = errorResponse.error[key][0];
        message = `${value.message}`;
      }
    } else {
      message = error.message;
    }
  } else if (isError(error)) {
    message = error.message;
  }
  return message;
}

export function camelCaseToTitleCase(camelCase: string) {
  if (!camelCase) {
    return '';
  }
  const words = camelCase.replace(/([A-Z])/g, ' $1').split(' ');
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export function dateCellFormatter(info: string, formattingOptions: Intl.DateTimeFormatOptions = {}) {
  return new Date(info).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...formattingOptions,
  });
}

export type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>;

export function formatLargeNumber(num: number) {
  /**
   * Formats a number with appropriate unit suffix (K, M, B, T) based on its magnitude.
   * Only shows the decimal if the number is not whole.
   *
   * @param num The number to be formatted.
   * @returns The formatted number with unit suffix.
   *
   * Example:
   *   formatNumber(1234567) // '1.2M'
   *   formatNumber(9876543210) // '9.8B'
   *   formatNumber(1000) // '1K'
   */
  const units: string[] = ['', 'K', 'M', 'B', 'T'];
  for (const unit of units) {
    if (Math.abs(num) < 1000.0) {
      if (num % 1 === 0) {
        // Number is whole
        return `$${num}${unit}`;
      } else {
        // Number is not whole, format to 1 decimal place
        return `$${parseFloat(num.toFixed(1))}${unit}`;
      }
    }
    num /= 1000.0;
  }
  // For numbers larger than a trillion, check again if it's whole or not.
  if (num % 1 === 0) {
    return `$${num}T`;
  } else {
    return `$${parseFloat(num.toFixed(1))}T`;
  }
}

export const calculatePercent = (numerator: number, denominator: number) => {
  if (!numerator || !denominator) {
    return 0;
  }
  const percent = (numerator / denominator) * 100;
  const roundedPercent = Math.round(percent);
  return roundedPercent;
};

export const removeProtocol = (source: string) => {
  const unwantedPrefix = ['https://', 'http://'];
  let d = source;
  for (const prefix of unwantedPrefix) {
    if (d.substring(0, prefix.length) === prefix) {
      d = d.slice(prefix.length);
    }
  }
  return d;
};

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const hasTokenExpired = (token: string): boolean => {
  analytics.debug('Checking token expiry...');
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

  analytics.debug('Token expiry:', new Date(exp * 1000));
  const expiryDate = new Date(exp * 1000);
  const now = new Date();

  return expiryDate <= now;
};
