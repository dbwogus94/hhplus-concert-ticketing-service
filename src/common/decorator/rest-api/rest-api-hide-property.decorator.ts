import { applyDecorators } from '@nestjs/common';
import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export function RestApiHideProperty(): PropertyDecorator {
  return applyDecorators(Exclude(), ApiHideProperty());
}
