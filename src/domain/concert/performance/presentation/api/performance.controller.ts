import {
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { QueueGuard } from 'src/domain/queue';
import { PerformanceFacade } from '../../application';
import { DocumentHelper } from './document';
import {
  GetPerformancesQuery,
  GetPerformancesResponse,
  GetPerformancesWithTotolCountResponse,
  GetSeatsResponse,
  GetSeatsWithTotolCountResponse,
} from './dto';

@ApiTags('공연 API')
@Controller('/performances')
export class PerformanceController {
  constructor(private readonly performanceFacade: PerformanceFacade) {}

  @DocumentHelper('getPerformances')
  @Get('/performances')
  @HttpCode(200)
  async getPerformances(
    @Query() query: GetPerformancesQuery,
  ): Promise<GetPerformancesWithTotolCountResponse> {
    const performances = await this.performanceFacade.getPerformances(
      query.concertId,
    );
    return {
      totalCount: performances.length,
      results: GetPerformancesResponse.of(performances),
    };
  }

  @DocumentHelper('getSeats')
  @UseGuards(QueueGuard)
  @Get('/:performanceId/seats')
  @HttpCode(200)
  async getSeats(
    @Param('performanceId', ParseIntPipe) performanceId: number,
  ): Promise<GetSeatsWithTotolCountResponse> {
    const seats = await this.performanceFacade.getAvailableSeats(performanceId);
    return {
      totalCount: seats.length,
      results: GetSeatsResponse.of(seats),
    };
  }
}
