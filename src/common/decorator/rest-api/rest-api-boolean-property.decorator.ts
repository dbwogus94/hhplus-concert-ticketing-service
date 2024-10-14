import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { RestApiDecoratorDefaultOptions } from './type';

type RestApiBooleanPropertyOptions = RestApiDecoratorDefaultOptions;

const toApiPropertyOptions = (options: RestApiBooleanPropertyOptions) => ({
  type: Boolean,
  description: options.description,
  isArray: options.isArray,
  maxItems: options.maxItems,
  minItems: options.minItems,
  default: options.default,
});

export function RestApiBooleanProperty(
  options: RestApiBooleanPropertyOptions = { isArray: false },
): PropertyDecorator {
  return applyDecorators(
    Expose(),
    ApiProperty({ ...toApiPropertyOptions(options) }),
  );
}

export function RestApiBooleanPropertyOptional(
  options: RestApiBooleanPropertyOptions = { isArray: false },
): PropertyDecorator {
  return applyDecorators(
    Expose(),
    ApiPropertyOptional({ ...toApiPropertyOptions(options) }),
  );
}
