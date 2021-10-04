const assert = require("assert");
const cleanupDB = require("./cleanup");

const isMac = process.platform === "darwin";

describe("Editor Window", function () {
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

  it("should have a visible instance of Monaco Editor", async function () {
    const editor = await this.appWindow.$(".monaco-editor");

    assert.notStrictEqual(editor, null, "Editor not initialised");
    assert.strictEqual(await editor.isVisible(), true, "Editor not visible");

    const dimensions = await editor.boundingBox();
    assert.strictEqual(
      dimensions.height > 0,
      true,
      "Editor height not greater than 0"
    );
    assert.strictEqual(
      dimensions.width > 0,
      true,
      "Editor width not greater than 0"
    );
  });

  it("should execute a query from pressing the go button", async function () {
    this.timeout(20000);
    this.retries(2);

    const editor = await this.appWindow.$(".monaco-editor textarea");

    const query = "t:flip `name`iq!(`Dent`Beeblebrox`Prefect;98 42 126)";
    await editor.press(`${isMac ? "Meta" : "Control"}+a`);
    await editor.type(query);

    const goButton = await this.appWindow.$(".go-button");
    await goButton.click();

    await this.appWindow.waitForSelector(
      ":nth-match(.table-list .ms-GroupedList-group, 1)"
    );

    const tableList = await this.appWindow.$$(
      ".table-list .ms-GroupedList-group"
    );

    assert.strictEqual(tableList.length, 1);

    const label = await tableList[0].$(":nth-match(.ms-Stack button, 1)");
    assert.strictEqual(await label.textContent(), "t");

    const resultsView = await this.appWindow.$(".raw-results-view");
    assert.strictEqual(await resultsView.innerText(), `"${query}"`);
  });

  it("should execute the full query from Ctrl+E", async function () {
    this.timeout(20000);
    this.retries(2);

    const editor = await this.appWindow.$(".monaco-editor textarea");

    const query = "t2:flip `name`iq!(`Dent`Beeblebrox`Prefect;98 42 126)";
    await editor.press(`${isMac ? "Meta" : "Control"}+a`);
    await editor.type(query);
    await editor.press(`${isMac ? "Meta" : "Control"}+e`);

    await this.appWindow.waitForSelector(
      ":nth-match(.table-list .ms-GroupedList-group, 2)"
    );

    const tableList = await this.appWindow.$$(
      ".table-list .ms-GroupedList-group"
    );

    assert.strictEqual(tableList.length, 2);

    const label = await tableList[1].$(":nth-match(.ms-Stack button, 1)");
    assert.strictEqual(await label.textContent(), "t2");

    const resultsView = await this.appWindow.$(".raw-results-view");
    assert.strictEqual(await resultsView.innerText(), `"${query}"`);
  });

  it("should execute the selection when I select part of the query and press Ctrl+E", async function () {
    this.timeout(20000);
    this.retries(2);

    const editor = await this.appWindow.$(".monaco-editor textarea");

    const query = "tables[];\n2+2";
    await editor.press(`${isMac ? "Meta" : "Control"}+a`);
    await editor.type(query);
    await editor.press(`${isMac ? "Shift+Meta+ArrowLeft" : "Shift+Home"}`);
    await editor.press(`${isMac ? "Meta" : "Control"}+e`);

    const resultsView = await this.appWindow.waitForSelector(
      ".raw-results-view"
    );
    assert.strictEqual(await resultsView.innerText(), `4`);
  });

  it("should execute the current line when I press Ctrl+Enter", async function () {
    this.timeout(20000);
    this.retries(2);

    const editor = await this.appWindow.$(".monaco-editor textarea");

    const query = "2+2;\ntables[]";
    await editor.press(`${isMac ? "Meta" : "Control"}+a`);
    await editor.type(query);
    await editor.press(`ArrowUp`);
    await editor.press(`${isMac ? "Meta" : "Control"}+Enter`);

    const resultsView = await this.appWindow.waitForSelector(
      ".raw-results-view"
    );
    assert.strictEqual(await resultsView.innerText(), `4`);
  });

  /*it ("should load a query", async function () {

    this.appWindow.on('filechooser', async (fileChooser) => {  
      console.log("FILECHOOSER")
      await fileChooser.setFiles('./tests/fixtures/script.q');
    });

    const openButton = await this.appWindow.$(".open-button")
    await openButton.click()

  })*/

  after(async function () {
    await cleanupDB("delete t from `.; delete t2 from `.");
    await this.appWindow.reload();
  });
});
