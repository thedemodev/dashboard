const dashboard = require('../../../index.js')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  const total = await global.api.administrator.DeletedAccountsCount.get(req)
  const accounts = await global.api.administrator.DeletedAccounts.get(req)
  if (accounts && accounts.length) {
    for (const account of accounts) {
      account.createdFormatted = dashboard.Format.date(account.created)
      account.lastSignedInFormatted = dashboard.Format.date(account.lastSignedIn)
      account.deletedFormatted = dashboard.Format.date(account.deleted)
    }
  }
  const offset = req.query ? req.query.offset || 0 : 0
  req.data = { accounts, total, offset }
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.route.html)
  if (req.data.accounts && req.data.accounts.length) {
    dashboard.HTML.renderTable(doc, req.data.accounts, 'account-row', 'accounts-table')
    if (req.data.total <= global.pageSize) {
      const pageLinks = doc.getElementById('page-links')
      pageLinks.parentNode.removeChild(pageLinks)
    } else {
      dashboard.HTML.renderPagination(doc, req.data.offset, req.data.total)
    }
  }
  return dashboard.Response.end(req, res, doc)
}
