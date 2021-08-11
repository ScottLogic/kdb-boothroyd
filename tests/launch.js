const assert = require("assert")

describe("Application Launch", function() {

  it('shows an initial window', async function () {
    const windows = await this.app.windows()
    assert.strictEqual(windows.length, 1)
  })

  it ('should have the correct title', async function () {
    const appWindow = await this.app.firstWindow()
    const title = await appWindow.title()
    
    assert.strictEqual(title, "KDB Studio 2")
  })

  it ('should show the server manager dialog on launch', async function() {
    const appWindow = await this.app.firstWindow()
    await appWindow.waitForLoadState('domcontentloaded')
    const dialogs = await appWindow.$$(".server-management-modal")

    assert.strictEqual(dialogs.length, 1)
  })
});