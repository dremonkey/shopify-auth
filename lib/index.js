'use strict';

// Module dependencies
var _ = require('lodash')
  , passport = require('passport')
  , ShopifyStrategy = require('passport-shopify').Strategy
  , routes = require('./routes')
  , when = require('when');

var DEFAULT_CALLBACK_PATH = '/auth/shopify/callback'
  , DEFAULT_SUCCESS_PATH = '/'
  , DEFAULT_FAILURE_PATH = '/auth/shopify/error';

// Default route endpoints for oauth flow
var DEFAULT_ENDPOINTS = {
  init: '/auth/shopify',
  escape: '/auth/shopify/escape',
  callback: DEFAULT_CALLBACK_PATH,
  success: DEFAULT_SUCCESS_PATH,
  failure: DEFAULT_FAILURE_PATH
};

/**
 * Basic Authentication can only be used with Private Apps
 * @see http://docs.shopify.com/api/tutorials/creating-a-private-app
 *
 * This does not check to see if the username/password combination is valid, 
 * although I will probably add this in the future.
 *
 * For Basic Authentication, all that needs to be done is to pass the
 * username/password combination through using the http auth header.
 * The username/password combinatino should be a string that uses the following
 * format: `username:password` where username is your Private App API Key, and
 * password is your Private App Password.
 * 
 * The Node Shopify Connector will take care of passing this along to every request
 */
function BasicAuth (apiKey, password) {
  var token = apiKey + ':' + password;
  this._token = {
    method: 'basic',
    token: token
  }
}

/**
 * OAuth Authentication
 */
function OAuth (server, options) {

  options = options || {};

  if (!(this instanceof OAuth)) {
    return new OAuth(server, options);
  }

  this._token = null; 
  this._deferred = when.defer(); // deferred token
  this._embedded = options.embedded || false;
  this._endpoints = _.defaults((options.endpoints || {}), DEFAULT_ENDPOINTS);

  this._auth = {
    shop: options.shop || '',
    apiKey: options.apiKey || null,
    secret: options.secret || null,
    callback: this._endpoints.callback,
    scope: options.scope || null
  };

  // Initialize Routes
  routes.call(this, server);
}

OAuth.prototype.getAuthField = function (key) {
  return this._auth[key];
};

OAuth.prototype.setAuthField = function (key, value) {
  this._auth[key] = value;
};

/**
 * Retrieves saved OAuth token.
 *
 * Returns a promise that will be replaced with the token
 */
OAuth.prototype.getToken = function (key) {
  var self = this
    , deferred = when.defer();

  // If token is already available resolve immediately
  if (this._token) {
    deferred.resolve(this._token);
  }
  // otherwise wait until we have retrieved the token
  else {
    this._deferred.promise.then(function (token) {
      deferred.resolve(token);
    });
  }

  return deferred.promise;
};

OAuth.prototype._initStrategy = function () {
  var self = this;
  
  passport.use(new ShopifyStrategy({
      clientID: this._auth.apiKey,
      clientSecret: this._auth.secret,
      callbackURL: this._auth.callback,
      shop: this._auth.shop,
      
      // tell passport to pass the req callback to the verification callback
      // so that we can access the token
      passReqToCallback: true
    },

    // verify callback
    //
    // This is required by all Passport Strategies to find the user that possesses 
    // the set of credentials being passed.  If the credentials are valid, the verify 
    // callback invokes done to supply Passport with the user that authenticated.
    //
    // In our case, receiving the accessToken from Shopify is good enough
    // to serve as verification so we don't need to do any further checks.
    //
    // @see http://passportjs.org/guide/configure/
    function (req, accessToken, refreshToken, shop, done) {
      
      // console.log('**** ShopifyStrategy Verification');
      // console.log('shop', shop);
      var token = {
        method: 'oauth',
        token: accessToken
      };

      // Save token
      self._token = token;

      // Inform whatever is listening that we have the access token
      self._deferred.resolve(token);

      // create a truncated 'shop' object
      // may be necessary to store this information in the future and verify shop
      // but for now we just pass it through
      var _shop = {};
      _shop.id = shop.id;
      _shop.owner = shop.owner;
      _shop.name = shop.name;
      _shop.url = shop.url;
      _shop.email = shop.email;
      _shop.token = token;

      req.session.shop = _shop;

      return done(null, shop);
    }
  ));
};

module.exports.OAuth = OAuth;
module.exports.Basic = BasicAuth;