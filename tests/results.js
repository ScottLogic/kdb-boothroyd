const assert = require("assert");
const cleanupDB = require("./cleanup");

const isMac = process.platform === "darwin";

describe("Results Window", function () {
  before(async function () {
    this.appWindow = await this.app.firstWindow();
    await this.appWindow.waitForLoadState("domcontentloaded");
    this.modal = await this.appWindow.$(".server-management-modal");
    const serverList = await this.modal.$(".server-list");
    serverList.waitForElementState("visible");
    const server = await this.modal.$(":nth-match(.server-list li, 1)");
    await server.click();
    await this.appWindow.waitForTimeout(50);

    const connectButton = await this.modal.$('button:has-text("Connect")');

    await connectButton.click();
    await this.modal.waitForElementState("hidden");
  });

  it("should display the results of an instruction as the raw response", async function () {
    this.timeout(20000);
    const editor = await this.appWindow.$(".monaco-editor textarea");

    const query = "d:`a`b`c!100 200 300";
    await editor.press(`${isMac ? "Meta" : "Control"}+a`);
    await editor.type(query);
    await editor.press(`${isMac ? "Meta" : "Control"}+Enter`);

    const resultsView = await this.appWindow.waitForSelector(
      ".raw-results-view"
    );
    assert.strictEqual(await resultsView.innerText(), `"${query}"`);

    await this.appWindow.waitForTimeout(5000);
  });

  it("should display a dictionary correctly", async function () {
    this.timeout(20000);
    const editor = await this.appWindow.$(".monaco-editor textarea");

    const query = "d";
    await editor.press(`${isMac ? "Meta" : "Control"}+a`);
    await editor.type(query);
    await editor.press(`${isMac ? "Meta" : "Control"}+Enter`);

    const resultsView = await this.appWindow.waitForSelector(
      ".table-results-view"
    );

    const table = await resultsView.$(".ag-root-wrapper");

    assert.notStrictEqual(table, null);

    const headers = await table.$$(".ag-header .ag-header-cell");
    assert.strictEqual(headers.length, 2);
    assert.strictEqual(await headers[0].innerText(), "Key");
    assert.strictEqual(await headers[1].innerText(), "Value");

    const rows = await table.$$(
      ".ag-body-viewport .ag-center-cols-clipper .ag-row"
    );
    assert.strictEqual(rows.length, 3);

    const cells = await rows[0].$$(".ag-cell");
    assert.strictEqual(cells.length, 2);
    assert.strictEqual(await cells[0].innerText(), "a");
    assert.strictEqual(await cells[1].innerText(), "100");

    await this.appWindow.waitForTimeout(5000);
  });

  it("should display a table correctly", async function () {
    this.timeout(20000);
    const editor = await this.appWindow.$(".monaco-editor textarea");

    const query = "t:flip `name`iq!(`Dent`Beeblebrox`Prefect;98 42 126);t";
    await editor.press(`${isMac ? "Meta" : "Control"}+a`);
    await editor.type(query);
    await editor.press(`${isMac ? "Meta" : "Control"}+Enter`);

    const resultsView = await this.appWindow.waitForSelector(
      ".table-results-view"
    );

    const table = await resultsView.$(".ag-root-wrapper");

    assert.notStrictEqual(table, null);

    const headers = await table.$$(".ag-header .ag-header-cell");
    assert.strictEqual(headers.length, 3);
    assert.strictEqual(await headers[0].innerText(), "#");
    assert.strictEqual(await headers[1].innerText(), "Name");
    assert.strictEqual(await headers[2].innerText(), "Iq");

    const rows = await table.$$(
      ".ag-body-viewport .ag-center-cols-clipper .ag-row"
    );
    assert.strictEqual(rows.length, 3);

    const cells = await rows[0].$$(".ag-cell");
    assert.strictEqual(cells.length, 3);
    assert.strictEqual(await cells[0].innerText(), "1");
    assert.strictEqual(await cells[1].innerText(), "Dent");
    assert.strictEqual(await cells[2].innerText(), "98");

    await this.appWindow.waitForTimeout(5000);
  });

  it("should be able to toggle between table and results view", async function () {
    this.timeout(20000);

    const rawTab = await this.appWindow.$(".raw-view-tab");
    await rawTab.click();

    let resultsView = await this.appWindow.waitForSelector(".raw-results-view");

    assert.strictEqual(
      await resultsView.innerText(),
      `[
  {
    "name": "Dent",
    "iq": 98
  },
  {
    "name": "Beeblebrox",
    "iq": 42
  },
  {
    "name": "Prefect",
    "iq": 126
  }
]`
    );

    const tableTab = await this.appWindow.$(".table-view-tab");

    await tableTab.click();

    resultsView = await this.appWindow.waitForSelector(".table-results-view");

    const table = await resultsView.$(".ag-root-wrapper");

    assert.notStrictEqual(table, null);

    const headers = await table.$$(".ag-header .ag-header-cell");
    assert.strictEqual(headers.length, 3);
    assert.strictEqual(await headers[0].innerText(), "#");
    assert.strictEqual(await headers[1].innerText(), "Name");
    assert.strictEqual(await headers[2].innerText(), "Iq");

    const rows = await table.$$(
      ".ag-body-viewport .ag-center-cols-clipper .ag-row"
    );
    assert.strictEqual(rows.length, 3);

    const cells = await rows[0].$$(".ag-cell");
    assert.strictEqual(cells.length, 3);
    assert.strictEqual(await cells[0].innerText(), "1");
    assert.strictEqual(await cells[1].innerText(), "Dent");
    assert.strictEqual(await cells[2].innerText(), "98");

    await this.appWindow.waitForTimeout(5000);
  });

  after(async function () {
    await cleanupDB("delete t from `.; delete d from `.");
    await this.appWindow.reload();
  });
});
