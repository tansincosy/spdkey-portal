import aes from 'crypto-js/aes';
import encUTF8 from 'crypto-js/enc-utf8';

const LOCAL_STORAGE = window.localStorage;
const SESSION_STORAGE = window.sessionStorage;

let json = {};
let tobeLocalSavedJson = {};
let tobeSessionSavedJson = {};

class SessionManager {
  put(key: string, value: any, isPersist = false) {
    if (!value) {
      this.remove(key);
      return;
    }
    json[key] = value;
    if (isPersist) {
      tobeLocalSavedJson[key] = value;
    } else {
      tobeSessionSavedJson[key] = value;
    }
    console.log('value', value);
    this.saveStorage();
  }

  get<T>(key: string): T | null {
    if (!(key in json)) {
      try {
        const cacheValue = tobeSessionSavedJson[key] || tobeLocalSavedJson[key];
        const value = cacheValue || SESSION_STORAGE.getItem(key) || LOCAL_STORAGE.getItem(key);
        if (value) {
          json[key] = JSON.parse(aes.decrypt(value, key).toString(encUTF8));
        }
      } catch (e) {
        console.error(`localStorage access denied!`);
        return null;
      }
    }
    return (json[key] as T) || null;
  }

  remove(key: string) {
    delete json[key];
    delete tobeSessionSavedJson[key];
    delete tobeLocalSavedJson[key];

    try {
      SESSION_STORAGE.removeItem(key);
      LOCAL_STORAGE.removeItem(key);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(`localStorage access denied!`);
    }
  }
  clear(isPersist: boolean) {
    try {
      SESSION_STORAGE.clear();
    } catch (f) {
      // eslint-disable-next-line no-console
      console.error('localStorage access denied');
    }
    if (isPersist) {
      try {
        LOCAL_STORAGE.clear();
      } catch (f) {
        // eslint-disable-next-line no-console
        console.error('session Storage access denied');
      }
    }
    tobeLocalSavedJson = {};
    tobeSessionSavedJson = {};
    json = {};
  }

  saveStorage() {
    this.saveToStorage(tobeLocalSavedJson, LOCAL_STORAGE);
    this.saveToStorage(tobeSessionSavedJson, SESSION_STORAGE);
    tobeLocalSavedJson = {};
    tobeSessionSavedJson = {};
  }

  saveToStorage(jsonMap: Record<string, any>, storage: Storage) {
    Object.keys(jsonMap).forEach((key) => {
      const value = jsonMap[key];
      const encryptValue = aes.encrypt(JSON.stringify(value), key).toString();
      try {
        storage.setItem(key, encryptValue);
      } catch (e) {
        console.error(`localStorage access denied!`);
      }
    });
  }
}

const session = new SessionManager();

export { session };
