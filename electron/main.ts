import { app, BrowserWindow, ipcMain, nativeTheme, shell, dialog, Menu } from "electron";
import * as path from "path";
import * as url from "url";
import * as fs from "fs";


import { download } from "electron-dl"
import getMenu from "./menu";

let mainWindow: Electron.BrowserWindow | null;
const iconPath = path.join(__dirname, "..", "build", "icons", "icon.png")

function createWindow() {

  mainWindow = new BrowserWindow({
    title: "KDB Studio 2",
    width: 900,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: false,
      webSecurity: false,
    },
    icon: iconPath
  });

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

  Menu.setApplicationMenu(getMenu(app.name))

  ipcMain.handle("is-dark-mode", () => {
    return nativeTheme.shouldUseDarkColors
  })

  ipcMain.handle("save-script", async (_, ...args) => {
    let [script, filename] = args;
    if (!filename) {
      // if a filename is not given, open the save-as dialog
      filename = dialog.showSaveDialogSync({
        title: "Save Query",
        filters:[{name:"Q Files", extensions:["*.q"]}],
      });
    }
    if (filename) {
      fs.writeFileSync(filename, script);
    }
    return filename;
  })

  ipcMain.on("open-file", async(_, info) => {
    // Open a local file in the default app
    const dl = await download(BrowserWindow.getFocusedWindow()!, info.url)
    shell.openPath(dl.getSavePath())
    mainWindow?.webContents.send("download-complete", dl.getURL())
  })

  ipcMain.handle("load-script", async () => {
    const response = await dialog.showOpenDialog({
      filters:[{name:"Q Files", extensions:["*.q"]}],
      properties: ['openFile'] 
    })

    if (!response.canceled) {
      const filename = response.filePaths[0]
      const data = fs.readFileSync(filename)
      return {
        data: data.toString(),
        filename
      };
    } 
  })

  nativeTheme.on("updated", () => {
    mainWindow?.webContents.send(
      "colour-scheme-changed", 
      nativeTheme.shouldUseDarkColors
    )
  })

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app
  .on("ready", createWindow)
  
app.allowRendererProcessReuse = true;
