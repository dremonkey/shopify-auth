'use strict';

// Module dependencies
var _ = require('lodash')
  , passport = require('passport')
  , ShopifyStrategy = require('passport-shopify').Strategy;

var DEFAULT_CALLBACK_URL = '/auth/shopify/token';

// Default route endpoints for oauth flow
var DEFAULT_ENDPOINTS = {
  authInit: '/auth/shopify',
  authCallback: DEFAULT_CALLBACK_URL,
  escape: 'shopify/escape',
  success: '/',
  failure: '/auth/shopify/error'
};

/**
 * Basic Authentication can only be used with Private Apps
 * @see http://docs.shopify.com/api/tutorials/creating-a-private-app
 *
 * This prepares an auth object that the Node Shopify Connector can consume. 
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

  return {
    method: 'basic',
    token: token
  };
}

/**
 * OAuth Authentication
 */
function OAuth (server, options) {
  options = options || {};

  // TODO need to figure out Error handling
  if (!options.apiKey || !options.sharedSecret) {
    throw new Error('You need to set both the api key and shared secret options.');
  }

  if (!options.shop) {
    throw new Error('You need to set the shop option');
  }

  // Save options
  this._auth = {
    apiKey: options.apiKey,
    sharedSecret: options.sharedSecret,
    callbackURL: options.callbackURL,
    scope: options.scope || []
  };

  this._embedded = options.embedded || false;
  this._endpoints = _.defaults(options.endpoints, DEFAULT_ENDPOINTS);
  this._shop = options.shop;

  // Initialize
  this._initStrategy();
  this._initRoutes(server);
}

OAuth.prototype._initStrategy = function () {
  
  passport.use(new ShopifyStrategy({
      clientID: this._auth.apiKey,
      clientSecret: this._auth.sharedSecret,
      callbackURL: this._auth.callbackURL,

      // tell passport to pass the req callback to the verification callback
      // so that we can access the token
      passReqToCallback: true,

      // shop name
      shop: this._shop
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

      // create a truncated 'shop' object
      // may be necessary to store this information in the future and verify shop
      // but for now we just pass it through
      var _shop = {};
      _shop.id = shop.id;
      _shop.owner = shop.owner;
      _shop.name = shop.name;
      _shop.url = shop.url;
      _shop.email = shop.email;

      // save accessToken to session.
      // even if the rest of the data is not needed this should remain
      _shop.token = accessToken; 

      req.session.shop = _shop;

      return done(null, shop);
    }
  ));
};

OAuth.prototype._initRoutes = function (server) {
  var options = {
    shop: this._shop,
    scope: this._auth.scope,
    endpoints: this._endpoints
  }

  require('./routes')(server, options);
};

exports.OAuth = OAuth;
exports.basic = BasicAuth;