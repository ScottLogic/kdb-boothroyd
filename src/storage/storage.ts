import os from "os";
import path from "path";
import fs from "fs";
import uuid from "uuid";
import storage from "electron-json-storage";

const PREFIX = "server-";

export interface Server {
  name: string;
  host: string;
  port: number;
  id?: string;
}

export function getServers() {
  return new Promise((resolve, reject) => {
    storage.keys((error, allKeys) => {
      if (error) reject(error);

      const serverKeys = allKeys.filter((k) => k.startsWith(PREFIX));

      storage.getMany(serverKeys, (error, data) => {
        if (error) reject(error);
        resolve(Object.values(data));
      });
    });
  });
}

export function saveServer(cs: Server) {
  // create a unique id for this server
  if (!cs.id) {
    cs.id = uuid.v4();
  }
  storage.set(PREFIX + cs.id, cs, (error) => {
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

export function deleteServer(serverId: string) {
  storage.remove(PREFIX + serverId, (error) => {
    if (error) throw error;
  });
}
