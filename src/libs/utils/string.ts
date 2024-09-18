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
