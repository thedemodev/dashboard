/* eslint-env mocha */
const assert = require('assert')
const dashboard = require('../../../index.js')
const TestHelper = require('../../../test-helper.js')

describe('/account/signin', () => {
  describe('Signin#GET', () => {
    it('should present the form', async () => {
      const req = TestHelper.createRequest('/account/signin')
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      assert.strictEqual(doc.getElementById('submit-form').tag, 'form')
      assert.strictEqual(doc.getElementById('submit-button').tag, 'button')
    })
  })

  describe('Signin#POST', () => {
    it('should reject missing username', async () => {
      const req = TestHelper.createRequest('/account/signin')
      req.body = {
        username: '',
        password: 'password'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-username')
    })

    it('should enforce username length', async () => {
      const req = TestHelper.createRequest('/account/signin')
      req.body = {
        username: '1',
        password: '123456789123'
      }
      global.minimumUsernameLength = 100
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-username-length')
    })

    it('should reject missing password', async () => {
      const req = TestHelper.createRequest('/account/signin')
      req.body = {
        username: 'asdfasdf',
        password: ''
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-password')
    })

    it('should reject invalid password', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/signin')
      req.body = {
        username: user.account.username,
        password: 'invalid-password'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-password')
    })

    it('should enforce password length', async () => {
      const req = TestHelper.createRequest('/account/signin')
      req.body = {
        username: '1234567890123',
        password: '1'
      }
      global.minimumPasswordLength = 100
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-password-length')
    })

    it('should create session expiring in 20 minutes as default', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/signin')
      req.body = {
        username: user.account.username,
        password: user.account.password
      }
      await req.post()
      const req2 = TestHelper.createRequest(`/api/administrator/account-sessions?accountid=${user.account.accountid}`)
      req2.account = administrator.account
      req2.session = administrator.session
      const sessions = await req2.get()
      const session = sessions[0]
      const minutes = Math.ceil((session.expires - dashboard.Timestamp.now) / 60)
      assert.strictEqual(minutes, 20)
    })

    it('should create session expiring in 20 minutes', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/signin')
      req.body = {
        username: user.account.username,
        password: user.account.password,
        remember: 'minutes'
      }
      await req.post()
      const req2 = TestHelper.createRequest(`/api/administrator/account-sessions?accountid=${user.account.accountid}`)
      req2.account = administrator.account
      req2.session = administrator.session
      const sessions = await req2.get()
      const session = sessions[0]
      const minutes = Math.ceil((session.expires - dashboard.Timestamp.now) / 60)
      assert.strictEqual(minutes, 20)
    })

    it('should create session expiring in 8 hours', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/signin')
      req.body = {
        username: user.account.username,
        password: user.account.password,
        remember: 'hours'
      }
      await req.post()
      await req.post()
      const req2 = TestHelper.createRequest(`/api/administrator/account-sessions?accountid=${user.account.accountid}`)
      req2.account = administrator.account
      req2.session = administrator.session
      const sessions = await req2.get()
      const session = sessions[0]
      const hours = Math.ceil((session.expires - dashboard.Timestamp.now) / 60 / 60)
      assert.strictEqual(hours, 8)
    })

    it('should create session expiring in 30 days', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/signin')
      req.body = {
        username: user.account.username,
        password: user.account.password,
        remember: 'days'
      }
      await req.post()
      const req2 = TestHelper.createRequest(`/api/administrator/account-sessions?accountid=${user.account.accountid}`)
      req2.account = administrator.account
      req2.session = administrator.session
      const sessions = await req2.get()
      const session = sessions[0]
      const days = Math.ceil((session.expires - dashboard.Timestamp.now) / 60 / 60 / 24)
      assert.strictEqual(days, 30)
    })
  })
})
