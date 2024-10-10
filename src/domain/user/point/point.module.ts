import { Module } from '@nestjs/common';
import { PointService } from './point.service';

@Module({
  providers: [PointService],
})
export class PointModule {}
