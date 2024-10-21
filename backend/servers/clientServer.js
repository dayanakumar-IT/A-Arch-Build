// Using Express 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


// Create an instance of express
const app = express();
app.use(express.json());
app.use(cors());

// Connecting MongoDB
const clientDB = mongoose.createConnection('mongodb://localhost:27017/itp-app')
clientDB.on('connected', () => {
    console.log('Client DB connected');
});

// Handle connection errors
clientDB.on('error', (err) => {
    console.log('Connection error:', err);
});

// Creating schema
const clientSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: true
  },
  clientLocation: {
    type: String,
    required: true
  },
  clientContactNo: {
    type: String,
    required: true
  },
  dateOfConsultation: {
    type: Date,
    required: true
  },
  projectName: {
    type: String,
    required: true // Make projectName required
  }
});

// Creating model
const clientModel = clientDB.model('Client', clientSchema);

// Create a client detail
app.post('/clients', async (req, res) => {
  const { clientName, clientLocation, clientContactNo, dateOfConsultation, projectName } = req.body;

  try {
    // Create new client object
    const newClient = new clientModel({
      clientName,
      clientLocation,
      clientContactNo,
      dateOfConsultation,
      projectName // Save project name to database
    });

    // Save the client to the database
    await newClient.save();

    // Return success response
    res.status(201).json(newClient);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// Get all client details
app.get('/clients', async (req, res) => {
  try {
    const clients = await clientModel.find();
    res.json(clients);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// Update a client detail
app.put('/clients/:id', async (req, res) => {
  try {
    const { clientName, clientLocation, clientContactNo, dateOfConsultation, projectName } = req.body;
    const id = req.params.id;
    const updatedClient = await clientModel.findByIdAndUpdate(
      id,
      { clientName, clientLocation, clientContactNo, dateOfConsultation, projectName }, // Include project name in the update
      { new: true }
    );
    if (!updatedClient) {
      return res.status(404).json({ message: "Client Details Not Found" });
    }
    res.json(updatedClient);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// Delete a client detail
app.delete('/clients/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await clientModel.findByIdAndDelete(id);
    res.status(204).end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// Export the app
module.exports = app;