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
      // { name: '강태호', email: 'taeho.kang@example.com' },
      // { name: '윤서영', email: 'seoyoung.yoon@example.com' },
      // { name: '장동건', email: 'donggun.jang@example.com' },
      // { name: '서지혜', email: 'jihye.seo@example.com' },
      // { name: '안진우', email: 'jinwoo.ahn@example.com' },
      // { name: '이수빈', email: 'subin.lee@example.com' },
      // { name: '김재현', email: 'jaehyun.kim@example.com' },
      // { name: '박소연', email: 'soyeon.park@example.com' },
      // { name: '최현준', email: 'hyunjun.choi@example.com' },
      // { name: '정다은', email: 'daeun.jung@example.com' },
      // { name: '강민석', email: 'minseok.kang@example.com' },
      // { name: '윤지원', email: 'jiwon.yoon@example.com' },
      // { name: '장하은', email: 'haeun.jang@example.com' },
      // { name: '서민규', email: 'mingyu.seo@example.com' },
      // { name: '안지수', email: 'jisoo.ahn@example.com' },
      // { name: '이예진', email: 'yejin.lee@example.com' },
      // { name: '김도윤', email: 'doyoon.kim@example.com' },
      // { name: '박서준', email: 'seojun.park@example.com' },
      // { name: '최유진', email: 'youjin.choi@example.com' },
      // { name: '정하늘', email: 'haneul.jung@example.com' },
      // { name: '강주원', email: 'juwon.kang@example.com' },
      // { name: '윤민수', email: 'minsu.yoon@example.com' },
      // { name: '장서연', email: 'seoyeon.jang@example.com' },
      // { name: '서예준', email: 'yejun.seo@example.com' },
      // { name: '안채원', email: 'chaewon.ahn@example.com' },
      // { name: '이시우', email: 'siwoo.lee@example.com' },
      // { name: '김다은', email: 'daeun.kim@example.com' },
      // { name: '박준혁', email: 'junhyuk.park@example.com' },
      // { name: '최서윤', email: 'seoyun.choi@example.com' },
      // { name: '정은서', email: 'eunseo.jung@example.com' },
      // { name: '강민준', email: 'minjun.kang@example.com' },
      // { name: '윤서현', email: 'seohyun.yoon@example.com' },
      // { name: '장예은', email: 'yeeun.jang@example.com' },
      // { name: '서준서', email: 'junseo.seo@example.com' },
      // { name: '안서진', email: 'seojin.ahn@example.com' },
      // { name: '이지아', email: 'jiah.lee@example.com' },
      // { name: '김민지', email: 'minji.kim@example.com' },
      // { name: '박현우', email: 'hyunwoo.park@example.com' },
      // { name: '최지훈', email: 'jihoon.choi@example.com' },
      // { name: '정서연', email: 'seoyeon.jung@example.com' },
      // { name: '강지호', email: 'jiho.kang@example.com' },
      // { name: '윤서준', email: 'seojun.yoon@example.com' },
      // { name: '장민서', email: 'minseo.jang@example.com' },
      // { name: '서지원', email: 'jiwon.seo@example.com' },
      // { name: '안서윤', email: 'seoyun.ahn@example.com' },
      // { name: '이수아', email: 'suah.lee@example.com' },
      // { name: '김예준', email: 'yejun.kim@example.com' },
      // { name: '박지우', email: 'jiwoo.park@example.com' },
      // { name: '최서현', email: 'seohyun.choi@example.com' },
      // { name: '정다인', email: 'dain.jung@example.com' },
      // { name: '강현우', email: 'hyunwoo.kang@example.com' },
      // { name: '윤지호', email: 'jiho.yoon@example.com' },
      // { name: '장서윤', email: 'seoyun.jang@example.com' },
      // { name: '서민서', email: 'minseo.seo@example.com' },
      // { name: '안지원', email: 'jiwon.ahn@example.com' },
      // { name: '이수민', email: 'sumin.lee@example.com' },
      // { name: '김예은', email: 'yeeun.kim@example.com' },
      // { name: '박지민', email: 'jimin.park@example.com' },
      // { name: '최서준', email: 'seojun.choi@example.com' },
      // { name: '정다윤', email: 'dayun.jung@example.com' },
      // { name: '강현준', email: 'hyunjun.kang@example.com' },
      // { name: '윤지우', email: 'jiwoo.yoon@example.com' },
      // { name: '장서준', email: 'seojun.jang@example.com' },
      // { name: '서민지', email: 'minji.seo@example.com' },
      // { name: '안지유', email: 'jiyu.ahn@example.com' },
      // { name: '이수진', email: 'sujin.lee@example.com' },
      // { name: '김예진', email: 'yejin.kim@example.com' },
      // { name: '박지수', email: 'jisoo.park@example.com' },
      // { name: '최서영', email: 'seoyoung.choi@example.com' },
      // { name: '정다현', email: 'dahyun.jung@example.com' },
      // { name: '강현서', email: 'hyunseo.kang@example.com' },
      // { name: '윤지민', email: 'jimin.yoon@example.com' },
      // { name: '장서진', email: 'seojin.jang@example.com' },
      // { name: '서민준', email: 'minjun.seo@example.com' },
      // { name: '안지민', email: 'jimin.ahn@example.com' },
      // { name: '이수현', email: 'suhyun.lee@example.com' },
      // { name: '김예원', email: 'yewon.kim@example.com' },
      // { name: '박지현', email: 'jihyun.park@example.com' },
      // { name: '최서연', email: 'seoyeon.choi@example.com' },
      // { name: '정다원', email: 'dawon.jung@example.com' },
      // { name: '강현진', email: 'hyunjin.kang@example.com' },
      // { name: '윤지수', email: 'jisoo.yoon@example.com' },
      // { name: '장서현', email: 'seohyun.jang@example.com' },
      // { name: '서민재', email: 'minjae.seo@example.com' },
      // { name: '안지수', email: 'jisoo.ahn@example.com' },
      // { name: '이수윤', email: 'suyun.lee@example.com' },
      // { name: '김예지', email: 'yeji.kim@example.com' },
      // { name: '박지원', email: 'jiwon.park@example.com' },
      // { name: '최서윤', email: 'seoyun.choi@example.com' },
      // { name: '정다은', email: 'daeun.jung@example.com' },
      // { name: '강현수', email: 'hyunsoo.kang@example.com' },
      // { name: '윤지원', email: 'jiwon.yoon@example.com' },
      // { name: '장서윤', email: 'seoyun.jang@example.com' },
      // { name: '서민주', email: 'minju.seo@example.com' },
      // { name: '안지현', email: 'jihyun.ahn@example.com' },
      // { name: '이수지', email: 'suji.lee@example.com' },
    ];

    for (const user of users) {
      // 포인트 데이터 생성
      const pointResult = await queryRunner.query(`
            INSERT INTO \`point\` (\`amount\`)
            VALUES (0);
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
