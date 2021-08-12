const assert = require("assert");

describe.only("Table List", function () {
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
});
