// 1. Import Mongoose
const mongoose = require('mongoose');

// 2. Define the blueprint (Schema) for a project
const projectSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    techStack: { 
        type: [String], // Array of strings (e.g., ['PyTorch', 'Node.js']) 
        required: true 
    },
    githubLink: { 
        type: String, 
        required: true 
    }
});

// 3. Compile the schema into a model and export it
module.exports = mongoose.model('Project', projectSchema);