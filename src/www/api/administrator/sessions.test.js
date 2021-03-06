/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/sessions', () => {
  describe('receives', () => {
    it('optional querystring offset (integer)', async () => {
      global.delayDiskWrites = true
      const offset = 1
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const sessions = [administrator.session.sessionid, user.session.sessionid]
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        await TestHelper.createSession(user)
        sessions.unshift(user.session.sessionid)
      }
      const req = TestHelper.createRequest(`/api/administrator/sessions?offset=${offset}`)
      req.account = administrator.account
      req.session = administrator.session
      const sessionsNow = await req.get()
      for (let i = 0, len = global.pageSize; i < len; i++) {
        assert.strictEqual(sessionsNow[i].sessionid, sessions[offset + i])
      }
    })

    it('optional querystring limit (integer)', async () => {
      const limit = 1
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const sessions = [administrator.session.sessionid, user.session.sessionid]
      for (let i = 0, len = limit + 1; i < len; i++) {
        await TestHelper.createSession(user)
        sessions.unshift(user.session.sessionid)
      }
      const req = TestHelper.createRequest(`/api/administrator/sessions?limit=${limit}`)
      req.account = administrator.account
      req.session = administrator.session
      const sessionsNow = await req.get()
      assert.strictEqual(sessionsNow.length, limit)
    })

    it('optional querystring all (boolean)', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const sessions = [administrator.session.sessionid, user.session.sessionid]
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        await TestHelper.createSession(user)
        sessions.unshift(user.session.sessionid)
      }
      const req = TestHelper.createRequest('/api/administrator/sessions?all=true')
      req.account = administrator.account
      req.session = administrator.session
      const sessionsNow = await req.get()
      assert.strictEqual(sessionsNow.length, sessions.length)
    })
  })

  describe('returns', () => {
    it('array', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/api/administrator/sessions')
      req.account = administrator.account
      req.session = administrator.session
      const sessions = await req.get()
      assert.strictEqual(sessions.length, global.pageSize)
      assert.strictEqual(sessions[0].sessionid, user.session.sessionid)
      assert.strictEqual(sessions[1].sessionid, administrator.session.sessionid)
    })
  })

  describe('redacts', () => {
    it('session token', async () => {
      const administrator = await TestHelper.createOwner()
      await TestHelper.createUser()
      const req = TestHelper.createRequest('/api/administrator/sessions')
      req.account = administrator.account
      req.session = administrator.session
      const sessions = await req.get()
      assert.strictEqual(undefined, sessions[0].token)
      assert.strictEqual(undefined, sessions[1].token)
    })
  })

  describe('configuration', () => {
    it('environment PAGE_SIZE', async () => {
      global.pageSize = 3
      const administrator = await TestHelper.createOwner()
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        await TestHelper.createUser()
      }
      const req = TestHelper.createRequest('/api/administrator/sessions')
      req.account = administrator.account
      req.session = administrator.session
      req.filename = __filename
      req.saveResponse = true
      const profilesNow = await req.get()
      assert.strictEqual(profilesNow.length, global.pageSize)
    })
  })
})
