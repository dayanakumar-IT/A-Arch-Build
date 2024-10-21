const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});
const upload = multer({ storage: storage });

// Connect to MongoDB
const vendorDB = mongoose.createConnection('mongodb://localhost:27017/vendor-app')
vendorDB.on('connected', () => {
    console.log('Vendor DB connected');
});

// Handle connection errors
vendorDB.on('error', (err) => {
    console.log('Connection error:', err);
});

// Define the vendor schema
const vendorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    contactPerson: {
        type: String,
        required: true,
    },
    phone: {
        type: String,  
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    website: {
        type: String,
    },
    vendorType: {
        type: String,
    },
    logo: {
        type: String,  
    },
});

const vendorModel = vendorDB.model('Vendor', vendorSchema);

app.post('/add', upload.single('logo'), async (req, res) => {
    const { name, address, contactPerson, phone, email, website, vendorType } = req.body;
    const logo = req.file ? req.file.filename : null;

    try {
        const newVendor = new vendorModel({ name, address, contactPerson, phone, email, website, vendorType, logo });
        await newVendor.save();
        res.status(201).json(newVendor);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
});

// Get all vendor items
app.get('/add', async (req, res) => {
    const { page = 1, limit = 6 } = req.query;
    try {
        const vendors = await vendorModel.find()
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const totalVendors = await vendorModel.countDocuments();
        
        res.json({
            data: vendors,
            totalPages: Math.ceil(totalVendors / limit),
            currentPage: parseInt(page),
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
});


// Update a vendor item with optional logo
app.put('/add/:id', upload.single('logo'), async (req, res) => {
    const { name, address, contactPerson, phone, email, website, vendorType } = req.body;
    const logo = req.file ? req.file.filename : undefined;

    try {
        const id = req.params.id;
        const updatedVendor = await vendorModel.findByIdAndUpdate(
            id,
            { name, address, contactPerson, phone, email, website, vendorType, ...(logo && { logo }) },
            { new: true }
        );

        if (!updatedVendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }
        res.json(updatedVendor);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
});

// Delete a vendor item
app.delete('/add/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const vendor = await vendorModel.findByIdAndDelete(id);

        if (vendor && vendor.logo) {
            const fs = require('fs');
            const logoPath = path.join(__dirname, 'uploads', vendor.logo);
            fs.unlink(logoPath, (err) => {
                if (err) {
                    console.error('Failed to delete logo:', err);
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


