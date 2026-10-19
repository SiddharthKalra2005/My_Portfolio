require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('./models/Project'); // Import your schema

// Your project data from the resume
const projects = [
    {
        title: 'Housing Price Prediction',
        description: 'Optimized a Random Forest regressor via Randomized SearchCV, outperforming a DNN baseline using hand-crafted features.',
        techStack: ['Python', 'scikit-learn', 'Pandas', 'NumPy'],
        githubLink: 'https://github.com/SiddharthKalra2005/House_Price_Prediction' 
    },
    {
        title: 'CIFAR-10 Image Classifier',
        description: 'Designed a 3-block CNN with Batch Norm, Dropout, and data augmentation, achieving 83.13% validation accuracy.',
        techStack: ['TensorFlow', 'Keras', 'Python'],
        githubLink: 'https://github.com/SiddharthKalra2005/cifar_10_prediction' 
    },
    {
        title: 'Real Time Calculator (OCR)',
        description: 'Built a real-time calculator that detects handwritten digits and evaluates arithmetic expressions from images with 97.5% accuracy.',
        techStack: ['PyTorch', 'OpenCV', 'Python'],
        githubLink: 'https://github.com/SiddharthKalra2005/Real_Time_Calculator_OCR' 
    }
];

// Connect and seed the database
mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB for seeding...');
        
        // Clear existing data to prevent duplicates
        await Project.deleteMany({});
        console.log('Old projects cleared.');

        // Insert new data
        await Project.insertMany(projects);
        console.log('Database successfully seeded with new projects!');

        // Disconnect after finishing
        mongoose.connection.close();
    })
    .catch((err) => {
        console.error('Seeding error:', err);
    });