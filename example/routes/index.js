'use strict';

var OAuth = require('../../lib/index').OAuth
  , BasicAuth = require('../../lib/index').Basic
  , request = require('request');

module.exports = function (server) {

  // Init OAuth
  var oauth = new OAuth(server);

  // Index Page
  server.get('/', function (req, res) {

    // Change this value to test Embedded App
    // 
    // This loads and initializes the EASDK. If not actually embedded, then
    // trying to load and initialize the EASDK wil cause problems
    var isEmbedded = false;

    var data = {
      // Not Embedded App Credentials
      // apiKey: '7d871311e1c911fdd0e0aa720e3b091f',
      // secret: '82987f2ebf95ed638947829b0396d27d',

      // Embedded App Credentials
      apiKey: '9e7ac628cccabda29619d80170e33e51',
      secret: '3ab24f380dae3f554fc014a94d7af140',

      // Shared
      shopurl: 'narfs-and-zoinks.myshopify.com',
      shopinfo: JSON.stringify(req.session.shop),

      // For Embedded Apps
      isEmbedded: isEmbedded,
      pageTitle: 'Test'
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
      // set at the same time that you initialize OAuth. It is only being done here
      // because we need to get the form values, and this serves as a demonstration 
      // of how the auth process can be made dynamic
      oauth.setAuthField('shop', shop);
      oauth.setAuthField('apiKey', apiKey);
      oauth.setAuthField('secret', password);
      oauth.setAuthField('scope', ['read_orders']);

      // Because the initial request is AJAX this tells the client script to redirect.
      // Client is responsible for changing window.location to follow the redirect and
      // kickoff the OAuth process
      var redirectUrl = '/auth/shopify';

      res.json({
        redirect: true,
        url: redirectUrl
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