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

//CORS middleware
app.use((req,res)=>{
  res.header("Access-Control-Allow-Origin","*");
  res.header("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods","GET, POST, PUT, DELETE, OPTIONS");
  next();

});

// Routes
app.use('/api/user', require('./routes/user'));
app.use('/api/communities', require('./routes/communities'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/reviews', require('./routes/review'));
app.use('/api/utils', require('./routes/utils'));


// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Community Platform API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Root Endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the Community Platform API',
    endpoints: {
      users: '/api/user',
      communities: '/api/communities',
      projects: '/api/projects',
      reviews: '/api/reviews',
      utils: '/api/utils'
    },
    documentation: 'Visit /api/docs for API documentation'
  });
} 
);
app.use(errorHandler);

// Database connection and server start
const startServer = async () => {
  try {
    await connectMongoDB(process.env.MONGODB_URI || "mongodb://localhost:27017/community-platform");
    console.log('✅ Connected to MongoDB');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API Documentation: http://localhost:${PORT}/`);
      console.log(`Health Check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;



    


