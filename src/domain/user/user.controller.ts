import { Controller, Post, Get, Param, Body, HttpCode } from '@nestjs/common';

@Controller({ path: 'users', version: 'v1' })
export class UserController {
  @Post(':userId/points')
  @HttpCode(204)
  addUserPoints(@Param('userId') userId: string, @Body() body: any) {
    return {
      stateCode: '204',
      message: '성공',
    };
  }

  @Get(':userId/points')
  @HttpCode(201)
  getUserPoints(@Param('userId') userId: string) {
    return {
      stateCode: '201',
      message: '성공',
      data: {
        amount: 10000,
      },
    };
  }
}
