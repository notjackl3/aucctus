import { AxiosError, isAxiosError } from 'axios';
import { IFormError } from './api/typings/avxisi';
import { isError } from 'react-query';

/** Validate Email
 *
 * @param email
 * @returns
 */
export const validEmail = (email: string) => {
  return email
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
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

export function parseFormError<T = object>(error: unknown | AxiosError) {
  let message = 'Unexpected Error Occurred';
  if (isAxiosError<IFormError<T>>(error)) {
    // Check if there is an error response from the server otherwise we will use the default message
    if (error.response) {
      const errorResponse = error.response.data;
      if (typeof errorResponse.error === 'string') {
        message = errorResponse.error;
      } else {
        // For now we are only going to show the first error message
        // Most errors ar caught before they reach the server
        const key = Object.keys(errorResponse.error)[0] as keyof T;
        const value = errorResponse.error[key][0];
        message = `${String(key)}: ${value.message}`;
      }
    } else {
      message = error.message;
    }
  } else if (isError(error)) {
    message = error.message;
  }
  return message;
}

/**
 * Convert snake_case to Title Case
 * @param snakeCase - snake_case string
 * @returns
 */
export function snakeCaseToTitleCase(snakeCase: string) {
  return snakeCase
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
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
