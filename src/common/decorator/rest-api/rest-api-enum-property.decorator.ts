import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { RestApiDecoratorDefaultOptions } from './type';

type RestApiEnumPropertyOptions = RestApiDecoratorDefaultOptions;

const toApiPropertyOptions = (
  enumType: object,
  options: RestApiEnumPropertyOptions,
) => ({
  enum: enumType,
  description: options.description,
  isArray: options.isArray,
  maxItems: options.maxItems,
  minItems: options.minItems,
  default: options.default,
});

export function RestApiEnumProperty(
  enumType: object,
  options: RestApiEnumPropertyOptions = { isArray: false },
): PropertyDecorator {
  return applyDecorators(
    Expose(),
    ApiProperty({ ...toApiPropertyOptions(enumType, options) }),
  );
}

export function RestApiEnumPropertyOptional(
  enumType: object,
  options: RestApiEnumPropertyOptions = { isArray: false },
): PropertyDecorator {
  return applyDecorators(
    Expose(),
    ApiPropertyOptional({ ...toApiPropertyOptions(enumType, options) }),
  );
}
