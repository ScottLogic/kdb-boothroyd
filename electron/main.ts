import { app, BrowserWindow, ipcMain, nativeTheme } from "electron";
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import * as path from "path";
import * as url from "url";

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
  .whenReady().then(() => {
    installExtension(REACT_DEVELOPER_TOOLS)
        .then((name) => console.log(`Added Extension:  ${name}`))
        .catch((err) => console.log('An error occurred: ', err));
  });
app.allowRendererProcessReuse = true;
