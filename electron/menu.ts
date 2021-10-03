import { Menu, shell, MenuItemConstructorOptions, app } from "electron";
import { BrowserWindow } from "electron/main";

export default function getMenu(
  appName: string,
  mainWindow: BrowserWindow,
  isConnected: boolean = false
): Menu {
  const isMac = process.platform === "darwin";
  const template: MenuItemConstructorOptions[] = [
    // { role: 'appMenu' }
    ...(isMac
      ? [
          {
            label: appName,
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
    // { role: 'fileMenu' }
    {
      label: "File",
      submenu: [
        ...[
          {
            label: "New Connection",
            accelerator: "CommandOrControl+N",
            click: () => {
              mainWindow.webContents.send("show-server-dialog");
            },
          },
          {
            id: "close-connection-item",
            label: "Disconnect Current",
            accelerator: "CommandOrControl+W",
            click: () => {
              mainWindow.webContents.send("close-current-connection");
            },
            enabled: isConnected,
          },
          {
            id: "close-all-connections-item",
            label: "Disconnect All",
            accelerator: "CommandOrControl+Shift+W",
            click: () => {
              mainWindow.webContents.send("close-all-connections");
            },
            enabled: isConnected,
          },
          { type: "separator" },
          {
            id: "open-item",
            label: "Open",
            accelerator: "CommandOrControl+O",
            click: () => {
              mainWindow.webContents.send("open-script");
            },
            enabled: isConnected,
          },
          {
            id: "open-recent-item",
            role: "recentDocuments",
            submenu: [
              {
                label: "Clear Recent",
                role: "clearRecentDocuments",
              },
            ],
            enabled: isConnected,
          },
          {
            id: "save-item",
            label: "Save",
            accelerator: "CommandOrControl+S",
            click: () => {
              mainWindow.webContents.send("save-script");
            },
            enabled: isConnected,
          },
          {
            id: "save-as-item",
            label: "Save As",
            accelerator: "CommandOrControl+Shift+S",
            click: () => {
              mainWindow.webContents.send("save-script-as");
            },
            enabled: isConnected,
          },
          { type: "separator" },
        ],
        ...[isMac ? { role: "close" } : { role: "quit" }],
      ] as MenuItemConstructorOptions[],
    },
    {
      label: "Editor",
      enabled: isConnected,
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "delete" },
        { role: "selectAll" },
        { type: "separator" },
        {
          label: "Find",
          accelerator: "CommandOrControl+F",
          click: () => {
            mainWindow.webContents.send("find");
          },
        },
        {
          label: "Replace",
          accelerator: "CommandOrControl+Alt+F",
          click: () => {
            mainWindow.webContents.send("replace");
          },
        },
      ],
    },
    {
      label: "Server",
      submenu: [
        {
          label: "Add",
          click: () => {
            mainWindow.webContents.send("add-server");
          },
        },
        {
          label: "Edit",
          click: () => {
            mainWindow.webContents.send("edit-server");
          },
        },
        {
          label: "Delete",
          click: () => {
            mainWindow.webContents.send("delete-server");
          },
        },
        {
          label: "Clone Current",
          click: () => {
            mainWindow.webContents.send("clone-current-server");
          },
        },
      ],
    },
    {
      label: "Query",
      submenu: [
        {
          label: "Refresh",
          accelerator: "CommandOrControl+R",
          click: () => {
            mainWindow.webContents.send("refresh-results");
          },
        },
      ] as MenuItemConstructorOptions[],
    },
    // { role: 'windowMenu' }
    {
      label: "Window",
      submenu: [
        { role: "togglefullscreen" },
        { role: "minimize" },
        { role: "zoom" },
        ...(isMac
          ? [
              { type: "separator" },
              { role: "front" },
              { type: "separator" },
              { role: "window" },
            ]
          : [{ role: "close" }]),
      ] as MenuItemConstructorOptions[],
    },
    {
      role: "help",
      submenu: [
        {
          label: "Learn More",
          click: async () => {
            await shell.openExternal("https://code.kx.com/q/learn/");
          },
        },
        ...(isMac ? [] : [{ role: "about" }]),
      ] as MenuItemConstructorOptions[],
    },
  ];

  return Menu.buildFromTemplate(template);
}
