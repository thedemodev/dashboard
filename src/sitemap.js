// const Account = require('./account.js')
const fs = require('fs')
const HTML = require('./html.js')
const Response = require('./response.js')

module.exports = {
  generate
}

function generate () {
  let routes = {}
  // Dashboard defaults, if the server is a module then these are
  // files located within node_modules otherwise they are the root app
  const dashboardModulePath = `${global.applicationPath}/node_modules/@userappstore/dashboard/src/www`
  let dashboardIsModule = false
  if (fs.existsSync(dashboardModulePath)) {
    attachRoutes(routes, dashboardModulePath)
    dashboardIsModule = true
  } else {
    attachRoutes(routes, global.rootPath)
  }
  // node modules overriding the defaults
  for (const moduleName of global.packageJSON.dashboard.moduleNames) {
    const modulePath = `${global.applicationPath}/node_modules/${moduleName}`
    attachRoutes(routes, `${modulePath}/src/www`)
  }
  // When the dashboard is a module the root application may
  // contain routes that may override any URLs
  if (dashboardIsModule) {
    attachRoutes(routes, global.rootPath)
  }
  // When an application server is configured the default / and /home
  // routes are deleted unless a local copy exists.  If you are
  // using the Dashboard project directly you can delete the
  // /src/www/home.html and /src/www/index.html files to proxy
  // your application server.
  if (global.applicationServer) {
    const rootIndexPageExists = fs.existsSync(`${global.applicationPath}/src/www/index.html`)
    const rootHomePageExists = fs.existsSync(`${global.applicationPath}/src/www/home.html`)
    if (!rootIndexPageExists) {
      delete (routes['/'])
    }
    if (!rootHomePageExists) {
      delete (routes['/home'])
    }
  }
  return routes
}

function attachRoutes (routes, folderPath) {
  if (!fs.existsSync(folderPath)) {
    return routes
  }
  if (folderPath.endsWith('/src/www/public')) {
    return routes
  }
  const apiOnly = folderPath.indexOf('/api/') > -1
  const folderContents = fs.readdirSync(folderPath)
  for (const file of folderContents) {
    const filePath = `${folderPath}/${file}`
    if (filePath.indexOf('navbar') !== -1 || filePath.endsWith('.test.js')) {
      continue
    }
    if (!filePath.endsWith('.html') && !filePath.endsWith('.js')) {
      const stat = fs.statSync(filePath)
      if (stat.isDirectory()) {
        attachRoutes(routes, filePath)
        continue
      }
      continue
    }
    const htmlFilePath = filePath.substring(0, filePath.lastIndexOf('.')) + '.html'
    const htmlFileExists = fs.existsSync(htmlFilePath)
    const jsFilePath = filePath.substring(0, filePath.lastIndexOf('.')) + '.js'
    const jsFileExists = fs.existsSync(jsFilePath)
    if (filePath.endsWith('.js') && htmlFileExists) {
      continue
    }
    const api = jsFileExists ? require(jsFilePath) : 'static-page'
    if (api !== 'static-page' && !api.get && !api.post && !api.patch && !api.delete && !api.put) {
      continue
    }
    if (api.before && !apiOnly) {
      wrapBeforeFunction(api)
    }
    const html = htmlFileExists ? fs.readFileSync(htmlFilePath).toString('utf-8') : null
    const extension = apiOnly ? '.js' : '.html'
    const index = `index${extension}`
    let folderStem = folderPath.substring(global.rootPath.length)
    if (folderStem.indexOf('src/www') > -1) {
      folderStem = folderStem.substring(folderStem.indexOf('src/www') + 'src/www'.length)
    }
    let urlKey = folderStem + (file === index ? '' : '/' + file.substring(0, file.lastIndexOf('.')))
    if (urlKey === '') {
      urlKey = '/'
    }
    if (routes[urlKey]) {
      if (jsFileExists) {
        routes[urlKey].jsFilePath = jsFilePath.substring(global.applicationPath.length)
        routes[urlKey].api = require(jsFilePath)
      }
      if (htmlFileExists) {
        routes[urlKey].htmlFilePath = htmlFilePath.substring(global.applicationPath.length)
        routes[urlKey].html = fs.readFileSync(htmlFilePath).toString('utf-8')
      }
      continue
    }
    let template = true
    let auth = api && api.auth === false ? api.auth : true
    let navbar = ''
    if (!apiOnly && html) {
      const settings = readHTMLAttributes(html)
      template = settings.template
      if (settings.auth !== false) {
        auth = true
      } else {
        auth = false
      }
      navbar = settings.navbar
    }
    routes[urlKey] = {
      htmlFilePath: htmlFileExists ? htmlFilePath.substring(global.applicationPath.length) : null,
      html,
      jsFilePath: jsFileExists ? jsFilePath.substring(global.applicationPath.length) : 'static-page',
      template,
      auth,
      navbar,
      api
    }
  }
  return routes
}

function readHTMLAttributes (html) {
  const doc = HTML.parse(html)
  const htmlTag = doc.getElementsByTagName('html')[0]
  let template = true
  let auth = true
  let navbar = ''
  if (htmlTag && htmlTag.attr) {
    template = htmlTag.attr.template !== 'false' && htmlTag.attr.template !== false
    auth = htmlTag.attr.auth !== 'false' && htmlTag.attr.auth !== false
    navbar = htmlTag.attr.navbar || ''
  }
  return { template, auth, navbar }
}

/**
 * wrapBeforeFunction takes an API route with a 'before' handler and
 * executes it before any GET, POST etc method
 * @param {*} nodejsHandler a web or API endpoint
 */
async function wrapBeforeFunction (nodejsHandler) {
  for (const verb of [ 'get', 'post', 'patch', 'delete', 'put' ]) {
    const originalFunction = nodejsHandler[verb]
    if (!originalFunction) {
      continue
    }
    nodejsHandler[verb] = async (req, res) => {
      try{ 
        await nodejsHandler.before(req)
      } catch (error) {
        if (process.env.DEBUG_ERRORS) {
          console.log(`route.${verb}`, error)
        }
        return Response.throw500(req, res, error)
      }
      return originalFunction(req, res)
    }
  }
}
