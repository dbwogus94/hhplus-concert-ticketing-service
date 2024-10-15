import {
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { GetUserInfoDecorator } from 'src/common';
import { DocumentHelper } from './document';
import {
  GetPerformancesQuery,
  GetSeatsQuery,
  PostSeatReservationResponse,
  GetPerformancesWithTotolCountResponse,
  GetSeatsWithTotolCountResponse,
} from './dto';

@ApiTags('공연 API')
@Controller('/performances')
export class PerformanceController {
  //
  @DocumentHelper('getPerformances')
  @Get('/performances')
  @HttpCode(200)
  async getPerformances(
    @Query() query: GetPerformancesQuery,
  ): Promise<GetPerformancesWithTotolCountResponse> {
    return {
      totalCount: 30,
      results: [
        {
          id: 1,
          concertId: query.concertId,
          openDate: '2024-01-01',
          startAt: new Date('2024-01-01 15:00:00'),
        },
      ],
    };
  }

  @DocumentHelper('getSeats')
  @Get('/:performanceId/seats')
  @HttpCode(200)
  async getSeats(
    @Param('performanceId', ParseIntPipe) performanceId: number,
    @Query() query: GetSeatsQuery,
  ): Promise<GetSeatsWithTotolCountResponse> {
    return {
      totalCount: 30,
      results: [
        {
          id: 1,
          performanceId,
          position: 13,
          amount: 50000,
          status: query.status,
        },
      ],
    };
  }

  @DocumentHelper('postSeatReservation')
  @Post('/:performanceId/seats/:seatId/reservations')
  @HttpCode(201)
  async postSeatReservation(
    @Param('performanceId', ParseIntPipe) performanceId: number,
    @Param('seatId', ParseIntPipe) seatId: number,
    @GetUserInfoDecorator('userId') userId: number,
  ): Promise<PostSeatReservationResponse> {
    return { reservationId: 1 };
  }
}
