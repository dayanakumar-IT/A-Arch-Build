require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const axios = require('axios');  // Use axios for making HTTP requests

const app = express();
app.use(express.json());
app.use(cors());

// Serve uploaded images as static files
app.use('/uploads', express.static('uploads'));

// Create a new independent connection for the Records database
const recordsDB = mongoose.createConnection('mongodb://localhost:27017/inspection');

// Handle connection errors
recordsDB.on('connected', () => {
    console.log('Records DB connected');
});

recordsDB.on('error', (err) => {
    console.log('Connection error:', err);
});

// Create Issue Schema (for nested issues)
const issueSchema = new mongoose.Schema({
    issue: {
        type: String,
        required: true,
    },
    severityLevel: {
        type: String,
        required: true,
    },
    count: {
        type: Number,
        required: true,
    },
    imagePath: { // Add image path field for each issue
        type: String,
    },
    aiSolution: { // Field to store the AI-generated solution
        type: String,
    }
});

// Create Record Schema for inspections
const recordSchema = new mongoose.Schema({
    inspectionTitle: {
        type: String,
        required: true,
    },
    inspectionType: {
        type: String,
        required: true,
    },
    inspectionDate: {
        type: String,
        required: true,
    },
    inspectionTime: {
        type: String,
        required: true,
    },
    weatherConditions: {
        type: String,
        required: true,
    },
    overallComplianceStatus: {
        type: String,
        required: true,
    },
    issues: [issueSchema], // Array of issue documents with image path
    followUpNeeded: {
        type: String,
        required: true,
    },
    generalRemarks: {
        type: String,
    },
});

// Create Record model
const recordModel = recordsDB.model('Record', recordSchema);

// Configure multer for file uploads (multiple images for issues)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/'); // Upload directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Filename with timestamp
    },
});

const upload = multer({ storage: storage });



// Add record route with image upload and AI solution generation
app.post('/addRecord', upload.fields([
    { name: 'image', maxCount: 1 },  // for the main image if any
    { name: 'issueImages', maxCount: 10 }  // allow up to 10 issue images
]), async (req, res) => {
    const {
        inspectionTitle,
        inspectionType,
        inspectionDate,
        inspectionTime,
        weatherConditions,
        overallComplianceStatus,
        issues, // JSON string for the issues array
        followUpNeeded,
        generalRemarks
    } = req.body;

    try {
        let issueCount = 1;
        const issueImages = req.files['issueImages'] || [];

        // Parse the issues array from JSON
        const parsedIssues = await Promise.all(JSON.parse(issues).map(async (issue, index) => {
            // Generate AI solution if needed
            let aiSolution = null;
            if (issue.requestSolution) {  // Assuming requestSolution is sent to identify when to generate
                aiSolution = await generateAISolution(issue.issue);
            }

            return {
                ...issue,
                count: issueCount++, // Increment issue count
                imagePath: `/uploads/${issueImages[index].filename}`, // Assign image path to each issue
                aiSolution: aiSolution, // Store AI solution if generated
            };
        }));

        const newRecord = new recordModel({
            inspectionTitle,
            inspectionType,
            inspectionDate,
            inspectionTime,
            weatherConditions,
            overallComplianceStatus,
            issues: parsedIssues,
            followUpNeeded,
            generalRemarks,
        });

        await newRecord.save();
        res.status(201).json(newRecord);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error creating record', error: error.message });
    }
});






// Get records route
app.get('/records/title/:inspectionTitle', async (req, res) => {
    try {
        const recordsList = await recordModel.find({ inspectionTitle: req.params.inspectionTitle });
        if (!recordsList.length) {
            return res.status(404).json({ message: 'No records found for this title' });
        }
        res.json(recordsList);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error fetching records', error: error.message });
    }
});


// Update record by inspectionTitle route
// Update record by inspectionTitle route with image upload handling
app.put('/records/title/:inspectionTitle', upload.fields([
    { name: 'issueImages', maxCount: 10 }  // Handle issue images (up to 10)
]), async (req, res) => {
    const { inspectionTitle } = req.params;
    const {
        inspectionType,
        inspectionDate,
        inspectionTime,
        weatherConditions,
        overallComplianceStatus,
        issues, // This will still come as a stringified JSON
        followUpNeeded,
        generalRemarks,
    } = req.body;

    try {
        // Recalculate issue count on update
        let updatedIssues = JSON.parse(issues).map((issue, index) => ({
            ...issue,
            count: index + 1,
        }));

        // Check if there are uploaded issue images and assign them to the corresponding issues
        const issueImages = req.files['issueImages'];
        if (issueImages) {
            issueImages.forEach((file, index) => {
                updatedIssues[index].imagePath = `/uploads/${file.filename}`;
            });
        }

        // Find the record by inspectionTitle and update
        const updatedRecord = await recordModel.findOneAndUpdate(
            { inspectionTitle }, // Match the record by inspectionTitle
            {
                inspectionType,
                inspectionDate,
                inspectionTime,
                weatherConditions,
                overallComplianceStatus,
                issues: updatedIssues,
                followUpNeeded,
                generalRemarks,
            },
            { new: true }
        );

        if (!updatedRecord) {
            return res.status(404).json({ message: 'Record NOT FOUND!' });
        }

        res.json(updatedRecord);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating record', error: error.message });
    }
});


// Delete record route
app.delete('/records/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedRecord = await recordModel.findByIdAndDelete(id);
        if (!deletedRecord) {
            return res.status(404).json({ message: 'Record NOT FOUND!' });
        }
        res.status(204).end();
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error deleting record', error: error.message });
    }
});

// Export the app
module.exports = app;
