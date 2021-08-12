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
    
      assert.strictEqual(servers.length, 2, "New server not listed")
      assert.strictEqual(await servers[0].innerText(), "Localhost")
      assert.strictEqual(await servers[1].innerText(), "Test 1")
      
      const link = await servers[1].$('.ms-Nav-compositeLink.is-selected')
      assert.notStrictEqual(link, null)

    })

    it ("should add a new server with tls and username and password", async function () {
      this.timeout(5000)

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
  
      await nameField.type("Test 2")
      await hostField.type("0.0.0.0")
      await portField.selectText()
      await portField.type("5001")
      await tlsCheck.evaluate(node => node.checked = true)
      
      assert.strictEqual(await nameField.inputValue(), "Test 2", "Name field is not updated")
      assert.strictEqual(await hostField.inputValue(), "0.0.0.0", "Host field is not updated")
      assert.strictEqual(await portField.inputValue(), "5001", "Port field is not updated")
      assert.strictEqual(await tlsCheck.isChecked(), true, "TLS checkbox is not checked")
  
      const authTab = await this.modal.$(".edit-tabs button:has-text('Authorisation')")
      await authTab.click()
      await this.appWindow.waitForTimeout(100)
  
      const usernameField = await this.modal.$('.auth-tab .username-input input')
      const passwordField = await this.modal.$('.auth-tab .password-input input')
  
      await usernameField.type("user")
      await passwordField.type("password")

      assert.strictEqual(await usernameField.inputValue(), "user", "Username field is not blank")
      assert.strictEqual(await passwordField.inputValue(), "password", "Password field is not blank")
  
      const saveButton = await this.modal.$('button:has-text("Save")')
  
      assert.strictEqual(await saveButton.getAttribute("aria-disabled"), null, "Save button is still disabled")
      await saveButton.click()
      await this.appWindow.waitForTimeout(100)
  
      const servers = await this.modal.$$(".server-list li")
    
      assert.strictEqual(servers.length, 3, "New server not listed")
      assert.strictEqual(await servers[0].innerText(), "Localhost")
      assert.strictEqual(await servers[1].innerText(), "Test 1")
      assert.strictEqual(await servers[2].innerText(), "Test 2")
      
      const link = await servers[2].$('.ms-Nav-compositeLink.is-selected')
      assert.notStrictEqual(link, null)
  
    })
  describe("Delete Server", function () {

    it("should ask me if to confirm deletion of a server", async function () {

      const serverToDelete = await this.modal.$(":nth-match(.server-list li, 3)")

      await serverToDelete.click()
      await this.appWindow.waitForTimeout(100)

      const deleteButton = await this.modal.$("button:has-text('Delete')")
      await deleteButton.click()
      await this.appWindow.waitForTimeout(100)

      const deleteConfirmation = await this.appWindow.$('.server-delete-confirmation')

      assert.notStrictEqual(deleteConfirmation, null)

      const title = await deleteConfirmation.$('.ms-Dialog-title')
      const content = await deleteConfirmation.$('p.ms-Dialog-subtext')

      assert.strictEqual(await title.innerText(), "Delete Server")
      assert.strictEqual(await content.innerText(), "Are you sure you want to delete this server?")

      const confirm = await deleteConfirmation.$('.ms-Button--primary:has-text("Delete")')
      const cancel = await deleteConfirmation.$('.ms-Button--default:has-text("Cancel")')

      assert.notStrictEqual(confirm, null)
      assert.notStrictEqual(cancel, null)

      await cancel.click()
    })

    it("should not delete if I cancel", async function () {

      const serverToDelete = await this.modal.$(":nth-match(.server-list li, 3)")

      await serverToDelete.click()
      await this.appWindow.waitForTimeout(100)

      const deleteButton = await this.modal.$("button:has-text('Delete')")
      await deleteButton.click()
      await this.appWindow.waitForTimeout(100)

      let deleteConfirmation = await this.appWindow.$('.server-delete-confirmation')
      
      const cancel = await deleteConfirmation.$('button.ms-Button--default:has-text("Cancel")')
      await cancel.click()
      await this.appWindow.waitForTimeout(500)
      
      deleteConfirmation = await this.appWindow.$('.server-delete-confirmation')
      assert.strictEqual(deleteConfirmation, null)

      const servers = await this.modal.$$(".server-list li")
          
      assert.strictEqual(servers.length, 3, "Incorrect number of servers")
      assert.strictEqual(await servers[0].innerText(), "Localhost")
      assert.strictEqual(await servers[1].innerText(), "Test 1")
      assert.strictEqual(await servers[2].innerText(), "Test 2")

    })

    it("should delete if I confirm", async function () {

      const serverToDelete = await this.modal.$(":nth-match(.server-list li, 3)")

      await serverToDelete.click()
      await this.appWindow.waitForTimeout(100)

      const deleteButton = await this.modal.$("button:has-text('Delete')")
      await deleteButton.click()
      await this.appWindow.waitForTimeout(100)

      let deleteConfirmation = await this.appWindow.$('.server-delete-confirmation')
      
      const confirm = await deleteConfirmation.$('button.ms-Button--primary:has-text("Delete")')
      await confirm.click()
      await this.appWindow.waitForTimeout(500)
      
      deleteConfirmation = await this.appWindow.$('.server-delete-confirmation')
      assert.strictEqual(deleteConfirmation, null)

      const servers = await this.modal.$$(".server-list li")
          
      assert.strictEqual(servers.length, 2, "Server not deleted")
      assert.strictEqual(await servers[0].innerText(), "Localhost")
      assert.strictEqual(await servers[1].innerText(), "Test 1")

    })

  })
  })
  
})