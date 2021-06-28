const os = require("os");
const path = require("path");
const fs = require("fs");
const uuid = require("uuid");
const storage = require("electron-json-storage");

const PREFIX = "server-";

const getServers = () =>
  new Promise((resolve, reject) => {
    storage.keys((error, allKeys) => {
      if (error) reject(error);

      const serverKeys = allKeys.filter((k) => k.startsWith(PREFIX));
      console.log(serverKeys);

      storage.getMany(serverKeys, (error, data) => {
        if (error) reject(error);
        resolve(Object.values(data));
      });
    });
  });

const saveServer = (cs) => {
  console.log("We're going to save server details: " + JSON.stringify(cs));
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
    "AppData",
    "Local",
    "kdb studio 2"
  );
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }
  storage.setDataPath(storageDir);
  console.log("storage path: " + storageDir);
};

const deleteServer = (serverId) => {
  console.log("We're going to delete server: " + serverId);
  storage.remove(PREFIX + serverId, (error) => {
    if (error) throw error;
  });
};

module.exports = {
  getServers,
  saveServer,
  init,
  deleteServer,
};
