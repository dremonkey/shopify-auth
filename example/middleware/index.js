'use strict';

// Module dependencies
var express = require('express')
  , passport = require('passport')
  , path = require('path');

var middleware = function (server) {

  // log requests to the console
  server.use(express.logger('dev'));

  // setup encrypted session cookies
  server.use(express.cookieParser());
  server.use(express.session({secret: 'pinkyandthebrain'}));

  // For security sake, it's better to disable file upload if your application doesn't need it. 
  // To do this, don't use the bodyParser and multipart() middleware
  // @see http://expressjs.com/api.html#bodyParser
  server.use(express.json());
  server.use(express.urlencoded());

  server.use(express.methodOverride());
  
  // ## Views

  // views directory
  server.set('views', path.resolve(__dirname, '../views'));

  // view engine
  var viewEngine = require('ect')({watch: true, root: server.get('views')});
  server.engine('ect', viewEngine.render);
  server.set('view engine', 'ect');

  // ## Static Directory
  server.use(express.static(path.resolve(__dirname, '../assets')));

  // ## Passport
  server.use(passport.initialize());

  // ## Error Handler
  // Picks up any left over errors and returns a nicely formatted server 500 error
  server.use(express.errorHandler());
};

module.exports = middleware;