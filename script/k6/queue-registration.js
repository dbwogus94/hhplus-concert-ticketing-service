import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    queue_registration: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 1000 }, // 30초 동안 1000명까지 증가
        { duration: '1m', target: 1000 }, // 1분 동안 1000명 유지
      ],
    },
  },
};

const BASE_URL = 'http://your-api-url';
const HEADERS = {
  'Content-Type': 'application/json',
};

export default function () {
  // 대기열 등록
  const queuePayload = JSON.stringify({
    concertId: 1,
    userId: 1,
  });

  const queueResponse = http.post(`${BASE_URL}/queue/tokens`, queuePayload, {
    headers: HEADERS,
  });

  check(queueResponse, {
    'Queue registration successful': (r) => r.status === 201,
  });

  if (queueResponse.status === 201) {
    const queueToken = queueResponse.json().queueToken;

    // 대기열 상태 확인
    const statusPayload = JSON.stringify({
      waitToken: queueToken,
    });

    const statusResponse = http.post(
      `${BASE_URL}/queue/status`,
      statusPayload,
      {
        headers: HEADERS,
      },
    );

    check(statusResponse, {
      'Queue status check successful': (r) => r.status === 200,
    });
  }

  sleep(1);
}
