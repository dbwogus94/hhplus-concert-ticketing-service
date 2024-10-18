import {
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { GetUserInfoDecorator } from 'src/common';
import { DocumentHelper } from './document';
import {
  GetPerformancesQuery,
  PostSeatReservationResponse,
  GetPerformancesWithTotolCountResponse,
  GetSeatsWithTotolCountResponse,
  GetPerformancesResponse,
  GetSeatsResponse,
} from './dto';
import { PerformanceFacade } from '../application';
import { WriteReservationCommand } from '../domain';
import { JwtGuard } from 'src/domain/auth';

@ApiTags('공연 API')
@Controller('/performances')
export class PerformanceController {
  constructor(private readonly performanceFacade: PerformanceFacade) {}

  //
  @DocumentHelper('getPerformances')
  @UseGuards(JwtGuard)
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
  @UseGuards(JwtGuard)
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

  @DocumentHelper('postSeatReservation')
  @UseGuards(JwtGuard)
  @Post('/:performanceId/seats/:seatId/reservations')
  @HttpCode(201)
  async postSeatReservation(
    @Param('performanceId', ParseIntPipe) performanceId: number,
    @Param('seatId', ParseIntPipe) seatId: number,
    @GetUserInfoDecorator('userId') userId: number,
  ): Promise<PostSeatReservationResponse> {
    const reservationId = await this.performanceFacade.reserveSeat(
      WriteReservationCommand.from({
        userId,
        seatId,
        performanceId,
      }),
    );
    return PostSeatReservationResponse.of({ reservationId });
  }
}
