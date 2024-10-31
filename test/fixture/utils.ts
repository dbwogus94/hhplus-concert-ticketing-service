import { faker } from '@faker-js/faker';

type Range = { min: number; max: number };

export function generateRandomInt(
  options: Range = { min: 1, max: 1000 },
): number {
  return faker.number.int({ ...options });
}

/**
 * 미래의 날짜를 만든다.
 * @returns
 * ex) 2024-10-31T02:29:16.293Z
 */
export function generateFutureAt(): Date {
  return faker.date.future();
}

/**
 * "YYYY-MM-DD" 문자열 형식의 미래의 날짜를 만든다.
 * @returns YYYY-MM-DD 형식의 날짜 문자열 리턴
 */
export function generateFutureDate(): string {
  return generateFutureAt().toISOString().split('T')[0];
}
