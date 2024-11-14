import { faker } from '@faker-js/faker';
import { Effect } from 'effect';
import { SeatStatus } from 'src/domain/concert/performance';
import { seedWithEffect } from './seed-effect-run';

const concertInsertSql = `
INSERT INTO concert 
(name, description, startDate, endDate, createdAt, updatedAt) 
VALUES ?
`;

// Concert 데이터 생성
const generateConcert = Effect.sync(() => {
  const startDate = faker.date.future();
  const endDate = faker.date.future({ years: 0.5, refDate: startDate }); // startDate 기준으로 6개월 이내

  return [
    faker.commerce.productName(), // name
    faker.lorem.paragraph(), // description
    startDate, // startDate
    endDate, // endDate
    new Date(), // createdAt
    new Date(), // updatedAt
  ];
});

// Performance 데이터 생성
const performanceInsertSql = `
  INSERT INTO performance 
    (openDate, startAt, concertId, createdAt, updatedAt) 
  VALUES ?
`;

const generatePerformance = (concertIds: number[]) =>
  Effect.sync(() => {
    const startAt = faker.date.future();
    const openDate = faker.date.recent({ days: 7, refDate: startAt });

    return [
      openDate, // openDate
      startAt, // startAt
      faker.helpers.arrayElement(concertIds), // concertId
      new Date(), // createdAt
      new Date(), // updatedAt
    ];
  });

// Seat 데이터 생성
const generateSeat = (performanceIds: number[]) =>
  Effect.sync(() => {
    return [
      faker.number.int({ min: 1, max: 100 }), // position
      faker.number.int({ min: 50000, max: 150000 }), // amount
      faker.helpers.arrayElement([
        SeatStatus.AVAILABLE,
        SeatStatus.RESERVED,
        SeatStatus.BOOKED,
      ]), // status
      faker.helpers.arrayElement(performanceIds), // performanceId
      0, // version
      new Date(), // createdAt
      new Date(), // updatedAt
    ];
  });

const seatInsertSql = `
  INSERT INTO seat 
    (position, amount, status, performanceId, version, createdAt, updatedAt) 
  VALUES ?
`;

// 콘서트 데이터 생성 - 10개
const totalConcert = 10;
seedWithEffect(concertInsertSql, generateConcert, {
  batchSize: totalConcert,
  concurrentCount: 1,
  totalCount: totalConcert,
}).catch(console.error);

// 공연 데이터 생성 -  500개
const concertIds = Array.from({ length: totalConcert }, (_, i) => i + 1);
const totalPerformance = 50 * totalConcert; // 500개
seedWithEffect(performanceInsertSql, generatePerformance(concertIds), {
  batchSize: totalPerformance,
  concurrentCount: 1,
  totalCount: totalPerformance,
}).catch(console.error);

// 좌석 데이터 생성 - 500만개
const performanceIds = Array.from(
  { length: totalPerformance },
  (_, i) => i + 1,
);
const totalSeats = 10_000 * totalPerformance; // 5_000_000
seedWithEffect(seatInsertSql, generateSeat(performanceIds), {
  batchSize: 10_000,
  concurrentCount: 10,
  totalCount: totalSeats,
}).catch(console.error);
