const assert = require("assert")

describe ("Server Management", function () {
  
  before(async function () {
    this.appWindow = await this.app.firstWindow()
    await this.appWindow.waitForLoadState('domcontentloaded')
    this.modal = await this.appWindow.$('.server-management-modal')
  })

  it ("should have Server and Authorisation tabs", async function () {
    const tabs = await this.modal.$$(".edit-tabs button")

    assert.strictEqual(tabs.length, 2)
    assert.strictEqual(await tabs[0].innerText(), "Server")
    assert.strictEqual(await tabs[1].innerText(), "Authorisation")
  })

  describe ("Add Server", function () {
    
    it ("should give me a blank form if I click Add", async function () {
      
      const button = await this.modal.$('button:has-text("Add")')
      await button.click()
      await this.appWindow.waitForTimeout(100)

      const nameField = await this.modal.$('.server-tab .name-input input')
      const hostField = await this.modal.$('.server-tab .host-input input')
      const portField = await this.modal.$('.server-tab .port-input input')
      const tlsCheck = await this.modal.$('.server-tab .tls-check input')

      assert.notStrictEqual(nameField, null, "Name field does not exist")
      assert.strictEqual(await nameField.inputValue(), "", "Name field is not blank")
      assert.notStrictEqual(hostField, null, "Host field does not exist")
      assert.strictEqual(await hostField.inputValue(), "", "Host field is not blank")
      assert.notStrictEqual(portField, null, "Port field does not exist")
      assert.strictEqual(await portField.inputValue(), "0", "Port field is not 0")
      assert.notStrictEqual(tlsCheck, null, "TLS checkbox does not exist")
      assert.strictEqual(await tlsCheck.isChecked(), false, "TLS checkbox is checked")

      const authTab = await this.modal.$(".edit-tabs button:has-text('Authorisation')")
      await authTab.click()
      await this.appWindow.waitForTimeout(100)

      const usernameField = await this.modal.$('.auth-tab .username-input input')
      const passwordField = await this.modal.$('.auth-tab .password-input input')

      assert.notStrictEqual(usernameField, null, "Username field does not exist")
      assert.strictEqual(await usernameField.inputValue(), "", "Username field is not blank")
      assert.notStrictEqual(passwordField, null, "Password field does not exist")
      assert.strictEqual(await passwordField.inputValue(), "", "Password field is not blank")

      const saveButton = await this.modal.$('button:has-text("Save")')

      assert.notStrictEqual(saveButton, null, "Save button does not exist")
      assert.strictEqual(await saveButton.getAttribute("aria-disabled"), "true", "Save button is not disabled")

    })

    it ("should add a new server without tls or username and password", async function () {

      const button = await this.modal.$('button:has-text("Add")')
      await button.click()
      await this.appWindow.waitForTimeout(100)

      const serverTab = await this.modal.$(".edit-tabs button:has-text('Server')")
      await serverTab.click()
      await this.appWindow.waitForTimeout(100)

      const nameField = await this.modal.$('.server-tab .name-input input')
      const hostField = await this.modal.$('.server-tab .host-input input')
      const portField = await this.modal.$('.server-tab .port-input input')
      const tlsCheck = await this.modal.$('.server-tab .tls-check input')

      await nameField.type("Test 1")
      await hostField.type("0.0.0.0")
      await portField.selectText()
      await portField.type("5001")

      assert.strictEqual(await nameField.inputValue(), "Test 1", "Name field is not updated")
      assert.strictEqual(await hostField.inputValue(), "0.0.0.0", "Host field is not updated")
      assert.strictEqual(await portField.inputValue(), "5001", "Port field is not updated")
      assert.strictEqual(await tlsCheck.isChecked(), false, "TLS checkbox is checked")

      const saveButton = await this.modal.$('button:has-text("Save")')

      assert.strictEqual(await saveButton.getAttribute("aria-disabled"), null, "Save button is still disabled")
      await saveButton.click()
      await this.appWindow.waitForTimeout(100)

      const servers = await this.modal.$$(".server-list li")
    
      assert.strictEqual(servers.length, 2)
      assert.strictEqual(await servers[0].innerText(), "Localhost")
      assert.strictEqual(await servers[1].innerText(), "Test 1")
      
      //const link = await servers[1].$('.ms-Nav-compositeLink.is-selected')
      //assert.notStrictEqual(link, null)

    })

  })
  
})