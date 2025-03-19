export function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2') // Add an underscore between camelCase words
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/-/g, '_') // Replace hyphens with underscores
    .toLowerCase(); // Convert the entire string to lowercase
}

export function camelCaseToTitleCase(camelCase: string) {
  if (!camelCase) {
    return '';
  }
  const words = camelCase.replace(/([A-Z])/g, ' $1').split(' ');
  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

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

/**
 * Check if a string might contain markdown
 * @param str
 * @returns boolean
 */
export const mightContainMarkdown = (str: string): boolean => {
  const markdownPatterns = [
    /^#{1,6}\s/m,
    /\*\*[^*]+\*\*/,
    /_[^_]+_/,
    /\[[^\]]*\]\([^)]+\)/,
    /!\[[^\]]*\]\([^)]+\)/,
    /```[^`]*```/,
    /`[^`]+`/,
  ];
  return markdownPatterns.some((regex) => regex.test(str));
};

/** Convert any string to Title Case
 *
 * @param str
 * @returns
 */
export function toTitleCase(str: string): string {
  if (!str) {
    return '';
  }
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function toCamelCase(input: string): string {
  return input
    .toLowerCase()
    .split('_')
    .map((word, index) =>
      index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join('');
}

/** Generate Random String
 *
 * @param length
 * @returns
 */
export function generateRandomString(length: number) {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

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
  return domain
    .toLowerCase()
    .match(
      /^([A-Za-z0-9-]+\.([A-Za-z]{3,}|[A-Za-z]{2}\.[A-Za-z]{2}|[A-za-z]{2}))/,
    );
};

export const queryStringGenerator = (root: string, options?: object) => {
  if (!options) return root;

  const query = Object.entries(options)
    .filter(
      ([, value]) => value !== undefined && value !== null && value !== '',
    ) // Filter out undefined and null values
    .map(([key, value]) => `${toSnakeCase(key)}=${value as string}`) // Convert to query params
    .join('&');

  if (query) {
    return `${root}?${query}`;
  }
  return root;
};

/**
 * Converts an integer to its word representation
 * @param num The integer to convert
 * @returns The word representation of the number
 */
export function numberToWord(num: number, zeroWord?: string): string {
  const units = [
    zeroWord || 'zero',
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
    'ten',
    'eleven',
    'twelve',
    'thirteen',
    'fourteen',
    'fifteen',
    'sixteen',
    'seventeen',
    'eighteen',
    'nineteen',
  ];
  const tens = [
    '',
    '',
    'twenty',
    'thirty',
    'forty',
    'fifty',
    'sixty',
    'seventy',
    'eighty',
    'ninety',
  ];

  // Handle numbers from 0-19
  if (num < 20) {
    return units[num];
  }

  // Handle numbers from 20-99
  if (num < 100) {
    const ten = Math.floor(num / 10);
    const unit = num % 10;
    return unit === 0 ? tens[ten] : `${tens[ten]}-${units[unit]}`;
  }

  // Handle numbers from 100-999
  if (num < 1000) {
    const hundred = Math.floor(num / 100);
    const remainder = num % 100;
    return remainder === 0
      ? `${units[hundred]} hundred`
      : `${units[hundred]} hundred and ${numberToWord(remainder)}`;
  }

  // Handle numbers from 1000-9999
  if (num < 10000) {
    const thousand = Math.floor(num / 1000);
    const remainder = num % 1000;
    return remainder === 0
      ? `${units[thousand]} thousand`
      : `${units[thousand]} thousand ${remainder < 100 ? 'and ' : ''}${numberToWord(remainder)}`;
  }

  // For larger numbers, return the number itself
  return num.toString();
}

/**
 * Capitalizes the first letter of a string
 * @param str The string to capitalize
 * @returns The string with its first letter capitalized
 */
export function capitalize(str: string): string {
  if (!str || str.length === 0) {
    return '';
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function pluralize(str: string, count: number): string {
  return count === 1 ? str : `${str}s`;
}
