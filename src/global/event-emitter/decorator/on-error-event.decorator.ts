import { applyDecorators } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OnEventOptions } from '@nestjs/event-emitter/dist/interfaces';

import { ERROR_EVENT } from '../constant';
import { BaseEventListener } from '../base-event-listener';

function _OnErrorEvent(): MethodDecorator {
  return function (
    target: any,
    key: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    const parent = target.constructor.prototype;
    if (!(parent instanceof BaseEventListener)) {
      throw new Error(
        `❌ @OnEventWithErrorHandler can only be used on classes that extend ${BaseEventListener.name}.`,
      );
    }

    const metaKeys = Reflect.getOwnMetadataKeys(descriptor.value);
    const metas = metaKeys.map((key) => [
      key,
      Reflect.getMetadata(key, descriptor.value),
    ]);

    // method proxy
    // const originalMethod = descriptor.value;
    // descriptor.value = async function (...args: any[]) {
    //   originalMethod.call(this, ...args);
    // };

    metas.forEach(([k, v]) => Reflect.defineMetadata(k, v, descriptor.value));
  };
}

/**
 * `@OnCustomEvent`에서 발생한 에러를 핸들링 하기 위한 MethodDecorator를 생성합니다.
 * - `@nestjs/event-emitter#OnEvent`를 내부적으로 사용합니다.
 * @param eventGroup 내부에서 `${eventGroup}.error`을 호출 합니다.
 * @param options
 * @returns
 */
export function OnErrorEvent(
  eventGroup: string,
  options: OnEventOptions = void 0,
) {
  const event = `${eventGroup}.${ERROR_EVENT}`;
  return applyDecorators(OnEvent(event, options), _OnErrorEvent());
}
