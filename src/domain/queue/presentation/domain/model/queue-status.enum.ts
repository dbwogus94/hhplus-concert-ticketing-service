/** 대기열 상태 */
export enum QueueStatus {
  /** 없음 */
  NONE = 'None',
  /** 대기 */
  WAIT = 'Wait',
  /** 활성 */
  ACTIVE = 'Active',
  /** 만료 */
  EXPIRE = 'Expire',
}
