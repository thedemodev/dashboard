const dashboard = require('../../../index.js')

module.exports = {
  get: renderPage
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.route.html, req.account, 'account')
  if (req.account.profileid) {
    const createLink = doc.getElementById('create-profile-link')
    createLink.parentNode.removeChild(createLink)
  } else {
    const updateLink = doc.getElementById('update-profile-link')
    updateLink.parentNode.removeChild(updateLink)
  }
  return dashboard.Response.end(req, res, doc)
}
