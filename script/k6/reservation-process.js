import { check, sleep } from 'k6';
import http from 'k6/http';

// export const options = {
//   scenarios: {
//     // 시나리오 이름
//     reservation_process: {
//       // 실행기 유형: 각 VU당 반복 횟수 지정
//       executor: 'per-vu-iterations',
//       // 가상 사용자(Virtual User) 수: 1000명
//       vus: 500,
//       // 각 VU당 실행할 반복 횟수: 1회
//       iterations: 1,
//     },
//   },
//   timeout: '600s',
//   thresholds: {
//     http_req_duration: ['p(95)<10000'], // 95%의 요청이 10초 이내 완료
//     http_req_failed: ['rate<0.01'], // 실패율 1% 미만
//   },
// };

export const options = {
  scenarios: {
    // 시나리오 이름
    reservation_process: {
      // 실행기 유형: 각 VU당 반복 횟수 지정
      executor: 'shared-iterations', // 정확한 반복 횟수를 보장
      vus: 100, // 동시 사용자 수
      iterations: 1000, // 총 요청 수
      maxDuration: '600s', // 최대 실행 시간
    },
    // timeout: '600s',
    // 전역 타임아웃 설정
  },
};

const BASE_URL = 'http://localhost:3000';
const HEADERS = {
  'Content-Type': 'application/json',
  'x-queue-token': '0e04197d-7afe-48d3-95f5-147e6bb115d8', // 실제 토큰으로 대체 필요
};
const REQUEST_TIMEOUT = 300000; // 30초

export default function () {
  const performanceId = 1;
  const seatId = (__VU % 1000) + 1; // VU number를 기반으로 좌석 ID 할당 (1~1000)

  // 2. 좌석 리스트 조회
  const seatsResponse = http.get(
    `${BASE_URL}/performances/${performanceId}/seats`,
    {
      headers: {
        ...HEADERS,
      },
      timeout: REQUEST_TIMEOUT,
      tags: { name: 'SeatsRequest' },
    },
  );

  check(seatsResponse, {
    'Get seats successful': (r) => r.status === 200,
  });

  // 3. 좌석 예약
  // const reservationResponse = http.post(
  //   `${BASE_URL}/performances/${performanceId}/seats/${seatId}/reservations`,
  //   null,
  //   {
  //     headers: {
  //       ...HEADERS,
  //     },
  //   },
  // );

  // check(reservationResponse, {
  //   'Seat reservation successful': (r) => r.status === 201,
  // });

  // sleep(1);
  sleep(Math.random() * 2 + 1); // 1-3초 랜덤 대기
}
