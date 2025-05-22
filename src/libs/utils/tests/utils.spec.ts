import { expect, test } from 'vitest';
import utils from '..';

describe('validEmail', () => {
  test('should return true for a valid email', () => {
    const email = 'test@example.com';
    const result = utils.string.validEmail(email);
    expect(result).toBeTruthy();
  });

  test('should return false for an invalid email', () => {
    const email = 'invalid-email';
    const result = utils.string.validEmail(email);
    expect(result).toBeFalsy();
  });
});

describe('validDomain', () => {
  test('should return true for a valid domain', () => {
    const domain = 'example.com';
    const result = utils.string.validDomain(domain);
    expect(result).toBeTruthy();
  });

  test('should return false for an invalid domain', () => {
    const domain = 'invalid-domain';
    const result = utils.string.validDomain(domain);
    expect(result).toBeFalsy();
  });
});

describe('generateRandomString', () => {
  test('should generate a random string of specified length', () => {
    const length = 10;
    const result = utils.string.generateRandomString(length);
    expect(result.length).toBe(length);
  });
});

describe('differenceInHours', () => {
  test('should calculate the difference in hours between two dates', () => {
    const firstDate = new Date('2022-01-01T00:00:00');
    const secondDate = new Date('2022-01-01T06:00:00');
    const result = utils.time.differenceInHours(firstDate, secondDate);
    expect(result).toBe(6);
  });
});

describe('dateFormatter', () => {
  it('should return "now" for a date within the last 60 seconds', () => {
    const recentDate = new Date().toISOString();
    expect(utils.time.dateFormatter(recentDate)).toBe('now');
  });

  it('should return "10 minutes ago" for a date 10 minutes ago', () => {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    expect(utils.time.dateFormatter(tenMinutesAgo)).toBe('10 minutes ago');
  });

  it('should return "2 hours ago" for a date 2 hours ago', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    expect(utils.time.dateFormatter(twoHoursAgo)).toBe('2 hours ago');
  });

  it('should return "1 hour ago" for a date 1 hour ago', () => {
    const oneHourAgo = new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString();
    expect(utils.time.dateFormatter(oneHourAgo)).toBe('1 hour ago');
  });

  it('should return "Aug 14, 2024" for a date more than 24 hours ago', () => {
    const pastDate = new Date('2023-08-14T12:00:00Z').toISOString();
    expect(utils.time.dateFormatter(pastDate)).toBe('Aug 14, 2023');
  });

  it('should return "Aug 14, 2024" with custom formatting options', () => {
    const pastDate = new Date('2023-08-14T12:00:00Z').toISOString();
    expect(
      utils.time.dateFormatter(pastDate, {
        formattingOptions: { weekday: 'long' },
      }),
    ).toBe('Monday, Aug 14, 2023');
  });

  it('should handle invalid date strings gracefully', () => {
    const invalidDate = 'invalid-date';
    expect(utils.time.dateFormatter(invalidDate)).toBe('Invalid Date');
  });
});

describe('formatter', () => {
  test('should format a number as a compact USD currency', () => {
    const number = 1000000;
    const result = utils.number.formatter.format(number);
    expect(result).toBe('$1M');
  });
});

describe('toTitleCase', () => {
  it('should convert a single word to title case', () => {
    expect(utils.string.toTitleCase('hello')).toBe('Hello');
  });

  it('should convert multiple words to title case', () => {
    expect(utils.string.toTitleCase('hello world')).toBe('Hello World');
  });

  it('should handle empty strings', () => {
    expect(utils.string.toTitleCase('')).toBe('');
  });

  it('should handle strings with mixed case', () => {
    expect(utils.string.toTitleCase('hElLo WoRLd')).toBe('Hello World');
  });

  it('should handle strings with leading and trailing spaces', () => {
    expect(utils.string.toTitleCase('  hello world  ')).toBe('  Hello World  ');
  });
});

describe('createPaginationNumbers', () => {
  it('returns only first and last pages when maxPages equals start and end pages length', () => {
    expect(utils.array.createPaginationNumbers(5, 10, 2)).toEqual([1, 10]);
  });
});
