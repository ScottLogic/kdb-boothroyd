import os from 'os';
import path from 'path';
import fs from 'fs';
import uuid from 'uuid';
import storage from 'electron-json-storage';

const PREFIX = 'server-';

const getServers = () =>
  new Promise((resolve, reject) => {
    storage.keys((error, allKeys) => {
      if (error) reject(error);

      const serverKeys = allKeys.filter((k) => k.startsWith(PREFIX));

      storage.getMany(serverKeys, (error, data) => {
        if (error) reject(error);
        resolve(Object.values(data));
      });
    });
  });

const saveServer = (cs) => {
  // create a unique id for this server
  if (!cs.id) {
    cs.id = uuid.v4();
  }
  storage.set(PREFIX + cs.id, cs, (error) => {
    if (error) throw error;
  });
};

const init = () => {
  // Deal with persisting server data
  const storageDir = path.join(
    os.homedir(),
    'AppData',
    'Local',
    'kdb studio 2'
  );
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }
  storage.setDataPath(storageDir);
};

const deleteServer = (serverId) => {
  storage.remove(PREFIX + serverId, (error) => {
    if (error) throw error;
  });
};

export default {
  getServers,
  saveServer,
  init,
  deleteServer,
};
