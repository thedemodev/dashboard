/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/set-account-deleted', () => {
  describe('exceptions', () => {
    describe('invalid-accountid', async () => {
      it('unspecified querystring accountid', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest(`/api/administrator/set-account-deleted`)
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.patch()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-accountid')
      })

      it('invalid querystring accountid value', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest(`/api/administrator/set-account-deleted?accountid=invalid`)
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.patch()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-accountid')
      })
    })

    describe('invalid-account', () => {
      it('ineligible querystring accountid (deleted)', async () => {
        const administrator = await TestHelper.createOwner()
        const user = await TestHelper.createUser()
        await TestHelper.setDeleted(user)
        const req = TestHelper.createRequest(`/api/administrator/set-account-administrator?accountid=${administrator.account.accountid}`)
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.route.api.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-account')
      })
    })
  })

  describe('receives', () => {
    it('requires querystring accountid', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/administrator/set-account-deleted?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      global.deleteDelay = 3
      const accountNow = await req.patch()
      const now = Math.floor(new Date().getTime() / 1000)
      const days = Math.ceil((accountNow.deleted - now) / 60 / 60 / 24)
      assert.strictEqual(days, 3)
    })
  })

  describe('returns', () => {
    it('object', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/administrator/set-account-deleted?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      global.deleteDelay = 1
      const accountNow = await req.patch()
      const now = Math.floor(new Date().getTime() / 1000)
      const days = Math.ceil((accountNow.deleted - now) / 60 / 60 / 24)
      assert.strictEqual(days, 1)
    })
  })

  describe('configuration', () => {
    it('environment DELETE_DELAY', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/administrator/set-account-deleted?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      global.deleteDelay = 7
      const accountNow = await req.patch()
      const now = Math.floor(new Date().getTime() / 1000)
      const days = Math.ceil((accountNow.deleted - now) / 60 / 60 / 24)
      assert.strictEqual(days, 7)
    })
  })
})
