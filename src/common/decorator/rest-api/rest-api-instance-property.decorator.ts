import { applyDecorators, Type } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { RestApiDecoratorDefaultOptions } from './type';

type RestApiInstancePropertyOptions = RestApiDecoratorDefaultOptions;

const toApiPropertyOptions = (
  entity: Type,
  options: RestApiInstancePropertyOptions,
) => ({
  type: entity,
  description: options.description,
  isArray: options.isArray,
  maxItems: options.maxItems,
  minItems: options.minItems,
  default: options.default,
});

export function RestApiInstanceProperty(
  entity: Type,
  options: RestApiInstancePropertyOptions = { isArray: false },
): PropertyDecorator {
  return applyDecorators(
    Expose(),
    ApiProperty({ ...toApiPropertyOptions(entity, options) }),
  );
}

export function RestApiInstancePropertyOptional(
  entity: Type,
  options: RestApiInstancePropertyOptions = { isArray: false },
): PropertyDecorator {
  return applyDecorators(
    Expose(),
    ApiPropertyOptional({ ...toApiPropertyOptions(entity, options) }),
  );
}
