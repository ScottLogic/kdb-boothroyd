const assert = require("assert");

const isMac = process.platform === "darwin";
const expected = {
  ...(isMac
    ? {
        Electron: [
          "About Electron",
          "",
          "Services",
          "",
          "Hide Electron",
          "Hide Others",
          "Show All",
          "",
          "Quit Electron",
        ],
      }
    : {}),
  File: [isMac ? "Close Window" : "Quit"],
  Editor: [
    "Undo",
    "Redo",
    "",
    "Cut",
    "Copy",
    "Paste",
    "Delete",
    "",
    "Select All",
  ],
  Results: ["Refresh"],
  Window: ["Minimize", "Zoom", "", "Bring All to Front", "", "Window"],
  Help: ["Learn More"],
};

describe("Top Level Menu", function () {
  it("Should have the correct menu items", async function () {
    const menuItems = await this.app.evaluate(({ Menu }) => {
      const menu = Menu.getApplicationMenu();
      return Object.fromEntries(
        menu.items.map((m) => {
          return [m.label, m.submenu.items.map((s) => s.label)];
        })
      );
    });

    assert.deepStrictEqual(menuItems, expected);
  });
});
