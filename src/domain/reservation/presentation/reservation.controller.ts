import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetUserInfoDecorator } from 'src/common';
import { QueueGuard } from 'src/domain/queue';
import { ReservationFacade, WriteReservationCriteria } from '../application';
import { DocumentHelper } from './document';
import { PostReservationRequest, PostReservationResponse } from './dto';

@ApiTags('예약 API')
@Controller('/reservations')
export class ReservationController {
  constructor(private readonly reservationFacade: ReservationFacade) {}

  @DocumentHelper('postReservation')
  @UseGuards(QueueGuard)
  @Post('/')
  @HttpCode(201)
  async postReservation(
    @Body() body: PostReservationRequest,
    @GetUserInfoDecorator('userId') userId: number,
    @GetUserInfoDecorator('queueUid') queueUid: string,
  ): Promise<PostReservationResponse> {
    const reservationId = await this.reservationFacade.reserve(
      WriteReservationCriteria.from({
        userId,
        performanceId: body.performanceId,
        seatId: body.seatId,
        queueUid,
      }),
    );
    return PostReservationResponse.of({ reservationId });
  }
}
