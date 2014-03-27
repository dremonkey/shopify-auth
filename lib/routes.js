'use strict';

// Module Dependences
var _ = require('lodash')
  , fs = require('fs')
  , path = require('path')
  , passport = require('passport');

// Sets up the routes to be used for OAuth
module.exports = function (server) {

  var oauth = this
    , endpoints = oauth._endpoints;

  // Initialization route
  // 
  // Kicks off the authentication process...
  // Sends the user to https://SHOP_NAME.myshopify.com/admin/oauth/authorize and
  // asks for authorization if the app is not already authorized. Shopify will 
  // redirect to the url specified by 'endpoints.callback' if the user allows 
  // access
  server.get(endpoints.init, function (req, res, next) {
    
    var missing = []
      , shop = req.query.shop || false;

    // if shop was passed in as a qs, update oauth._auth.shop value
    if (shop) oauth.setAuthField('shop', shop);

    // check to make sure the required options are set
    _.forEach(oauth._auth, function (val, key) {
      if (!val) missing.push(key);
    });

    if (missing.length > 0) {
      res.json({
        error: 'You are missing the following required settings: ' + missing.join(', '),
        oauth: oauth
      });

      return;
    }

    // Init Oauth Strategy
    // The reason it is done here rather than earlier is to allow it to be 
    // dynamic, i.e. shop and other options can be set dynamically
    oauth._initStrategy();

    passport.authenticate('shopify', {
      shop: shop,
      scope: oauth.getAuthField('scope')
    })(req, res, next);
  });

  // Redirect route
  //
  // Shopify redirects here if the user allows access. This is where we
  // get the permanent access token.
  server.get(endpoints.callback, function (req, res, next) {
    
    // if a session redirect path is available, use that other use the default
    var success = (req.session && req.session.redirectPath) || endpoints.success;
    
    passport.authenticate('shopify', {
      // session not needed because we will be passing the token on every request
      session: false,

      // route to go to on successful auth
      successRedirect: success,

      // route to go to on failed auth
      failureRedirect: endpoints.failure
    })(req, res, next);
  });

  // Escape iframe route
  //
  // Renders a view that contains javascript which will change the browser top
  // window location to start the oauth process. This is needed for embedded apps.
  //
  // @NOTE
  // Rather than using this endpoint, you can also use ajax to do the escaping for oauth
  // Example:
  //  - Login button sends AJAX request to setup the OAuth credentials
  //  - Once OAuth credentials are set, server responds with the OAuth init redirect URL
  //  - Client AJAX success listener changes window.location and kicks off the OAuth process
  //
  // @see http://docs.shopify.com/embedded-app-sdk/getting-started#oauth
  server.get(endpoints.escape, function (req, res) {
    
    var fpath = path.resolve(__dirname, './views/escape.html')
      , options = {encoding: 'utf8'};
    
    var view = fs.readFileSync(fpath, options);
    view = view.replace('@authInitUrl', endpoints.init);
    
    res.send(view);
  });

  // Default route for auth failure
  server.get(endpoints.failure, function (req, res) {
    res.json({
      error: 'OAuth Authentication Failed',
      qs: req.query
    });
  });

  // Returns the shop object saved to the session
  server.get(endpoints.session, function (req, res, next) {
    if (req.session.shop) {
      res.json(req.session.shop);
      return;
    }

    next();
  });
}