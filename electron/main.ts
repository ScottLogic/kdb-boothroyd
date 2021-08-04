import { app, BrowserWindow, ipcMain, nativeTheme, shell, dialog } from "electron";
import * as path from "path";
import * as url from "url";
import * as fs from "fs";


import { download } from "electron-dl"

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

  ipcMain.handle("is-dark-mode", () => {
    return nativeTheme.shouldUseDarkColors
  })

  ipcMain.on("download", async (_, info) => {
    const dl = await download(BrowserWindow.getFocusedWindow()!, info.url, info.properties)
    mainWindow?.webContents.send("download-complete", dl.getURL())
  })

  ipcMain.on("open-file", async(_, info) => {
    // Open a local file in the default app
    const dl = await download(BrowserWindow.getFocusedWindow()!, info.url)
    shell.openPath(dl.getSavePath())
    mainWindow?.webContents.send("download-complete", dl.getURL())
  })

  ipcMain.on("show-open-dialog", async () => {
    const response = await dialog.showOpenDialog({
      filters:[{name:"Q Files", extensions:["*.q"]}],
      properties: ['openFile'] 
    })

    if (!response.canceled) {
        // handle fully qualified file name
      try {
        fs.readFile(response.filePaths[0], (err, data) =>{
          
          if (err)
            return mainWindow?.webContents.send("show-error", err)

          mainWindow?.webContents.send("file-opened", data.toString())
        })
      } catch (e) {
        mainWindow?.webContents.send("show-error", e)
      }
    } else {
      console.log("no file selected");
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
