export enum LocalStorageKeys {
  ConceptReportUuid = 'conceptReportUuid',
}

export class AucctusLocalStorage {
  static set(key: LocalStorageKeys, value: string) {
    localStorage.setItem(key, value);
  }

  static get(key: LocalStorageKeys) {
    return localStorage.getItem(key);
  }

  static remove(key: LocalStorageKeys) {
    localStorage.removeItem(key);
  }

  static clear() {
    localStorage.clear();
  }
}
