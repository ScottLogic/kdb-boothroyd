const assert = require("assert");
const cleanupDB = require("./cleanup");

const isMac = process.platform === "darwin";

describe("Table List", function () {
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
  });

  it("should be collapsible and expandable", async function () {
    const tableList = await this.appWindow.$(".table-list");

    assert.notStrictEqual(tableList, null, "Table List is missing");

    let dimensions = await tableList.boundingBox();
    assert.strictEqual(dimensions.width, 200);

    let headerText = await tableList.$("text=Tables:");
    assert.notStrictEqual(headerText, null);

    const collapseButton = await tableList.$(".collapse-panel-button");
    assert.notStrictEqual(collapseButton, null, "Collapse button missing");

    await collapseButton.click();
    await this.appWindow.waitForTimeout(50);

    dimensions = await tableList.boundingBox();
    assert.strictEqual(dimensions.width, 50);

    headerText = await tableList.$("text=Tables:");
    assert.strictEqual(headerText, null);

    await collapseButton.click();
    await this.appWindow.waitForTimeout(50);

    dimensions = await tableList.boundingBox();
    assert.strictEqual(dimensions.width, 200);

    headerText = await tableList.$("text=Tables:");
    assert.notStrictEqual(headerText, null);
  });

  it("should show No Tables if there are no tables in the db", async function () {
    const tableList = await this.appWindow.$(".table-list");

    assert.notStrictEqual(tableList, null, "Table List is missing");

    const noTablesMessage = tableList.$('span:has-text("No Tables")');

    assert.notStrictEqual(noTablesMessage, null);
  });

  it("should show the correct details for a table", async function () {
    this.timeout(20000);
    this.retries(2);

    const editor = await this.appWindow.$(".monaco-editor textarea");

    const query = "t:flip `name`iq!(`Dent`Beeblebrox`Prefect;98 42 126)";
    await editor.press(`${isMac ? "Meta" : "Control"}+a`);
    await editor.type(query);
    await editor.press(`${isMac ? "Meta" : "Control"}+Enter`);

    await this.appWindow.waitForSelector(
      ":nth-match(.table-list .ms-GroupedList-group, 1)"
    );

    const tableList = await this.appWindow.$$(
      ".table-list .ms-GroupedList-group"
    );
    assert.strictEqual(tableList.length, 1);

    const label = await tableList[0].$(":nth-match(.ms-Stack button, 1)");
    assert.strictEqual(await label.textContent(), "t");

    const toggle = await tableList[0].$(":nth-match(.ms-Stack > i,1)");

    await toggle.click();
    await tableList[0].waitForSelector(".ms-List");

    const columns = await tableList[0].$$(".ms-List .ms-List-cell");

    assert.strictEqual(columns.length, 2);
    assert.strictEqual(await columns[0].innerText(), "name (symbol)");
    assert.strictEqual(await columns[1].innerText(), "iq (long)");
  });

  it("should query the table when I click on it", async function () {
    this.timeout(20000);
    this.retries(2);

    const tableEntry = await this.appWindow.$(
      ":nth-match(.table-list .ms-GroupedList-group, 1)"
    );

    const label = await tableEntry.$(":nth-match(.ms-Stack button, 1)");
    await label.click();

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
  });

  after(async function () {
    await cleanupDB("delete t from `.;");
    await this.appWindow.reload();
  });
});
