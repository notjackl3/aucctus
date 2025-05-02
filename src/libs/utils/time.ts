export function dateFormatter(
  info: string,
  options: {
    formattingOptions?: Intl.DateTimeFormatOptions;
    dateOnly?: boolean;
  } = {
    dateOnly: false,
    formattingOptions: {},
  },
) {
  options = {
    dateOnly: false,
    formattingOptions: {},
    ...options,
  };

  const date = new Date(info);
  const now = new Date();
  const differenceInSeconds = (now.getTime() - date.getTime()) / 1000;

  if (!options.dateOnly) {
    if (differenceInSeconds < 60) {
      return 'now';
    } else if (differenceInSeconds < 3600) {
      // less than an hour
      const minutes = Math.floor(differenceInSeconds / 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (differenceInSeconds < 86400) {
      // less than 24 hours
      const hours = Math.floor(differenceInSeconds / 3600);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
  }

  // For dates older than 24 hours, use the provided date format
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options.formattingOptions,
  });
}

export function formatDate(
  date: string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  },
) {
  const formattedDate = new Date(date);
  return formattedDate.toLocaleDateString('en-US', options);
}

export function differenceInMinutes(firstDate: Date, secondDate: Date) {
  let difference = (firstDate.getTime() - secondDate.getTime()) / 1000;
  difference /= 60;
  return Math.abs(Math.round(difference));
}

export function differenceInHours(firstDate: Date, secondDate: Date) {
  let difference = (firstDate.getTime() - secondDate.getTime()) / 1000;
  difference /= 60 * 60;
  return Math.abs(Math.round(difference));
}

export function differenceInDays(firstDate: Date, secondDate: Date) {
  let difference = (firstDate.getTime() - secondDate.getTime()) / 1000;
  difference /= 60 * 60 * 24;
  return Math.abs(Math.round(difference));
}

export function differenceInMonths(firstDate: Date, secondDate: Date) {
  let difference = (firstDate.getTime() - secondDate.getTime()) / 1000;
  difference /= 60 * 60 * 24 * 30;
  return Math.abs(Math.round(difference));
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function formatDateFromTimestamp(timestamp: number) {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
