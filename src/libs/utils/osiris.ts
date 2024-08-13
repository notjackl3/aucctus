import { AxiosError, isAxiosError } from 'axios';
import { isError } from 'react-query';
import { IFormError } from '../api/types';

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
