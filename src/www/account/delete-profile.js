const dashboard = require('../../../index.js')

module.exports = {
  before: beforeRequest,
  get: renderPage,
  post: submitForm
}

async function beforeRequest (req) {
  if (!req.query || !req.query.profileid) {
    throw new Error('invalid-profileid')
  }
  if (req.session.lockURL === req.url && req.session.unlocked) {
    try {
      await global.api.user.DeleteProfile.delete(req)
    } catch (error) {
      req.error = error.message
    }
  }
  const profile = await global.api.user.Profile.get(req)
  if (!profile) {
    throw new Error('invalid-profileid')
  }
  if (profile.accountid !== req.account.accountid) {
    throw new Error('invalid-account')
  }
  if (profile.profileid === req.account.profileid) {
    throw new Error('invalid-profile')
  }
  profile.createdFormatted = dashboard.Timestamp.date(profile.created)
  req.data = { profile }
}

function renderPage (req, res, messageTemplate) {
  if (req.success) {
    if (req.query && req.query.returnURL) {
      return dashboard.Response.redirect(req, res, req.query.returnURL)
    }
    messageTemplate = 'success'
    return dashboard.Response.redirect(req, res, `/account/profiles`)
  } else if (req.error) {
    messageTemplate = req.error
  }
  const doc = dashboard.HTML.parse(req.route.html, req.data.profile, 'profile')
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
    if (messageTemplate === 'success') {
      const submitForm = doc.getElementById('submit-form')
      submitForm.parentNode.removeChild(submitForm)
    }
  }
  return dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  try {
    await global.api.user.DeleteProfile.delete(req)
    if (req.success) {
      return renderPage(req, res, 'success')
    }
    return dashboard.Response.redirect(req, res, '/account/authorize')
  } catch (error) {
    return renderPage(req, res, error.message)
  }
}
