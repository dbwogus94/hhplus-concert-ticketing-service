import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { RestApiDecoratorDefaultOptions } from './type';

type RestApiDatePropertyOptions = RestApiDecoratorDefaultOptions;

const toApiPropertyOptions = (options: RestApiDatePropertyOptions) => ({
  type: Date,
  description: options.description,
  isArray: options.isArray,
  maxItems: options.maxItems,
  minItems: options.minItems,
  default: options.default,
});

export function RestApiDateProperty(
  options: RestApiDatePropertyOptions = { isArray: false },
): PropertyDecorator {
  return applyDecorators(
    Expose(),
    ApiProperty({ ...toApiPropertyOptions(options) }),
  );
}

export function RestApiDatePropertyOptional(
  options: RestApiDatePropertyOptions = { isArray: false },
): PropertyDecorator {
  return applyDecorators(
    Expose(),
    ApiPropertyOptional({ ...toApiPropertyOptions(options) }),
  );
}
