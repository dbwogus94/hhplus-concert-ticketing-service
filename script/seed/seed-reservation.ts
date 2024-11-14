import { faker } from '@faker-js/faker';
import { Effect } from 'effect';
import * as os from 'os';

import { ReservationStatus } from 'src/domain/concert/performance';
import { seedWithEffect } from './seed-effect-run';

const insertSql = `
  INSERT INTO reservation 
    (userId, seatId, price, status, createdAt, updatedAt) 
  VALUES ?
`;

const generateReservation = Effect.sync(() => [
  faker.number.int({ min: 1, max: 30 }), // userId
  faker.number.int({ min: 1, max: 5000 }), // seatId
  faker.number.int({
    min: 50_000,
    max: 100_000,
    multipleOf: 10_000,
  }), // price
  faker.helpers.arrayElement([
    ReservationStatus.REQUEST,
    ReservationStatus.CONFIRM,
  ]), // status
  new Date(), // createdAt
  new Date(), // updatedAt
]);

const options = {
  totalCount: 10_000_000,
  concurrentCount: Math.floor(os.cpus().length / 2),
  batchSize: 10_000,
};
seedWithEffect(insertSql, generateReservation, options).catch(console.error);
