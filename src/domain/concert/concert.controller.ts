import {
  Controller,
  Get,
  Param,
  Query,
  Headers,
  ParseIntPipe,
  Post,
  HttpCode,
  Body,
} from '@nestjs/common';

@Controller({ path: 'concerts', version: 'v1' })
export class ConcertController {
  //
  @Get(':concertId/performances')
  @HttpCode(200)
  getPerformancesByConcert(
    @Param('concertId', ParseIntPipe) concertId: number,
    @Query('state') state: string,
    @Headers('Authorization') auth: string,
  ) {
    return {
      stateCode: '200',
      message: '성공',
      data: {
        totalCount: 30,
        results: [
          {
            id: 1,
            concertId: concertId,
            openDate: '2024-01-01',
            startAt: '2024-01-01 15:00:00',
            state: 'Available',
          },
        ],
      },
    };
  }

  @Get(':concertId/performances/:performanceId/seats')
  @HttpCode(200)
  getSeatsByPerformance(
    @Param('concertId', ParseIntPipe) concertId: number,
    @Param('performanceId', ParseIntPipe) performanceId: number,
    @Query('state') state: string,
    @Headers('Authorization') auth: string,
  ) {
    return {
      stateCode: '200',
      message: '성공',
      data: {
        totalCount: 30,
        results: [
          {
            id: 1,
            position: 13,
            amount: 50000,
            state: 'Available',
          },
        ],
      },
    };
  }

  @Post(':concertId/reservations')
  @HttpCode(201)
  createReservation(
    @Param('concertId', ParseIntPipe) concertId: number,
    @Body() body: any,
    @Headers('Authorization') auth: string,
  ) {
    return {
      stateCode: '201',
      message: '성공',
      data: {
        reservationId: 10,
      },
    };
  }
}
