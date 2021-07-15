// Modules to control application life and create native browser window
const { app, BrowserWindow } = require("electron");
const { ipcMain, dialog } = require("electron");
const fs = require("fs");

const APP_NAME = "KDB Studio2";
const FILE_FILTERS = [{ name: "Custom File Type", extensions: ["q"] }];

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    title: APP_NAME,
    width: 800,
    height: 600,
    webPreferences: {
      // enable node integration within the renderer process. Note
      // this can be a significant security issue!
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });

  ipcMain.on("save-query", (_, data) => {
    const filename = dialog.showSaveDialogSync({
      title: "Save Query",
      filters: FILE_FILTERS,
    });
    if (filename) {
      mainWindow.title = `${APP_NAME} -  ${filename}`;
      fs.writeFileSync(filename, data);
    }
  });

  ipcMain.on("load-query", (event) => {
    const filename = dialog.showOpenDialogSync(mainWindow, {
      filters: FILE_FILTERS,
      properties: ["openFile"],
    });
    if (filename && filename.length) {
      mainWindow.title = `${APP_NAME} -  ${filename[0]}`;
      const file = fs.readFileSync(filename[0], "utf8");
      event.returnValue = file;
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile("index.html");
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
