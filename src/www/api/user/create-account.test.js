/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/user/create-account', () => {
  describe('CreateAccount#POST', () => {
    it('should require a username', async () => {
      const req = TestHelper.createRequest('/api/user/create-account')
      req.body = {
        username: '',
        password: 'password'
      }
      let errorMessage
      try {
        await req.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-username')
    })

    it('should enforce minimum username length', async () => {
      const req = TestHelper.createRequest('/api/user/create-account')
      req.body = {
        username: '1',
        password: 'password'
      }
      global.minimumUsernameLength = 100
      let errorMessage
      try {
        await req.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-username-length')
    })

    it('should enforce maximum username length', async () => {
      const req = TestHelper.createRequest('/api/user/create-account')
      req.body = {
        username: '12345',
        password: 'password'
      }
      global.maximumUsernameLength = 1
      let errorMessage
      try {
        await req.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-username-length')
    })

    it('should require a password', async () => {
      const req = TestHelper.createRequest('/api/user/create-account')
      req.body = {
        username: 'username',
        password: ''
      }
      let errorMessage
      try {
        await req.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-password')
    })

    it('should enforce minimum password length', async () => {
      const req = TestHelper.createRequest('/api/user/create-account')
      req.body = {
        username: 'username',
        password: '1'
      }
      global.minimumPasswordLength = 100
      let errorMessage
      try {
        await req.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-password-length')
    })

    it('should enforce maximum password length', async () => {
      const req = TestHelper.createRequest('/api/user/create-account')
      req.body = {
        username: 'username',
        password: '12345'
      }
      global.maximumPasswordLength = 1
      let errorMessage
      try {
        await req.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-password-length')
    })

    it('should create account', async () => {
      global.requireProfile = false
      const req = TestHelper.createRequest('/api/user/create-account')
      req.body = {
        username: 'username-' + new Date().getTime(),
        password: 'password1234',
        confirm: 'password1234'
      }
      const account = await req.post()
      assert.strictEqual(account.object, 'account')
    })

    it('should create account with profile', async () => {
      global.requireProfile = true
      global.userProfileFields = ['full-name', 'contact-email']
      const req = TestHelper.createRequest('/api/user/create-account')
      req.body = {
        username: 'username-' + new Date().getTime(),
        password: 'password1234',
        confirm: 'password1234',
        'first-name': 'Tester',
        'last-name': 'Person',
        'contact-email': 'tester@person.com'
      }
      const account = await req.post()
      assert.strictEqual(account.object, 'account')
    })
  })
})
