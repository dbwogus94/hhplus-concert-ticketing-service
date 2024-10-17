import { Module } from '@nestjs/common';

import { UserController } from './presentation/user.controller';
import { UserService } from './domain/user.service';
import { UserFacade } from './application';
import {
  PointCoreRepository,
  PointRepository,
  UserCoreRepository,
  UserRepository,
} from './infra';

@Module({
  controllers: [UserController],
  providers: [
    UserFacade,
    UserService,
    {
      provide: UserRepository,
      useClass: UserCoreRepository,
    },
    {
      provide: PointRepository,
      useClass: PointCoreRepository,
    },
  ],
})
export class UserModule {}
