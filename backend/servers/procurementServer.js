const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());

// Enable CORS for all routes
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
}));

// Connect to MongoDB
const proDB = mongoose.createConnection('mongodb://localhost:27017/archbuild')
proDB.on('connected', () => {
    console.log('Procurement DB connected');
});

// Handle connection errors
proDB.on('error', (err) => {
    console.log('Connection error:', err);
});

// Define procurement schema
const procurementSchema = new mongoose.Schema({
  procurementId: {
    type: String,
    required: true,
  },
  proposalId: {
    type: String,
    required: true,
  },
  vendorId: {
    type: String,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Overdue'],
    required: true,
  },
  invoiceNumber: {
    type: String,
    required: true,
  },
  paymentTerms: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
  },
}, {
  timestamps: true,
});

const Procurement = proDB.model('procurement', procurementSchema);

// Route to create a new procurement entry
app.post('/procurements', async (req, res) => {
  const {
    procurementId, proposalId, vendorId,
    paymentStatus, invoiceNumber,
    paymentTerms, notes,
  } = req.body;

  try {
    const newProcurement = new Procurement({
      procurementId, proposalId, vendorId,
      paymentStatus, invoiceNumber,
      paymentTerms, notes,
    });
    await newProcurement.save();
    res.status(201).json(newProcurement);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// Route to get procurements (single or all with pagination)
app.get('/procurements', async (req, res) => {
  const { page = 1, limit = 6, search = '', paymentStatus } = req.query;

  // Create filter object for MongoDB query
  const filter = {};

  // Filter by payment status if provided
  if (paymentStatus) {
    filter.paymentStatus = paymentStatus; // Filter by payment status
  }

  // Create search query for procurementId and vendorId
  const searchQuery = search
    ? {
        $or: [
          { procurementId: { $regex: search, $options: 'i' } },
          { vendorId: { $regex: search, $options: 'i' } },
        ],
      }
    : {};

  try {
    // Fetch procurements with pagination and filtering
    const procurements = await Procurement.find({ ...filter, ...searchQuery }) // Combine filters
      .skip((page - 1) * limit) // Calculate items to skip for pagination
      .limit(parseInt(limit)); // Limit results per page

    // Count total procurements matching the filters
    const totalProcurements = await Procurement.countDocuments({ ...filter, ...searchQuery });

    res.json({
      data: procurements,
      totalPages: Math.ceil(totalProcurements / limit), // Calculate total pages
      currentPage: parseInt(page), // Include current page for reference
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Route to update a procurement by ID
app.put('/procurements/:id', async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedProcurement = await Procurement.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedProcurement) {
      return res.status(404).json({ message: 'Procurement not found' });
    }
    res.json(updatedProcurement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to delete a procurement by ID
app.delete('/procurements/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const procurement = await Procurement.findByIdAndDelete(id);

    if (!procurement) {
      return res.status(404).json({ message: 'Procurement not found' });
    }

    res.status(204).end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// Export the app
module.exports = app;