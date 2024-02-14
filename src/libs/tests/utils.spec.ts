import { validEmail, validDomain, generateRandomString, differenceInHours, formatter } from '../utils';
import { expect, test } from 'vitest';

describe('validEmail', () => {
  test('should return true for a valid email', () => {
    const email = 'test@example.com';
    const result = validEmail(email);
    expect(result).toBeTruthy();
  });

  test('should return false for an invalid email', () => {
    const email = 'invalid-email';
    const result = validEmail(email);
    expect(result).toBeFalsy();
  });
});

describe('validDomain', () => {
  test('should return true for a valid domain', () => {
    const domain = 'example.com';
    const result = validDomain(domain);
    expect(result).toBeTruthy();
  });

  test('should return false for an invalid domain', () => {
    const domain = 'invalid-domain';
    const result = validDomain(domain);
    expect(result).toBeFalsy();
  });
});

describe('generateRandomString', () => {
  test('should generate a random string of specified length', () => {
    const length = 10;
    const result = generateRandomString(length);
    expect(result.length).toBe(length);
  });
});

describe('differenceInHours', () => {
  test('should calculate the difference in hours between two dates', () => {
    const firstDate = new Date('2022-01-01T00:00:00');
    const secondDate = new Date('2022-01-01T06:00:00');
    const result = differenceInHours(firstDate, secondDate);
    expect(result).toBe(6);
  });
});

describe('formatter', () => {
  test('should format a number as a compact USD currency', () => {
    const number = 1000000;
    const result = formatter.format(number);
    expect(result).toBe('$1M');
  });
});
