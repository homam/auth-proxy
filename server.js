/**
* This is the main Node.js server script for your project
* Check out the two endpoints this back-end API provides in fastify.get and fastify.post below
*/

const jwt = require('jsonwebtoken');
const httpProxy = require('http-proxy'),
    express = require('express'),
    app = express(),
    cookieParser = require('cookie-parser'),
    { auth } = require('express-openid-connect'),
    session = require('express-session');

const proxy_config = require("./config")

const proxy = httpProxy.createProxyServer({});

app.use(cookieParser());
app.use(function(req, res, next){
  auth(proxy_config[req.host].auth0)(req, res, next)
});

function secured (req, res, next) {
  if (req.oidc.isAuthenticated()) { return next(); }
  
  console.log(req.headers)
  const token = req.cookies.token || req.headers.authorization;
  try {
    var decoded = jwt.verify(token, proxy_config[req.host].token_secret);
    console.log({token, decoded});
    return next()
  } catch(err) {
    console.log('Auth error');
    console.log({token});
    console.log(err)
  } 
  
  
  res.cookie('redir-back', req.url);
  res.redirect('/login');
}


app.options("/*", function(req, res, next){
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  res.send(200);
});

app.get("/", function (req, res) {
  const returnTo = req.cookies['redir-back']
  if(!!returnTo && returnTo.length > 1) {
    res.clearCookie('redir-back');
    if(req.oidc.user) {
      const email = req.oidc.user.email;
      
      if(/@sam-media.com$/.test(email)) {
        const maxAge = 60 * 60 * 1000;
        const token = jwt.sign({
          exp: Math.floor(Date.now() / 1000) + (maxAge / 1000),
          data: {email}
        }, proxy_config[req.host].token_secret);

        res.cookie('token', token, { maxAge, httpOnly: true });
      } else {
        res.end('not allowed')
      }

    }
    res.redirect(returnTo);
  } else {
    res.end('empty');
  }
});


app.all("/*", secured, function(req, res) {
  console.log(req.oidc.isAuthenticated());
  console.log(req.oidc.user);
  const config = proxy_config[req.host]
  req.headers.host = config.host
  proxy.web(req, res, { target: config.target, secure: false});

});


app.listen(process.env.PORT, () => {
  console.log(`Listening at http://localhost:${process.env.PORT}`)
});







