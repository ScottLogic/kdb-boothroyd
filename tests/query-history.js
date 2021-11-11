const assert = require("assert");
const cleanupDB = require("./cleanup");

const isMac = process.platform === "darwin";

describe("Query History", function () {
  before(async function () {
    this.timeout(5000);
    this.appWindow = await this.app.firstWindow();
    await this.appWindow.waitForLoadState("domcontentloaded");
    this.modal = await this.appWindow.$(".server-management-modal");
    await this.modal.waitForSelector(".server-list li");
    const server = await this.modal.$(":nth-match(.server-list li, 1)");
    await server.click();
    await this.appWindow.waitForTimeout(50);

    const connectButton = await this.modal.$('button:has-text("Connect")');

    await connectButton.click();
    await this.modal.waitForElementState("hidden");

    const editor = await this.appWindow.$(".monaco-editor textarea");
    const goButton = await this.appWindow.$(".go-button");

    const query = "t:flip `name`iq!(`Dent`Beeblebrox`Prefect;98 42 126)";
    await editor.press(`${isMac ? "Meta" : "Control"}+a`);
    await editor.type(query);
    await goButton.click();

    const query2 = "tables[]";
    await editor.press(`${isMac ? "Meta" : "Control"}+a`);
    await editor.type(query2);
    await goButton.click();

    const query3 = "t";
    await editor.press(`${isMac ? "Meta" : "Control"}+a`);
    await editor.type(query3);
    await goButton.click();

    await this.appWindow.waitForSelector(
      ":nth-match(.table-list .ms-GroupedList-group, 1)"
    );
  });

  it("should display the Query History", async function () {
    const historyButton = await this.appWindow.$(".history-button");
    await historyButton.click();

    const panel = await this.appWindow.waitForSelector(
      ".ms-Panel.is-open.history-panel"
    );
    assert.notStrictEqual(panel, null);

    const entries = await panel.$$(".ms-DetailsRow");

    assert.strictEqual(entries.length, 3);
  });

  it("should let me select copy a previous query", async function () {
    const panel = await this.appWindow.waitForSelector(
      ".ms-Panel.is-open.history-panel"
    );
    const row = await panel.$(":nth-match(.ms-DetailsRow, 2)");

    const copyButton = await row.$(".ms-Button--icon");
    await copyButton.click();

    await this.appWindow.waitForSelector(".ms-Panel.is-open.history-panel", {
      state: "hidden",
    });

    const editor = await this.appWindow.$(".monaco-editor textarea");

    await editor.press(`${isMac ? "Meta" : "Control"}+a`);
    await editor.press(`${isMac ? "Meta" : "Control"}+v`);

    assert.strictEqual(await editor.inputValue(), "tables[]");
  });

  after(async function () {
    await cleanupDB("delete t from `.; delete t2 from `.");
    await this.appWindow.reload();
  });
});
