import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { RestApiDecoratorDefaultOptions } from './type';

type RestApiStringPropertyOptions = RestApiDecoratorDefaultOptions & {
  maxLength?: number;
  minLength?: number;
};

const toApiPropertyOptions = (options: RestApiStringPropertyOptions) => ({
  type: String,
  description: options.description,
  isArray: options.isArray,
  maxLength: options.maxLength,
  minLength: options.minLength,
  maxItems: options.maxItems,
  minItems: options.minItems,
  default: options.default,
});

export function RestApiStringProperty(
  options: RestApiStringPropertyOptions = { isArray: false },
): PropertyDecorator {
  return applyDecorators(
    Expose(),
    ApiProperty({ ...toApiPropertyOptions(options) }),
  );
}

export function RestApiStringPropertyOptional(
  options: RestApiStringPropertyOptions = { isArray: false },
): PropertyDecorator {
  return applyDecorators(
    Expose(),
    ApiPropertyOptional({ ...toApiPropertyOptions(options) }),
  );
}
