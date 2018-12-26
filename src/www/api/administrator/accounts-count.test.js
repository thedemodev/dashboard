/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/accounts-count', async () => {
  describe('AccountCount#GET', () => {
    it('should count all accounts', async () => {
      const administrator = await TestHelper.createOwner()
      await TestHelper.createUser()
      await TestHelper.createUser()
      const req = TestHelper.createRequest('/api/administrator/accounts-count')
      req.account = administrator.account
      req.session = administrator.session
      const result = await req.get()
      assert.strictEqual(result, 3)
    })
  })
})
