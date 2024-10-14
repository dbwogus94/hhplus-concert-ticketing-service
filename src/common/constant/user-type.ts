export type UserInfo = {
  userId: string;
  jwt: string;
};
export type UserRequest = Request & { user: UserInfo };
