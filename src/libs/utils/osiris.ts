import { AxiosError, isAxiosError } from 'axios';
import { isError } from 'react-query';
import { IFormError } from '../api/types';

export function parseFormError<T = unknown>(error: unknown | AxiosError) {
  let message = 'Unexpected Error Occurred';
  if (isAxiosError<IFormError<T>>(error)) {
    // Check if there is an error response from the server otherwise we will use the default message
    if (error.response) {
      const errorResponse = error.response.data;
      if (typeof errorResponse.detail === 'string') {
        message = errorResponse.detail;
      } else if (!!errorResponse.detail) {
        message = errorResponse.detail
          .map((value) => value.msg)
          .filter(Boolean)
          .join('. ');
      }
    } else {
      message = error.message;
    }
  } else if (isError(error)) {
    message = error.message;
  }
  return message;
}
