import os from "os";
import path from "path";
import fs from "fs";
import uuid from "uuid";
import storage from "electron-json-storage";

// Get items from file storage
export function getItems(prefix: string): Promise<Array<{}>> {
  return new Promise((resolve, reject) => {
    // Get all file names from the storage folder
    storage.keys((error, allKeys) => {
      if (error) reject(error);

      // Find all keys that match the given prefix
      const matchingKeys = allKeys.filter((k) => k.startsWith(prefix));

      // Get all files with a matching prefix
      storage.getMany(matchingKeys, (error, data) => {
        if (error) reject(error);

        // Resolve promise with the data loaded from the files
        resolve(Object.values(data));
      });
    });
  });
}

// Write an item to file storage
export function saveItem(prefix: string, data: any) {
  // create a unique id for this server
  if (!data.id) data.id = uuid.v4();

  // Write file
  storage.set(prefix + data.id, data, (error) => {
    if (error) throw error;
  });
}

// Remove item from file storage
export function deleteItem(prefix: string, id: string) {
  storage.remove(prefix + id, (error) => {
    if (error) throw error;
  });
}

// Set up storage dir
export function initStorage(userData: string) {
  // Deal with persisting server data

  const storageDir = path.join(userData, "storage");

  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }
  storage.setDataPath(storageDir);
}
