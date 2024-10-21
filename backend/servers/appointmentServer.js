const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Import CORS

// Create an instance of express
const app = express();
app.use(express.json());
app.use(cors()); // Use CORS middleware

// Connecting MongoDB
const appointDB = mongoose.createConnection('mongodb://localhost:27017/appointments')
appointDB.on('connected', () => {
    console.log('Appointment DB connected');
});

// Handle connection errors
appointDB.on('error', (err) => {
    console.log('Connection error:', err);
});

// Creating Schema
const appointSchema = new mongoose.Schema({
    clientName: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    projectType: { type: String, enum: ['Design', 'Construction', 'Both'], required: true },
    preferredDate: { type: String, required: true },
    preferredTime: { type: String, required: true },
    location: { type: String, required: true },
    purpose: { type: String, required: true },
});

// Create Model
const appointModel = appointDB.model('Appoint', appointSchema);

// Create a new appointment
app.post('/appoints', async (req, res) => {
    try {
        const { clientName, email, phoneNumber, projectType, preferredDate, preferredTime, location, purpose } = req.body;
        const newAppoint = new appointModel({ clientName, email, phoneNumber, projectType, preferredDate, preferredTime, location, purpose });
        await newAppoint.save();
        res.status(201).json(newAppoint);
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: error.message });
    }
});

// Get all Appointments
app.get('/appoints', async (req, res) => {
    try {
        const appointments = await appointModel.find();
        res.json(appointments);
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: error.message });
    }
});

// Update appointment
app.put('/appoints/:id', async (req, res) => {
    try {
        const { clientName, email, phoneNumber, projectType, preferredDate, preferredTime, location, purpose } = req.body;
        const id = req.params.id;
        const updatedAppoint = await appointModel.findByIdAndUpdate(
            id,
            { clientName, email, phoneNumber, projectType, preferredDate, preferredTime, location, purpose },
            { new: true }
        );
        if (!updatedAppoint) {
            return res.status(404).json({ message: "Appointment not found" });
        }
        res.json(updatedAppoint);
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: error.message });
    }
});

// Delete appointment
app.delete('/appoints/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const deletedAppoint = await appointModel.findByIdAndDelete(id);
        if (!deletedAppoint) {
            return res.status(404).json({ message: "Appointment not found" });
        }
        res.status(204).end();
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
});

// Export the app
module.exports = app;
