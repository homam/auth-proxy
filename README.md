## Config

Make `./config.js`

```javascript
module.exports = {
   "secure.my-site.com": {
     host: "my-site.com",
     target: "https://my-site.com/",
     token_secret: '....',
     auth0: {
        authRequired: false,
        auth0Logout: true,
        secret: '...',
        baseURL: 'https://secure.my-site.com',
        clientID: '....',
        issuerBaseURL: 'https://my-site.eu.auth0.com'
     }
   }
};
```