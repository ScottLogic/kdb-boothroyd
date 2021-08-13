import { Menu, shell, MenuItemConstructorOptions } from "electron";
import { BrowserWindow } from "electron/main";

export default function getMenu(
  appName: string,
  mainWindow: BrowserWindow
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
        isMac ? { role: "close" } : { role: "quit" },
      ] as MenuItemConstructorOptions[],
    },
    // { role: 'editMenu' }
    {
      label: "Editor",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "delete" },
        { type: "separator" },
        { role: "selectAll" },
      ],
    },
    // { role: 'viewMenu' }
    {
      label: "Results",
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
      ] as MenuItemConstructorOptions[],
    },
  ];

  return Menu.buildFromTemplate(template);
}
