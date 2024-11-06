import { BaseCacheStore } from 'src/common';

export class StubCacheStore extends BaseCacheStore {
  private storage: Map<string, any> = new Map();

  get<T>(key: string): Promise<T | undefined> | T | undefined {
    return this.storage.get(key);
  }

  set<T>(key: string, value: T, ttl?: number): Promise<void> | void {
    // 값 설정
    this.storage.set(key, value);

    // 타이머 설정
    if (ttl) {
      setTimeout(() => {
        this.del(key);
      }, ttl * 1000);
    }
  }

  del?(key: string): void | Promise<void> {
    this.storage.delete(key);
  }
}
