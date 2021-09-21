import { ipcRenderer } from "electron";
import React from "react";
import { render } from "react-dom";

import App from "./app";
import Settings from "./settings/settings";
import { initStorage } from "./storage/storage";

// Get os specific data path from main process
ipcRenderer
  .invoke("data-path")
  .then((storagePath: string) => {
    if (storagePath == "") return alert("Couldn't get storage directory");

    // Initialise storage directory
    initStorage(storagePath);
    Settings.init(storagePath);

    // Render React app
    render(<App />, document.getElementById("root"));
  })
  .catch((error: string) => {
    alert(error);
  });
