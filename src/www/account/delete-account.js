const dashboard = require('../../../index.js')

module.exports = {
  get: renderPage,
  post: submitForm
}

async function renderPage (req, res, messageTemplate) {
  messageTemplate = messageTemplate || (req.query ? req.query.message : null)
  const doc = dashboard.HTML.parse(req.route.html)
  if (req.account.ownerid) {
    req.error = true
    messageTemplate = 'owner-account'
  } else if (req.account.administrator) {
    req.error = true
    messageTemplate = 'administrator-account'
  }
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
    if (req.error) {
      const submitForm = doc.getElementById('submit-form')
      submitForm.parentNode.removeChild(submitForm)
      return dashboard.Response.end(req, res, doc)
    }
  }
  if (global.deleteDelay) {
    const data = {
      numDays: global.deleteDelay || 7
    }
    dashboard.HTML.renderTemplate(doc, data, 'scheduled-delete', 'message-container')
  } else {
    dashboard.HTML.renderTemplate(doc, null, 'instant-delete', 'message-container')
  }
  return dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  if (!req.body || !req.body.password || !req.body.password.length) {
    return renderPage(req, res, 'invalid-password')
  }
  try {
    req.query = req.query || {}
    req.query.accountid = req.account.accountid
    await global.api.user.SetAccountDeleted.patch(req)
  } catch (error) {
    return renderPage(req, res, error.message)
  }
  if (req.query['return-url']) {
    return dashboard.Response.redirect(req, res, req.query['return-url'])
  } else {
    return dashboard.Response.redirect(req, res, '/account/delete-account-complete')
  }
}
