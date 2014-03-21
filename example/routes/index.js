'use strict';

var OAuth = require('../../lib/index').OAuth
  , BasicAuth = require('../../lib/index').Basic
  , request = require('request');

module.exports = function (server) {

  // Index Page
  server.get('/', function (req, res) {
    res.render('index.ect');
  });

  // Form Submit
  server.post('/', function (req, res) {
    
    console.log(req.body);
    
    var method = req.body.method
      , apiKey = req.body.apiKey
      , password = req.body.password
      , shop = req.body.shop;

    if ('oauth' === method) {
        var options = {
        shop: shop,
        apiKey: apiKey,
        sharedSecret: password,
        callbackUrl: '/auth/shopify/token',
        endpoints: {
          success: '/shopinfo'
        },
        scope: []
      };

      // initialize the oauth module
      OAuth(server, options);
    }
    else {

      var options = {
        url: 'https://' + shop + '.myshopify.com/admin/shop.json',
        method: 'GET',
        auth: {
          user: apiKey,
          pass: password
        }
      };

      request(options, function (err, response, data) {
        
        if (err) {
          res.json({
            status: 'error',
            error: err
          });
        };

        if (!err) {
          req.session.shop = JSON.parse(data).shop;
          res.redirect('/shopinfo');
        }
      });
    }
  });

  server.get('/shopinfo', function (req, res) {
    res.json({
      token: req.session.shop.token,
      shop: req.session.shop
    });
  });
}