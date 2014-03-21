'use strict';

// Module Dependences
var fs = require('fs')
  , path = require('path')
  , passport = require('passport');

// Sets up the routes to be used for OAuth
module.exports = function (server, options) {

  options = options || {};
  var endpoints = options.endpoints || {};

  if (!options.shop) {
    throw new Error('You need to set the shop option');
  }

  if (!endpoints.authCallback) {
    throw new Error('You need to set the OAuth callback endpoint');
  }

  // Initialization route
  // 
  // Kicks off the authentication process...
  // Shopify will redirect to endpoints.redirect if the user allows access
  server.get(endpoints.authInit,
    passport.authenticate('shopify', {
      scope: options.scope,
      shop: options.shop
    })
  );

  // Redirect route
  //
  // Shopify redirects here if the user allows access. This is where we
  // get the permanent access token.
  server.get(endpoints.authCallback,
    passport.authenticate('shopify', {
      // session not needed because we will be passing the token on every request
      session: false,

      // route to go to on successful auth
      successRedirect: endpoints.success,

      // route to go to on failed auth
      failureRedirect: endpoints.failure
    })
  );

  // Escape iframe route
  //
  // Renders a view that contains javascript which will change the browser top
  // window location to start the oauth process. This is needed for embedded apps.
  //
  // @see http://docs.shopify.com/embedded-app-sdk/getting-started#oauth
  server.get(endpoints.authEscape, function (req, res) {
    
    var fpath = path.resolve(__dirname, './views/escape.html')
      , options = {encoding: 'utf8'};
    
    var view = fs.readFileSync(fpath, options);
    view = view.replace('@authInitUrl', endpoints.authCode);
    
    res.send(view);
  });

  // Default route for auth failure
  server.get(endpoints.failure, function (req, res) {
    res.json({
      error: 'OAuth Authentication Failed',
      qs: req.query
    });
  });
}