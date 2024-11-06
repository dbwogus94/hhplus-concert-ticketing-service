import { RedisCacheStore } from 'src/common';
import { StubRedis } from 'test/fixture';

describe('RedisCacheStore', () => {
  let cacheStore: RedisCacheStore;

  beforeEach(() => {
    // const cacheStore = new StubCacheStore();
    cacheStore = new RedisCacheStore(new StubRedis());
  });

  describe('RedisCacheStore#get', () => {
    describe('실패한다.', () => {
      it('key가 존재하지 않으면 실패한다.', async () => {
        // given
        const key = 'key';

        // when
        const result = await cacheStore.get(key);

        // then
        expect(result).toBeNull();
      });

      it('key가 ttl이 지나지 않았는데 값이 없다면 실패이다.', async () => {
        // given
        const key = 'key';
        const value = 'value';

        // when
        await cacheStore.set(key, value, 3);
        cacheStore.del(key);
        const result = await cacheStore.get(key);

        // then
        expect(result).toBeNull();
      });
    });

    describe('성공한다.', () => {
      it('key에 매칭되는 캐시에 조회에 성공한다.', async () => {
        // given
        const key = 'key';
        const value = 'value';
        await cacheStore.set(key, value);

        // when
        const result = await cacheStore.get(key);
        // then
        expect(result).toBe(value);
      });

      it('ttl이 설정된 경우, ttl이 지나지 않았으면 조회된다.', async () => {
        // given
        const key = 'key';
        const value = 'value';
        await cacheStore.set(key, value, 3);

        // when
        const result = await cacheStore.get(key);
        // then
        expect(result).toBe(value);
      });

      it('ttl이 설정된 경우, ttl이 지났으면 조회되지 않는다.', async () => {
        // given
        const key = 'key';
        const value = 'value';
        await cacheStore.set(key, value, 0);

        // when
        const result = await cacheStore.get(key);
        // then
        expect(result).toBe(value);
      });

      it('캐시된 값이 제거되었다면 조회되지 않는다.', async () => {
        // given
        const key = 'key';
        const value = 'value';
        await cacheStore.set(key, value);
        await cacheStore.del(key);

        // when
        const result = await cacheStore.get(key);
        // then
        expect(result).toBeNull();
      });
    });
  });

  describe('RedisCacheStore#set', () => {
    describe('성공한다.', () => {
      it('캐시 설정이 성공한다.', async () => {
        // given
        const key = 'key';
        const value = 'value';
        await cacheStore.set(key, value);
        // when
        const result = await cacheStore.get(key);
        // then
        expect(result).toBe(value);
      });

      it('ttl이 지정된 경우, ttl이 지나면 설정된 값은 제거된다.', async () => {
        // given
        const sleep = (ttl: number) =>
          new Promise((resolve) => setTimeout(resolve, ttl * 1000));
        const ttl = 2;
        const key = 'key';
        const value = 'value';

        await cacheStore.set(key, value, ttl);

        // when
        const resultBefore = await cacheStore.get(key);
        await sleep(ttl);
        const resultAfter = await cacheStore.get(key);

        // then
        expect(resultBefore).toBe(value);
        expect(resultAfter).toBeNull();
      });
    });
  });

  describe('RedisCacheStore#del', () => {
    describe('성공한다.', () => {
      it('삭제에 성공한다.', async () => {
        // given
        const key = 'key';
        const value = 'value';
        await cacheStore.set(key, value);
        await cacheStore.del(key);

        // when
        const result = await cacheStore.get(key);
        // then
        expect(result).toBeNull();
      });
    });
  });
});
