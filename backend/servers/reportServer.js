const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
const reportDB = mongoose.createConnection('mongodb://localhost:27017/reports')

reportDB.on('connected', () => {
    console.log('Soil,Env, Survey DB connected');
});

// Handle connection errors
reportDB.on('error', (err) => {
    console.log('Connection error:', err);
});
    
// Define Mongoose Schema for Soil Reports
const soilReportSchema = new mongoose.Schema({
    soilType: String,
    document: String,
    moistureContent: Number,
    phLevel: Number,
    compactionLevel: Number,
});

const SoilReport = reportDB.model('SoilReport', soilReportSchema);

// Define Mongoose Schema for Environmental Reports
const environmentalReportSchema = new mongoose.Schema({
    location: String,
    document: String,
    temperature: String,
    airQualityIndex: String,
    waterQuality: String,
    hazardousMaterials: {
        chemicals: Boolean,
        asbestos: Boolean,
        lead: Boolean,
    },
});

const EnvironmentalReport = reportDB.model('EnvironmentalReport', environmentalReportSchema);

const surveyorReportSchema = new mongoose.Schema({
    landArea: Number,
    document: String,
    elevation: Number,
    topography: String,
    boundaryDetails: {
        clearlyMarked: Boolean,
        disputed: Boolean,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const SurveyorReport = reportDB.model('SurveyorReport', surveyorReportSchema);

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

// Routes for Soil Reports
app.post('/api/soil-report', upload.single('document'), async (req, res) => {
    try {
        const newReport = new SoilReport({
            ...req.body,
            document: req.file ? req.file.path : null,
        });
        await newReport.save();
        res.status(201).json({ message: 'Soil report saved successfully', report: newReport });
    } catch (error) {
        res.status(500).json({ message: 'Error saving soil report', error });
    }
});

app.get('/api/soil-reports', async (req, res) => {
    try {
        const reports = await SoilReport.find();
        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching soil reports', error });
    }
});

app.get('/api/soil-report/:id', async (req, res) => {
    try {
        const report = await SoilReport.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }
        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching the soil report', error });
    }
});

app.put('/api/soil-report/:id', upload.single('document'), async (req, res) => {
    try {
        const updateData = {
            soilType: req.body.soilType,
            moistureContent: req.body.moistureContent,
            phLevel: req.body.phLevel,
            compactionLevel: req.body.compactionLevel,
        };

        if (req.file) {
            updateData.document = req.file.path;
        }

        const updatedReport = await SoilReport.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updatedReport) {
            return res.status(404).json({ message: 'Report not found' });
        }

        res.status(200).json({ message: 'Report updated successfully', report: updatedReport });
    } catch (error) {
        res.status(500).json({ message: 'Error updating report', error });
    }
});

app.delete('/api/soil-report/:id', async (req, res) => {
    try {
        const deletedReport = await SoilReport.findByIdAndDelete(req.params.id);
        if (!deletedReport) {
            return res.status(404).json({ message: 'Report not found' });
        }
        res.status(200).json({ message: 'Report deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting report', error });
    }
});

// Routes for Environmental Reports
app.post('/api/environmental-report', upload.single('document'), async (req, res) => {
    try {
        const newReport = new EnvironmentalReport({
            ...req.body,
            document: req.file ? req.file.path : null,
            hazardousMaterials: JSON.parse(req.body.hazardousMaterials),
        });
        await newReport.save();
        res.status(201).json({ message: 'Environmental report saved successfully', report: newReport });
    } catch (error) {
        res.status(500).json({ message: 'Error saving environmental report', error });
    }
});

app.get('/api/environmental-reports', async (req, res) => {
    try {
        const reports = await EnvironmentalReport.find();
        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching environmental reports', error });
    }
});

app.delete('/api/environmental-report/:id', async (req, res) => {
    try {
        const deletedReport = await EnvironmentalReport.findByIdAndDelete(req.params.id);
        if (!deletedReport) {
            return res.status(404).json({ message: 'Report not found' });
        }
        res.status(200).json({ message: 'Environmental report deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting environmental report', error });
    }
});
// Retrieve a specific environmental report by ID
app.get('/api/environmental-report/:id', async (req, res) => {
    try {
        const report = await EnvironmentalReport.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }
        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching the environmental report', error });
    }
});
// Update an environmental report by ID
app.put('/api/environmental-report/:id', upload.single('document'), async (req, res) => {
    try {
        const updateData = {
            location: req.body.location,
            temperature: req.body.temperature,
            airQualityIndex: req.body.airQualityIndex,
            waterQuality: req.body.waterQuality,
            hazardousMaterials: JSON.parse(req.body.hazardousMaterials),
        };

        if (req.file) {
            updateData.document = req.file.path;
        }

        const updatedReport = await EnvironmentalReport.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updatedReport) {
            return res.status(404).json({ message: 'Report not found' });
        }

        res.status(200).json({ message: 'Report updated successfully', report: updatedReport });
    } catch (error) {
        res.status(500).json({ message: 'Error updating report', error });
    }
});

// Create a new surveyor report
app.post('/api/surveyor-report', upload.single('document'), async (req, res) => {
    try {
        const newReport = new SurveyorReport({
            ...req.body,
            document: req.file ? req.file.path : null,
        });
        await newReport.save();
        res.status(201).json({ message: 'Surveyor report saved successfully', report: newReport });
    } catch (error) {
        res.status(500).json({ message: 'Error saving surveyor report', error });
    }
});

// Retrieve all surveyor reports
app.get('/api/surveyor-reports', async (req, res) => {
    try {
        const reports = await SurveyorReport.find();
        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching surveyor reports', error });
    }
});

// Retrieve a specific surveyor report by ID
app.get('/api/surveyor-report/:id', async (req, res) => {
    try {
        const report = await SurveyorReport.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }
        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching the surveyor report', error });
    }
});

// Update a surveyor report by ID
app.put('/api/surveyor-report/:id', upload.single('document'), async (req, res) => {
    try {
        const updateData = {
            landArea: req.body.landArea,
            elevation: req.body.elevation,
            topography: req.body.topography,
            boundaryDetails: JSON.parse(req.body.boundaryDetails),
        };

        if (req.file) {
            updateData.document = req.file.path;
        }

        const updatedReport = await SurveyorReport.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updatedReport) {
            return res.status(404).json({ message: 'Report not found' });
        }

        res.status(200).json({ message: 'Report updated successfully', report: updatedReport });
    } catch (error) {
        res.status(500).json({ message: 'Error updating report', error });
    }
});

// Delete a surveyor report by ID
app.delete('/api/surveyor-report/:id', async (req, res) => {
    try {
        const deletedReport = await SurveyorReport.findByIdAndDelete(req.params.id);
        if (!deletedReport) {
            return res.status(404).json({ message: 'Report not found' });
        }

        res.status(200).json({ message: 'Report deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting report', error });
    }
});


// Export the app
module.exports = app;