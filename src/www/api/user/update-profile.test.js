/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/user/update-profile`, () => {
  describe('UpdateProfile#BEFORE', () => {
    it('should reject missing first name', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/update-profile?profileid=${user.profile.profileid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        ['first-name']: null,
        ['last-name']: 'Test',
        email: 'test@email.com'
      }
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-profile-first-name')
    })

    it('should enforce first name length', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/update-profile?profileid=${user.profile.profileid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        ['first-name']: '1',
        ['last-name']: 'Test',
        email: 'test@email.com'
      }
      global.minimumProfileFirstNameLength = 10
      global.maximumProfileFirstNameLength = 100
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-profile-first-name-length')
      global.minimumProfileFirstNameLength = 1
      global.maximumProfileFirstNameLength = 1
      req.body = {
        ['first-name']: '123456789',
        ['last-name']: 'Test',
        email: 'test@email.com'
      }
      errorMessage = null
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-profile-first-name-length')
    })

    it('should reject missing last name', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/update-profile?profileid=${user.profile.profileid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        ['first-name']: 'Test',
        ['last-name']: null,
        email: 'test@email.com'
      }
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-profile-last-name')
    })

    it('should enforce last name length', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/update-profile?profileid=${user.profile.profileid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        ['first-name']: 'Test',
        ['last-name']: '1',
        email: 'test@email.com'
      }
      global.minimumProfileLastNameLength = 10
      global.maximumProfileLastNameLength = 100
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-profile-last-name-length')
      global.minimumProfileLastNameLength = 1
      global.maximumProfileLastNameLength = 1
      req.body = {
        ['first-name']: 'Test',
        ['last-name']: '123456789',
        email: 'test@email.com'
      }
      errorMessage = null
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-profile-last-name-length')
    })

    it('should reject missing email', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/update-profile?profileid=${user.profile.profileid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        ['first-name']: 'Test',
        ['last-name']: 'Test',
        email: null
      }
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-profile-email')
    })
  })

  describe('UpdateProfile#PATCH', () => {
    it('should apply authorized new values', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/update-profile?profileid=${user.profile.profileid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        ['first-name']: 'Test',
        ['last-name']: 'Person',
        email: 'test@test.com'
      }
      const profileNow = await req.patch()
      assert.strictEqual(profileNow.firstName, 'Test')
      assert.strictEqual(profileNow.lastName, 'Person')
      assert.strictEqual(profileNow.email, 'test@test.com')
    })
  })
})
