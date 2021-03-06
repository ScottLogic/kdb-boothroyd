const assert = require("assert");

describe("Server List", () => {
  before(async function () {
    this.appWindow = await this.app.firstWindow();
    await this.appWindow.reload();
    await this.appWindow.waitForLoadState("domcontentloaded");
    this.modal = await this.appWindow.$(".server-management-modal");
  });

  it("should display the correct list of servers", async function () {
    await this.modal.waitForSelector(".server-list li");
    const servers = await this.modal.$$(".server-list li");

    assert.strictEqual(servers.length, 1);
    assert.strictEqual(await servers[0].innerText(), "Localhost");
  });

  it("should have an enabled Add button", async function () {
    const button = await this.modal.$('button:has-text("Add")');
    assert.notStrictEqual(button, null);
    assert.strictEqual(await button.getAttribute("aria-disabled"), null);
  });

  it("should have a disabled Delete button if no server selected", async function () {
    const addButton = await this.modal.$('button:has-text("Add")');
    await addButton.click();
    await this.appWindow.waitForTimeout(100);

    const button = await this.modal.$('button:has-text("Delete")');
    assert.notStrictEqual(button, null);
    assert.strictEqual(await button.getAttribute("aria-disabled"), "true");
  });

  it("should enable the Delete button if I select a server", async function () {
    (await this.modal.$(":nth-match(.server-list li, 1)")).click();
    // Give time for re-render
    await this.appWindow.waitForTimeout(500);
    const button = await this.modal.$('button:has-text("Delete")');
    assert.notStrictEqual(button, null);
    assert.strictEqual(await button.getAttribute("aria-disabled"), null);
  });
});
