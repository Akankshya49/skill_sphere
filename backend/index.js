const express = require("express");
const mongoose = require("mongoose");
const { auth } = require('express-openid-connect');
const { config } = require("./config/auth0");
const { requiresAuth } = require('express-openid-connect');

const app = express();
const PORT = 3000;

const { connectMongoDb } = require("./connection");


app.use(auth(config));
app.get('/', (req, res) => {
  res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});

app.get('/profile', requiresAuth(), async (req, res) => {
  const user = await user.findOne({ auth0Id: req.oidc.user.sub });
  res.json({
    auth0Profile: req.oidc.user,
    appProfile: user
  });
});

const saveUser = require("./middleware/saveuser");
app.use(saveUser);







app.listen(PORT,()=>{
   console.log(`Server is running on port:  ${PORT}`)
});