export type UserInfo = {
  userId: number;
  concertId: number;
  queueUid: string;
};
export type UserRequest = Request & { user: UserInfo };
