import {
  app,
  BrowserWindow,
  ipcMain,
  nativeTheme,
  shell,
  dialog,
  Menu,
} from "electron";
import { autoUpdater } from "electron-updater";
import * as path from "path";
import * as url from "url";
import * as fs from "fs";
import windowStateKeeper from "electron-window-state";

import { download } from "electron-dl";
import { MenuItemConstructorOptions } from "electron/main";
import Settings from "../src/settings/settings";

let mainWindow: Electron.BrowserWindow | null;
const iconPath = path.join(__dirname, "..", "build", "icons", "icon.png");

async function createWindow() {
  let mainWindowState = windowStateKeeper({
    defaultWidth: 1000,
    defaultHeight: 800,
  });
  mainWindow = new BrowserWindow({
    title: "Boothroyd",
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: false,
      webSecurity: false,
    },
    icon: iconPath,
  });

  mainWindowState.manage(mainWindow);

  const isMac = process.platform === "darwin";
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      ...(isMac
        ? [
            {
              label: app.name,
              submenu: [
                { role: "about" },
                { type: "separator" },
                { role: "services" },
                { type: "separator" },
                { role: "hide" },
                { role: "hideothers" },
                { role: "unhide" },
                { type: "separator" },
                { role: "quit" },
              ] as MenuItemConstructorOptions[],
            },
          ]
        : []),
      {
        label: "File",
        submenu: [
          {
            label: isMac ? "Preferences" : "Options",
            accelerator: "CommandorControl+,",
            click: () => {
              mainWindow?.webContents.send("open-settings");
            },
          },
        ] as MenuItemConstructorOptions[],
      },
      { role: "editMenu" },
    ])
  );

  const settings = await Settings.init(app.getPath("userData"));

  if (settings.get("autoUpdate")) autoUpdater.checkForUpdatesAndNotify();

  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL(`http://localhost:4000`);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file:",
        slashes: true,
      })
    );
  }

  ipcMain.handle("is-dark-mode", () => {
    return nativeTheme.shouldUseDarkColors;
  });

  ipcMain.handle("save-script", async (_, ...args) => {
    let [script, filename] = args;
    if (!filename) {
      // if a filename is not given, open the save-as dialog
      filename = dialog.showSaveDialogSync({
        title: "Save Query",
        filters: [
          { name: "Q Files", extensions: ["q"] },
          { name: "All Files", extensions: ["*"] },
        ],
      });
    }
    if (filename) {
      fs.writeFileSync(filename, script);
    }
    return filename;
  });

  ipcMain.on("update-title", (_, title) => {
    mainWindow?.setTitle(title);
  });

  ipcMain.on("open-file", async (_, info) => {
    // Open a local file in the default app
    const dl = await download(BrowserWindow.getFocusedWindow()!, info.url);
    shell.openPath(dl.getSavePath());
    mainWindow?.webContents.send("download-complete", dl.getURL());
  });

  ipcMain.handle("load-script", async () => {
    const response = await dialog.showOpenDialog({
      filters: [
        { name: "Q Files", extensions: ["q"] },
        { name: "All Files", extensions: ["*"] },
      ],
      properties: ["openFile"],
    });

    if (!response.canceled) {
      const filename = response.filePaths[0];
      const data = fs.readFileSync(filename);
      return {
        data: data.toString(),
        filename,
      };
    }
  });

  ipcMain.handle("data-path", () => {
    return app.getPath("userData");
  });

  nativeTheme.on("updated", () => {
    mainWindow?.webContents.send(
      "colour-scheme-changed",
      nativeTheme.shouldUseDarkColors
    );
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.on("ready", createWindow);

app.allowRendererProcessReuse = true;
