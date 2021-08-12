const assert = require("assert");

describe("Server Connection", () => {
  before(async function () {
    this.appWindow = await this.app.firstWindow();
    await this.appWindow.waitForLoadState("domcontentloaded");
    this.modal = await this.appWindow.$(".server-management-modal");
  });

  it("should not let me connect without details entered", async function () {
    const button = await this.modal.$('button:has-text("Add")');
    await button.click();
    await this.appWindow.waitForTimeout(100);

    const connectButton = await this.modal.$('button:has-text("Connect")');

    assert.notStrictEqual(connectButton, null, "Connect button does not exist");
    assert.strictEqual(
      await connectButton.getAttribute("aria-disabled"),
      "true",
      "Connect button is not disabled"
    );
  });

  it("should connect to the server successfully", async function () {
    this.timeout(10000);
    const server = await this.modal.$(":nth-match(.server-list li, 1)");
    await server.click();
    await this.appWindow.waitForTimeout(100);

    const connectButton = await this.modal.$('button:has-text("Connect")');

    assert.notStrictEqual(connectButton, null, "Connect button does not exist");
    assert.strictEqual(
      await connectButton.getAttribute("aria-disabled"),
      null,
      "Connect button is disabled"
    );

    await connectButton.click();
    await this.modal.waitForElementState("hidden");

    const tabs = await this.appWindow.$$(
      ".connection-tabs button.ms-Pivot-link:visible"
    );

    assert.strictEqual(tabs.length, 1);
    assert.strict(
      await tabs[0].getAttribute("aria-selected"),
      "true",
      "New connection tab is not selected"
    );

    const tabText = await tabs[0].$(".ms-Pivot-text");
    assert.strictEqual(
      await tabText.innerText(),
      "Localhost",
      "Connection tab is labelled incorrectly"
    );
  });

  it("should handle multiple connections", async function () {
    this.timeout(10000);

    const serversButton = await this.appWindow.$(".show-servers-button");
    await serversButton.click();
    await this.appWindow.waitForTimeout(100);

    this.modal = await this.appWindow.$(".server-management-modal");

    assert.notStrictEqual(this.modal, null, "Server modal has not appeared");

    const server = await this.modal.$(":nth-match(.server-list li, 1)");
    await server.click();
    await this.appWindow.waitForTimeout(100);

    const connectButton = await this.modal.$('button:has-text("Connect")');

    await connectButton.click();
    await this.modal.waitForElementState("hidden");

    const tabs = await this.appWindow.$$(
      ".connection-tabs button.ms-Pivot-link:visible"
    );

    assert.strictEqual(tabs.length, 2);
    assert.strict(
      await tabs[1].getAttribute("aria-selected"),
      "true",
      "New connection tab is not selected"
    );

    const tabText = await tabs[1].$(".ms-Pivot-text");
    assert.strictEqual(
      await tabText.innerText(),
      "Localhost",
      "Connection tab is labelled incorrectly"
    );
  });
});
