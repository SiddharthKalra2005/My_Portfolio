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

app.use(express.urlencoded({ extended: true }));

// 4. Set up a folder for static files (CSS, images)
app.use(express.static('public'));

// 5. Connect to MongoDB (will use the URI from your .env file)
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB!'))
    .catch((err) => console.error('MongoDB connection error:', err));

// 1. The Home Route (Just renders the main page)
app.get('/', (req, res) => {
    res.render('index'); 
});

// 2. The Real Projects Route (Fetches DB data and renders the new page)
app.get('/projects', async (req, res) => {
    try {
        const projects = await Project.find({}); 
        res.render('projects', { projects: projects }); 
    } catch (err) {
        console.error('Error fetching projects:', err);
        res.status(500).send('Internal Server Error');
    }
});

// 3. Resume Page
app.get('/resume', (req, res) => {
    res.render('resume'); 
});

// Show the admin form
app.get('/admin', (req, res) => {
    res.render('admin');
});

// Handle the form submission
app.post('/admin/add', async (req, res) => {
    try {
        const { title, description, techStack, githubLink } = req.body;

        // Convert the comma-separated string into an array of strings
        const techArray = techStack.split(',').map(tech => tech.trim());

        // Create a new project instance
        const newProject = new Project({
            title,
            description,
            techStack: techArray,
            githubLink
        });

        // Save to MongoDB
        await newProject.save();

        // Redirect back to the home page to see the new card
        res.redirect('/'); 
    } catch (err) {
        console.error(err);
        res.status(500).send('Error saving project');
    }
});

// 7. Start the server
app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
});