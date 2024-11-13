export type UserInfo = {
  userId: number;
  concertId: number;
  queueUid: string;
  jwt: string;
};
export type UserRequest = Request & { user: UserInfo };
