export type UserInfo = {
  userId: number;
  queueUid: string;
  jwt: string;
};
export type UserRequest = Request & { user: UserInfo };
