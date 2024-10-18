import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1729215044973 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create 'concert' table
    await queryRunner.query(`
          CREATE TABLE \`concert\` (
            \`id\` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
            \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '생성일',
            \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '수정일',
            \`deletedAt\` datetime(6) DEFAULT NULL COMMENT '삭제일',
            \`name\` varchar(255) NOT NULL,
            \`description\` varchar(255) NOT NULL,
            \`startDate\` date NOT NULL,
            \`endDate\` date NOT NULL,
            PRIMARY KEY (\`id\`)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
        `);

    // Create 'payment' table
    await queryRunner.query(`
          CREATE TABLE \`payment\` (
            \`id\` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
            \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '생성일',
            \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '수정일',
            \`deletedAt\` datetime(6) DEFAULT NULL COMMENT '삭제일',
            \`userId\` int NOT NULL,
            \`reservationId\` int NOT NULL,
            \`payPrice\` int NOT NULL,
            PRIMARY KEY (\`id\`)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
        `);

    // Create 'performance' table
    await queryRunner.query(`
          CREATE TABLE \`performance\` (
            \`id\` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
            \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '생성일',
            \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '수정일',
            \`deletedAt\` datetime(6) DEFAULT NULL COMMENT '삭제일',
            \`openDate\` date NOT NULL,
            \`startAt\` datetime NOT NULL,
            \`concertId\` int NOT NULL,
            PRIMARY KEY (\`id\`)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
        `);

    // Create 'point' table
    await queryRunner.query(`
          CREATE TABLE \`point\` (
            \`id\` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
            \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '생성일',
            \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '수정일',
            \`deletedAt\` datetime(6) DEFAULT NULL COMMENT '삭제일',
            \`amount\` int NOT NULL,
            PRIMARY KEY (\`id\`)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
        `);

    // Create 'point_history' table
    await queryRunner.query(`
          CREATE TABLE \`point_history\` (
            \`id\` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
            \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '생성일',
            \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '수정일',
            \`deletedAt\` datetime(6) DEFAULT NULL COMMENT '삭제일',
            \`amount\` int NOT NULL,
            \`type\` varchar(255) NOT NULL,
            \`userId\` int NOT NULL,
            PRIMARY KEY (\`id\`)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
        `);

    // Create 'queue' table
    await queryRunner.query(`
          CREATE TABLE \`queue\` (
            \`id\` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
            \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '생성일',
            \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '수정일',
            \`deletedAt\` datetime(6) DEFAULT NULL COMMENT '삭제일',
            \`uid\` varchar(255) NOT NULL,
            \`concertId\` int NOT NULL,
            \`userId\` int NOT NULL,
            \`status\` varchar(255) NOT NULL,
            \`activeExpireAt\` datetime DEFAULT NULL,
            \`activeAt\` datetime DEFAULT NULL,
            PRIMARY KEY (\`id\`)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
        `);

    // Create 'reservation' table
    await queryRunner.query(`
          CREATE TABLE \`reservation\` (
            \`id\` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
            \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '생성일',
            \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '수정일',
            \`deletedAt\` datetime(6) DEFAULT NULL COMMENT '삭제일',
            \`userId\` int NOT NULL,
            \`seatId\` int NOT NULL,
            \`price\` int NOT NULL,
            \`status\` varchar(255) NOT NULL,
            PRIMARY KEY (\`id\`)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
        `);

    // Create 'seat' table
    await queryRunner.query(`
          CREATE TABLE \`seat\` (
            \`id\` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
            \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '생성일',
            \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '수정일',
            \`deletedAt\` datetime(6) DEFAULT NULL COMMENT '삭제일',
            \`position\` int NOT NULL,
            \`amount\` int NOT NULL,
            \`status\` varchar(255) NOT NULL,
            \`performanceId\` int NOT NULL,
            PRIMARY KEY (\`id\`)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
        `);

    // Create 'user' table
    await queryRunner.query(`
          CREATE TABLE \`user\` (
            \`id\` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
            \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '생성일',
            \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '수정일',
            \`deletedAt\` datetime(6) DEFAULT NULL COMMENT '삭제일',
            \`name\` varchar(255) NOT NULL,
            \`email\` varchar(255) NOT NULL,
            \`pointId\` int NOT NULL,
            PRIMARY KEY (\`id\`)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order of creation
    await queryRunner.query(`DROP TABLE \`user\`;`);
    await queryRunner.query(`DROP TABLE \`seat\`;`);
    await queryRunner.query(`DROP TABLE \`reservation\`;`);
    await queryRunner.query(`DROP TABLE \`queue\`;`);
    await queryRunner.query(`DROP TABLE \`point_history\`;`);
    await queryRunner.query(`DROP TABLE \`point\`;`);
    await queryRunner.query(`DROP TABLE \`performance\`;`);
    await queryRunner.query(`DROP TABLE \`payment\`;`);
    await queryRunner.query(`DROP TABLE \`concert\`;`);
  }
}
