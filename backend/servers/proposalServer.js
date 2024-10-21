const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Initialize the Express app
const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const proposalDB = mongoose.createConnection('mongodb://localhost:27017/proposalsDB');
    proposalDB.on('connected', () => {
        console.log('Propsal DB connected');
    });
    
    // Handle connection errors
    proposalDB.on('error', (err) => {
        console.log('Connection error:', err);
    });
   

// Define the proposal schema and model
// Define the proposal schema and model
const proposalSchema = new mongoose.Schema({
    sidecode: { type: String, required: true },
    proposalID: { type: String, required: true },
    works: [
        {
            typeOfWork: { type: String, required: true, enum: ['Material Supply', 'Labor', 'Equipment Rental', 'Subcontracting', 'Other'] },
            quantity: { type: Number, required: true },
            unitOfMeasurement: { type: String, required: true, enum: ['Lots', 'Tons', 'Units'] },
            description: { type: String, required: true }
        }
    ], // Multiple work entries supported here
    submissionDeadline: { type: Date, required: true },
    evaluationCriteria: { type: String, required: true },
    status: { type: String, enum: ['Open', 'Closed', 'Awarded'], default: 'Open' },
}, {
    timestamps: true, // Add createdAt and updatedAt timestamps
});

const Proposal = proposalDB.model('Proposal', proposalSchema);

// CRUD Routes

// Create Proposal
app.post('/proposals', async (req, res) => {
    try {
        const proposal = new Proposal(req.body); // req.body should include the works array
        await proposal.save();
        res.status(201).send(proposal);
    } catch (err) {
        res.status(400).send({ error: 'Failed to create proposal', details: err });
    }
});
// Get All Proposals
app.get('/proposals', async (req, res) => {
    try {
        const proposals = await Proposal.find();
        res.status(200).send(proposals);
    } catch (err) {
        console.error('Error fetching proposals:', err);
        res.status(400).send({ message: 'Error fetching proposals', error: err });
    }
});

// Get Single Proposal by ID
app.get('/proposals/:id', async (req, res) => {
    try {
        const proposal = await Proposal.findById(req.params.id);
        if (!proposal) {
            return res.status(404).send({ message: 'Proposal not found' });
        }
        res.status(200).send(proposal);
    } catch (err) {
        console.error('Error fetching proposal:', err);
        res.status(400).send({ message: 'Error fetching proposal', error: err });
    }
});

// Update Proposal
app.put('/proposals/:id', async (req, res) => {
    try {
        // Check if the ID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send({ message: 'Invalid proposal ID' });
        }

        // Ensure the request body contains the necessary data
        const updateData = req.body;
        if (!updateData || Object.keys(updateData).length === 0) {
            return res.status(400).send({ message: 'No update data provided' });
        }

        // Find the proposal by ID and update it
        const proposal = await Proposal.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
        if (!proposal) {
            return res.status(404).send({ message: 'Proposal not found' });
        }

        // Return the updated proposal
        res.status(200).send(proposal);
    } catch (err) {
        console.error('Error updating proposal:', err);
        res.status(500).send({ message: 'Server error while updating proposal', error: err.message });
    }
});


// Delete Proposal
app.delete('/proposals/:id', async (req, res) => {
    try {
        const proposal = await Proposal.findByIdAndDelete(req.params.id);
        if (!proposal) {
            return res.status(404).send({ message: 'Proposal not found' });
        }
        res.status(200).send({ message: 'Proposal deleted successfully' });
    } catch (err) {
        console.error('Error deleting proposal:', err);
        res.status(400).send({ message: 'Error deleting proposal', error: err });
    }
});

// Export the app
module.exports = app;
