'use strict';

// Module dependencies
var express = require('express')
  , http = require('http')
  , middleware = require('./middleware')
  , routes = require('./routes');

// Sets up the express server instance
// Instantiates the routes, middleware, and starts the http server
var init = function (server) {

  // ## Middleware
  middleware(server);

  // ## Initialize Routes
  routes(server); // shopify app

  function startServer () {
    server.set('port', 3000);
    http.createServer(server).listen(server.get('port'), function () {
      console.info('Express server listening on port ' + server.get('port'));
    });
  }

  // Start the server
  startServer();
};

// Initializes the server
init(express());