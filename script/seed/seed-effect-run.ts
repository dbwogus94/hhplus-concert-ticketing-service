import { Effect, Fiber } from 'effect';
import * as mysql from 'mysql2/promise';
import * as os from 'os';

type Options = {
  totalCount: number;
  /** 하드웨어 성능따라 조절 필요 */
  concurrentCount: number;
  batchSize: number;
};

const dbConfig = {
  host: process.env.DATABASE_HOST,
  port: +process.env.DATABASE_PORT,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  waitForConnections: true,
  connectionLimit: 30, // 트랜잭션 열었기 떄문에 Fiber 만큼 사용한다.
  queueLimit: 0,
};

const generateBatch = (generate: Effect.Effect<unknown>, batchSize: number) =>
  Effect.all(
    Array.from({ length: batchSize }, () => generate),
    { concurrency: 'unbounded' },
  );

export async function seedWithEffect(
  insertSql: string,
  generate: Effect.Effect<unknown>,
  options: Options = {
    totalCount: 10_000_000,
    concurrentCount: Math.floor(os.cpus().length / 2),
    batchSize: 10_000,
  },
) {
  const { totalCount, concurrentCount, batchSize } = options;

  const pool = mysql.createPool(dbConfig);
  try {
    console.time('Seed Time with Effect');

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      let processed = 0;
      const batchesPerFiber = Math.round(
        totalCount / concurrentCount / batchSize,
      );

      const fiberEffect = Effect.gen(function* (_) {
        for (let i = 0; i < batchesPerFiber; i++) {
          const reservations = yield* _(generateBatch(generate, batchSize));
          yield* _(
            Effect.promise(() => connection.query(insertSql, [reservations])),
          );
          processed += batchSize;
          console.log(`Processed: ${processed.toLocaleString()} records`);
        }
      });

      const fibers = Array.from({ length: concurrentCount }, () =>
        Effect.fork(fiberEffect),
      );

      await Effect.runPromise(
        Effect.all(fibers).pipe(
          Effect.flatMap((fibers) => Effect.all(fibers.map(Fiber.join))),
        ),
      );

      await connection.commit();
      console.timeEnd('Seed Time with Effect');
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await pool.end();
  }
}
