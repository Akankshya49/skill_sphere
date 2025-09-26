const { auth } = require('express-openid-connect');

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: 'a long, randomly-generated string stored in env',
  baseURL: 'http://localhost:3000',
  clientID: 'I9oBVyFIxDHZSWgdlfTAOx31cYsZs0N8',
  issuerBaseURL: 'https://dev-mns1lf8qbfytdl5b.us.auth0.com'
};

module.exports = {
  auth,
  config
};