import { Body, Controller, Get, HttpCode, Param, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DocumentHelper } from './document';
import { GetUserPointResponse, PatchUserPointRequest } from './dto';

@ApiTags('유저 포인트 API')
@Controller({ path: 'users' })
export class UserController {
  @DocumentHelper('getUserPoint')
  @Get(':userId/point')
  async getUserPoint(
    @Param('userId') userId: string,
  ): Promise<GetUserPointResponse> {
    return {
      amount: 10000,
    };
  }

  @DocumentHelper('patchUserPoint')
  @Patch(':userId/point')
  @HttpCode(201)
  async patchUserPoint(
    @Param('userId') userId: string,
    @Body() body: PatchUserPointRequest,
  ): Promise<GetUserPointResponse> {
    return {
      amount: 10000,
    };
  }
}
