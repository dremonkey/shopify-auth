'use strict';

var OAuth = require('../../lib/index').OAuth
  , BasicAuth = require('../../lib/index').Basic
  , request = require('request');

module.exports = function (server) {

  // Init OAuth
  var oauth = OAuth(server);

  // Index Page
  server.get('/', function (req, res) {
    var data = {
      shopinfo: JSON.stringify(req.session.shop)
    };

    res.render('index.ect', data);
  });

  // Form Submit
  server.post('/', function (req, res) {
    
    var method = req.body.method
      , apiKey = req.body.apiKey
      , password = req.body.password
      , shop = req.body.shop;

    // Using OAuth
    if ('oauth' === method) {

      // Set Shop, App API Key, App Shared Secret, and Scope
      // 
      // @NOTE 
      // This can be done much earlier. In fact for most use cases, these should be
      // set at the same time that you initialize OAuth. It is only being done so here
      // because we need to get the form values, and as a demonstration of how the auth
      // process can be made dynamic
      oauth.setAuthField('shop', shop);
      oauth.setAuthField('apiKey', apiKey);
      oauth.setAuthField('secret', password);
      oauth.setAuthField('scope', ['read_orders']);

      res.json({
        redirect: true,
        url:'/auth/shopify?shop=' + shop
      });
    }

    // Using Basic Auth
    else {

      var options = {
        url: 'https://' + shop + '/admin/shop.json',
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
          res.json({
            redirect: true,
            url:'/'
          });
        }
      });
    }
  });
}