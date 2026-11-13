const DB_NAME = "samtek-vms";
const STORE_NAME = "kv";
const DB_VERSION = 1;

let opening: Promise<IDBDatabase> | null = null;

const open = () => {
  opening ??= new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => {
        db.close();
        opening = null;
      };
      resolve(db);
    };
    request.onerror = () => reject(request.error);
  }).catch((error: unknown) => {
    opening = null;
    throw error;
  });
  return opening;
};

const run = async <T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>,
) => {
  const db = await open();
  return new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode);
    const request = action(transaction.objectStore(STORE_NAME));
    transaction.oncomplete = () => resolve(request.result);
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
};

export const kvGet = (key: string) =>
  run<unknown>("readonly", (store) => store.get(key));

export const kvSet = (key: string, value: unknown) =>
  run("readwrite", (store) => store.put(value, key));

export const kvDelete = (key: string) =>
  run("readwrite", (store) => store.delete(key));
