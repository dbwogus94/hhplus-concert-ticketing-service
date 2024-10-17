import { UserEntity } from '../../model';

export class GetUserInfo implements Pick<UserEntity, 'id' | 'name' | 'email'> {
  constructor(
    readonly id: number,
    readonly name: string,
    readonly email: string,
  ) {}

  static of(domain: UserEntity[]): GetUserInfo[];
  static of(domain: UserEntity): GetUserInfo;
  static of(domain: UserEntity | UserEntity[]): GetUserInfo | GetUserInfo[] {
    if (Array.isArray(domain)) return domain.map((d) => this.of(d));
    return new GetUserInfo(domain.id, domain.name, domain.email);
  }
}
