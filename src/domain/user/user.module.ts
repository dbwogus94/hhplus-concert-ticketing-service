import { Module } from '@nestjs/common';
import { UserController } from './presentation/user.controller';
import { PointModule } from './point/point.module';

@Module({
  imports: [PointModule],
  controllers: [UserController],
})
export class UserModule {}
