type StorageKeys = 'refreshToken' | 'conceptUuid';

export class AucctusLocalStorage {
  static set(key: StorageKeys, value: string) {
    localStorage.setItem(key, value);
  }

  static get(key: StorageKeys) {
    return localStorage.getItem(key) || undefined;
  }

  static remove(key: StorageKeys) {
    localStorage.removeItem(key);
  }

  static clear() {
    localStorage.clear();
  }
}
