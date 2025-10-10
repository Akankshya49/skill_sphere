const express = require("express");
const mongoose = require("mongoose");

const { auth } = require('express-openid-connect');
const { config } = require("./config/auth0");

const {errorHandler} = require("./middleware/errorHandler");
const{rateLimits} = require("./middleware/Rate limiting");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true}));

app.use(rateLimits.general);

app.use(auth(config)); // auth0 middlewARE

// Routes

