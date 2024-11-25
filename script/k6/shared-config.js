export const BASE_URL = 'http://your-api-url';
export const HEADERS = {
  'Content-Type': 'application/json',
};

export function getQueueToken() {
  // 실제 환경에 맞게 구현 필요
  return 'your-queue-token';
}

export function handleError(response, checkName) {
  if (response.status !== 200 && response.status !== 201) {
    console.error(`${checkName} failed: ${response.status} ${response.body}`);
  }
}
