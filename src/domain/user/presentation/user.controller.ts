import { Body, Controller, Get, HttpCode, Param, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DocumentHelper } from './document';
import { GetUserPointResponse, PatchUserPointRequest } from './dto';
import { UserFacade } from '../application';
import { WriteUserPointCommand } from '../domain';

@ApiTags('유저 포인트 API')
@Controller({ path: 'users' })
export class UserController {
  constructor(private readonly userFacade: UserFacade) {}

  @DocumentHelper('getUserPoint')
  @Get(':userId/point')
  async getUserPoint(
    @Param('userId') userId: number,
  ): Promise<GetUserPointResponse> {
    const user = await this.userFacade.getUserPoint(userId);
    return GetUserPointResponse.of(user);
  }

  @DocumentHelper('patchUserPoint')
  @Patch(':userId/point')
  @HttpCode(201)
  async patchUserPoint(
    @Param('userId') userId: number,
    @Body() body: PatchUserPointRequest,
  ): Promise<GetUserPointResponse> {
    const user = await this.userFacade.chargeUserPoint(
      WriteUserPointCommand.from({
        userId,
        amount: body.amount,
      }),
    );
    return GetUserPointResponse.of(user);
  }
}
