'use strict';

// Module dependencies
var OAuth = require('passport-shopify');

/**
 * Basic Authentication can only be used with Private Apps
 * @see http://docs.shopify.com/api/tutorials/creating-a-private-app
 *
 * The purpose of this module is to prepare an auth object that the
 * Node Shopify Connector can consume. This does not check to see if the
 * username/password combination is valid.
 *
 * For Basic Authentication, all that needs to be done is to pass the
 * username/password combination through using the http auth header.
 * The username/password combinatino should be a string that uses the following
 * format: `username:password` where username is your Private App API Key, and
 * password is your Private App Password.
 * 
 * The Node Shopify Connector will take care of passing this along to every request
 */
var BasicAuth = function (apiKey, password) {
  var token = apiKey + ':' + password;
  return {
    method: 'basic',
    token: token
  };
}

exports.OAuth = OAuth;
exports.BasicAuth = BasicAuth;