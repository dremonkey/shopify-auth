# Shopify Auth Module for Node

This is a convenience module that provides a method for Basic or OAuth authentication with Shopify, and is available to make building Shopify apps easier. It DOES NOT help with API calls. What it does in short is provide access to an 'auth' object that can be passed to [shopify-node](https://github.com/dremonkey/shopify-node) so that you can make your API calls. The OAuth process is naturally much more complex than the Basic one.

If using OAuth this can be used for both embedded and non-embedded applications.

For OAuth it does make a number of assumptions that may not be correct for your authentication flow, but should be sufficient for most authentication processes so please keep that in mind if you choose to use this.

## Installation

```npm install git://github.com/dremonkey/shopify-auth.git```

## OAuth Authentication

For OAuth, this module depends on [passport](http://passportjs.org/) and the [passport-shopify](https://github.com/dremonkey/passport-shopify), so don't forget to initialize passport, i.e ```app.use(passport.iniatize())```. If the authorization is granted the token will be saved to session as well as the instance.

### OAuth Configurations Defaults

```javascript
// TODO
```

## Basic Authentication

Nothing to this. Just pass in your API key and password, and it spits back an auth object. In its current form all this does is wrap your username and password in the format that [shopify-node](https://github.com/dremonkey/shopify-node) expects and saves it to the instance.

## API

- ```getToken``` Returns a promise. Example Usage:

```javascript
var auth = require('shopify-auth').OAuth;
auth.getToken().then(function (token) {
  
  console.log(token);
  
  // token will look like {method: 'oauth', token: 'your-access-token'}
  // where 'method' is the auth type you used (either OAuth or Basic)
  // and 'token' is either your 'access token' for OAuth
  // or a 'username:password' string for Basic authentication
});
``` 

