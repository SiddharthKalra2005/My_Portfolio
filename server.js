// 1. Import frameworks and configure environment variables
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser'); // Added for JWT
const jwt = require('jsonwebtoken'); // Added for JWT
const Project = require('./models/Project');

// 2. Initialize the app
const app = express();
const PORT = process.env.PORT || 3000;

// 3. Configure the templating engine
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Added to parse JSON bodies
app.use(cookieParser()); // Added to read JWT cookies

// 4. Set up a folder for static files (CSS, images)
app.use(express.static('public'));

// 5. Connect to MongoDB (will use the URI from your .env file)
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB!'))
    .catch((err) => console.error('MongoDB connection error:', err));


// --- JWT AUTHENTICATION MIDDLEWARE ---
// This acts as the bouncer for your protected routes
const requireAuth = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.redirect('/login');
    
    try {
        jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        res.clearCookie('token');
        return res.redirect('/login');
    }
};

// --- AUTHENTICATION ROUTES ---
// Show the login page
app.get('/login', (req, res) => {
    res.render('login');
});

// Handle login form submission
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        const token = jwt.sign({ user: username }, process.env.JWT_SECRET, { expiresIn: '2h' });
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        res.redirect('/admin');
    } else {
        res.render('login', { error: 'Invalid credentials. Access denied.' });
    }
});

// Logout route
app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
});


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

// Show the admin form (PROTECTED WITH requireAuth)
app.get('/admin', requireAuth, async (req, res) => {
    try {
        const allProjects = await Project.find({});
        res.render('admin', { projects: allProjects });
    } catch (error) {
        console.error('Error fetching projects for admin:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Delete project route (PROTECTED WITH requireAuth)
app.post('/admin/delete/:id', requireAuth, async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.id);
        res.redirect('/admin'); // Refresh the admin page after deleting
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).send('Internal Server Error');
    }
});

// POST route: Handle form submission and save to MongoDB Atlas (PROTECTED WITH requireAuth)
app.post('/admin/add-project', requireAuth, async (req, res) => {
    try {
        const { title, description, techStack, githubLink } = req.body;

        // Split the comma-separated tech stack string into a clean array of strings
        const formattedTechStack = techStack
            .split(',')
            .map(tech => tech.trim())
            .filter(tech => tech.length > 0);

        // Instantiate the document using your pre-configured schema
        const newProject = new Project({
            title,
            description,
            techStack: formattedTechStack,
            githubLink
        });

        // Save to Atlas
        await newProject.save();
        
        // Redirect to the projects page so you can immediately see the dynamic grid update
        res.redirect('/projects');
        
    } catch (error) {
        console.error('Error saving project to Atlas:', error);
        res.status(500).send('Internal Server Error while saving the project.');
    }
});

// 7. Start the server
app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
});