import { applyDecorators } from '@nestjs/common';
import { OnEvent, OnEventType } from '@nestjs/event-emitter';
import { OnEventOptions } from '@nestjs/event-emitter/dist/interfaces';

import { ERROR_EVENT } from '../constant';
import { BaseEventListener } from '../base-event-listener';

function _OnEventWithErrorHandler(
  errorEvent: string = ERROR_EVENT,
): MethodDecorator {
  return function (
    target: any,
    key: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    const parent = target.constructor.prototype;
    if (!(parent instanceof BaseEventListener)) {
      throw new Error(
        `❌ @OnCustomEvent can only be used on classes that extend ${BaseEventListener}.`,
      );
    }

    const metaKeys = Reflect.getOwnMetadataKeys(descriptor.value);
    const metas = metaKeys.map((key) => [
      key,
      Reflect.getMetadata(key, descriptor.value),
    ]);

    // method proxy
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      try {
        await originalMethod.call(this, ...args);
      } catch (err) {
        const self = this as any;
        const event = `${self.eventGroup}.${errorEvent}`;

        const isErrorHandler = self.eventEmitter.listeners(event).length > 0;
        if (isErrorHandler) {
          self.eventEmitter.emit(event, err);
        } else {
          throw err;
        }
      }
    };

    metas.forEach(([k, v]) => Reflect.defineMetadata(k, v, descriptor.value));
  };
}

/**
 * @nestjs/event-emitter의 에러를 핸들링 하기 위한 MethodDecorator를 생성합니다.
 * - `@nestjs/event-emitter#OnEvent`를 내부적으로 사용합니다.
 * - `@OnErrorEvent`를 사용해 에러를 헨들링 합니다.
 * @param event
 * @param options
 * @returns
 */
export function OnCustomEvent(
  event: OnEventType,
  options: OnEventOptions = void 0,
) {
  return applyDecorators(OnEvent(event, options), _OnEventWithErrorHandler());
}
