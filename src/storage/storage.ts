import os from "os";
import path from "path";
import fs from "fs";
import uuid from "uuid";
import storage from "electron-json-storage";

export function getItems(prefix:string): Promise<Array<{}>> {
  return new Promise((resolve, reject) => {
    storage.keys((error, allKeys) => {
      if (error) reject(error);

      const matchingKeys = allKeys.filter((k) => k.startsWith(prefix));
      storage.getMany(matchingKeys, (error, data) => {

        console.log('data', data)
        if (error) reject(error);
        resolve(Object.values(data));
      });
    });
  });
}

export function saveItem(prefix: string, data: any) {
  // create a unique id for this server
  if (!data.id) {
    data.id = uuid.v4();
  }
  storage.set(prefix + data.id, data, (error) => {
    if (error) 
      throw error;
  });
}

export function deleteItem(prefix:string, id: string) {
  storage.remove(prefix + id, (error) => {
    if (error) throw error;
  });
}

export function initStorage() {
  // Deal with persisting server data
  const storageDir = path.join(
    os.homedir(),
    "AppData",
    "Local",
    "kdb studio 2"
  );
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }
  storage.setDataPath(storageDir);
}
