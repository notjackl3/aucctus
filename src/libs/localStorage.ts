export type StorageKeys = 'refreshToken' | 'conceptUuid' | 'sess' | 'initialized' | 'user';

interface IStorageOptions<T> {
  defaultValue?: T;
  type: 'local' | 'session';
}

interface IStorageEventDetails<T> {
  key: StorageKeys;
  value: T | undefined;
  type: 'local' | 'session';
}

export class AucctusStorageEvent<T = unknown> extends CustomEvent<IStorageEventDetails<T>> {}

export class AucctusStorage {
  static set<T>(key: StorageKeys, value: T | undefined, type: 'local' | 'session' = 'local') {
    const storage = type === 'local' ? localStorage : sessionStorage;

    if (value) {
      storage.setItem(key, JSON.stringify(value));
    } else {
      storage.removeItem(key);
    }

    window.dispatchEvent(new AucctusStorageEvent('aucctusStorage', { detail: { key, value, type } }));
  }

  static get<T>(
    key: StorageKeys,
    options: IStorageOptions<T> = { defaultValue: undefined, type: 'local' },
  ): T | undefined {
    const { defaultValue, type } = options;
    const storage = type === 'local' ? localStorage : sessionStorage;

    try {
      const value = storage.getItem(key);

      if (value) {
        return JSON.parse(value) as T;
      }
    } catch {}
    return defaultValue;
  }

  static remove(key: StorageKeys, type: 'local' | 'session' = 'local') {
    const storage = type === 'local' ? localStorage : sessionStorage;
    storage.removeItem(key);
  }

  static clear(type: 'local' | 'session' = 'local') {
    const storage = type === 'local' ? localStorage : sessionStorage;
    storage.clear();
  }
}
