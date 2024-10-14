import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { RestApiDecoratorDefaultOptions } from './type';

type RestApiIntPropertyOptions = RestApiDecoratorDefaultOptions & {
  max?: number;
  min?: number;
};

const toApiPropertyOptions = (options: RestApiIntPropertyOptions) => ({
  type: Number,
  description: options.description,
  isArray: options.isArray,
  maximum: options.max,
  minimum: options.min,
  maxItems: options.maxItems,
  minItems: options.minItems,
  default: options.default,
});

export function RestApiIntProperty(
  options: RestApiIntPropertyOptions = { isArray: false },
): PropertyDecorator {
  return applyDecorators(
    Expose(),
    ApiProperty({ ...toApiPropertyOptions(options) }),
  );
}

export function RestApiIntPropertyOptional(
  options: RestApiIntPropertyOptions = { isArray: false },
): PropertyDecorator {
  return applyDecorators(
    Expose(),
    ApiPropertyOptional({ ...toApiPropertyOptions(options) }),
  );
}
