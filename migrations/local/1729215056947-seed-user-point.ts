import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedUserPoint1729215056947 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const users = [
      { name: '김민수', email: 'minsu.kim@example.com' },
      { name: '이영희', email: 'younghee.lee@example.com' },
      { name: '박철수', email: 'chulsu.park@example.com' },
      { name: '최지영', email: 'jiyoung.choi@example.com' },
      { name: '정민호', email: 'minho.jung@example.com' },
      { name: '강서연', email: 'seoyeon.kang@example.com' },
      { name: '윤성진', email: 'sungjin.yoon@example.com' },
      { name: '장미경', email: 'mikyung.jang@example.com' },
      { name: '서준영', email: 'junyoung.seo@example.com' },
      { name: '안소희', email: 'sohee.ahn@example.com' },
      { name: '이상훈', email: 'sanghoon.lee@example.com' },
      { name: '김은지', email: 'eunji.kim@example.com' },
      { name: '박준서', email: 'junseo.park@example.com' },
      { name: '최민재', email: 'minjae.choi@example.com' },
      { name: '정현아', email: 'hyuna.jung@example.com' },
    ];

    for (const user of users) {
      // 포인트 데이터 생성
      const pointResult = await queryRunner.query(`
            INSERT INTO \`point\` (\`amount\`, \`version\`)
            VALUES (0, 1);
          `);

      const pointId = pointResult.insertId;

      // 유저 데이터 생성
      await queryRunner.query(`
            INSERT INTO \`user\` (\`name\`, \`email\`, \`pointId\`)
            VALUES ('${user.name}', '${user.email}', ${pointId});
          `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM \`user\`;`);

    // AUTO_INCREMENT 초기화
    await queryRunner.query(`ALTER TABLE \`user\` AUTO_INCREMENT = 1;`);
    await queryRunner.query(`ALTER TABLE \`point\` AUTO_INCREMENT = 1;`);
  }
}
