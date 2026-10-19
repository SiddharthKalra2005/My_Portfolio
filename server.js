// 1. Import frameworks and configure environment variables
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Project = require('./models/Project');

// 2. Initialize the app
const app = express();
const PORT = 3000;

// 3. Configure the templating engine
app.set('view engine', 'ejs');

// 4. Set up a folder for static files (CSS, images)
app.use(express.static('public'));

// 5. Connect to MongoDB (will use the URI from your .env file)
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB!'))
    .catch((err) => console.error('MongoDB connection error:', err));

// 6. Create the home route
app.get('/', async (req, res) => {
    try {
        // Fetch all projects from MongoDB
        const projects = await Project.find({}); 
        // Pass the fetched projects to the index.ejs template
        res.render('index', { projects: projects }); 
    } catch (err) {
        console.error('Error fetching projects:', err);
        res.status(500).send('Internal Server Error');
    }
});

// 7. Start the server
app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
});