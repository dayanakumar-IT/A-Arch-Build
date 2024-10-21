const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

// Configure Multer for File Uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Set the uploads directory
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Set the filename
    }
});
const upload = multer({ storage: storage });


// Create a new independent connection for the daily log database
const dailylogDB = mongoose.createConnection('mongodb://localhost:27017/construction')

dailylogDB.on('connected', () => {
    console.log('Construction Daily Log DB connected');
});

// Handle connection errors
dailylogDB.on('error', (err) => {
    console.log('Connection error:', err);
});

    

// Update the progress schema
const progressSchema = new mongoose.Schema({
    sitecode: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
    weather: {
        type: [String], // Changed to an array of strings
        required: true,
    },
    workforceDetails: [
        {
            teamName: { type: String, required: true },
            workhrs: { type: String, required: true },
            tasksdone: [{ type: String, required: true }],
            taskstatus: { type: String, required: true },
        },
    ],
    equipmentDetails: [
        {
            equiptype: { type: String, required: true },
            usedhrs: { type: String, required: true },
        },
    ],
    observations: {
        type: String,
    },
    conditions: {
        type: String,
    },
    comments: {
        type: String,
    },
});

const progressModel = dailylogDB.model('progress', progressSchema);

// POST Route for Creating Progress Entry
app.post('/progress', upload.single('conditions'), async (req, res) => {
    try {
        // Parse JSON strings
        const workforceDetails = JSON.parse(req.body.workforceDetails);
        const equipmentDetails = JSON.parse(req.body.equipmentDetails);

        // Access other form fields
        const { sitecode, location, date, weather, observations, comments } = req.body;
        const weatherArray = weather.split(', ').map(item => item.trim());
        const conditions = req.file ? req.file.filename : null;

        // Create new progress document
        const newProgress = new progressModel({
            sitecode,
            location,
            date,
            weather: weatherArray,
            workforceDetails,
            equipmentDetails,
            observations,
            conditions,
            comments,
        });

        await newProgress.save();
        res.status(201).json(newProgress);
    } catch (error) {
        console.error('Error creating progress:', error);
        res.status(500).json({ message: error.message });
    }
});

// GET Route for Retrieving Progress Entries
app.get('/progress', async (req, res) => {
    const { page = 1, limit = 6 } = req.query;
    try {
        const progresses = await progressModel.find()
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const totalProgress = await progressModel.countDocuments();

        res.json({
            data: progresses,
            totalPages: Math.ceil(totalProgress / limit),
            currentPage: parseInt(page),
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
});

// PUT Route for Updating a Progress Entry
app.put('/progress/:id', upload.single('conditions'), async (req, res) => {
    try {
        // Parse JSON strings
        const workforceDetails = JSON.parse(req.body.workforceDetails);
        const equipmentDetails = JSON.parse(req.body.equipmentDetails);

        // Access other form fields
        const { sitecode, location, date, weather, observations, comments } = req.body;
        const weatherArray = weather.split(', ').map(item => item.trim());
        const conditions = req.file ? req.file.filename : undefined;

        const id = req.params.id;

        // Prepare update object
        const updateData = {
            sitecode,
            location,
            date,
            weather: weatherArray,
            workforceDetails,
            equipmentDetails,
            observations,
            comments,
            ...(conditions && { conditions }),
        };

        const updatedProgress = await progressModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!updatedProgress) {
            return res.status(404).json({ message: 'Progress not found' });
        }
        res.json(updatedProgress);
    } catch (error) {
        console.error('Error updating progress:', error);
        res.status(500).json({ message: error.message });
    }
});

// DELETE Route for Deleting a Progress Entry
app.delete('/progress/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const progress = await progressModel.findByIdAndDelete(id);

        if (progress && progress.conditions) {
            const fs = require('fs');
            const conditionsPath = path.join(__dirname, 'uploads', progress.conditions);
            fs.unlink(conditionsPath, (err) => {
                if (err) {
                    console.error('Failed to delete conditions:', err);
                }
            });
        }

        res.status(204).end();
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
});

// Export the app
module.exports = app;
