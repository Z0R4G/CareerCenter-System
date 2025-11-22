const express = require('express');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const db = require('./configs/dbConnection');
const signupLoginRoutes = require('./routes/signupLogin');
const editProfileRoutes = require('./routes/editProfile');
const FeedRoutes = require('./routes/FeedRoutes');
const ResumeRoutes = require('./routes/ResumeChecker');
//middlewares
const app = express();
app.use(express.json()); 


// Serve static files
const public= path.resolve(__dirname, '../public');
app.use(express.static(public));

// app Routes
app.use('/app',signupLoginRoutes);
app.use('/app',editProfileRoutes);
app.use('/app',FeedRoutes);
app.use('/app',ResumeRoutes);



// 404 handler for unmatched routes
app.use((_req, res) => {
  res.status(404).send('Not Found');
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});

