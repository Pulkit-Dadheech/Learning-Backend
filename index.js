const express = require("express");
const app = express();

// Define a middleware to serve static files
app.use(express.static('public')); // 'public' is the directory where your static files are located

const bodyParser = require('body-parser');

// Middleware for parsing JSON request bodies
app.use(bodyParser.json());

app.get("/api", (req
    , res) => {
    res.send("Welcome to Money Orders API");
});

// Mount routes
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const transactionRoutes= require('./routes/transactionRoutes');
const siteRoutes = require('./routes/siteRoutes');
const mailRoutes = require('./routes/mailRoutes');

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/', siteRoutes);
app.use('/api/mail', mailRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});