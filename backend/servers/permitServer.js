const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("uploads")); // Serve uploaded files

// Serving static files from the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB connection
const permitDB = mongoose.createConnection("mongodb://127.0.0.1:27017/permitDb");
permitDB.on('connected', () => {
    console.log('Permits DB connected');
});

// Handle connection errors
permitDB.on('error', (err) => {
    console.log('Connection error:', err);
});
    
// Permit Schema
const permitSchema = new mongoose.Schema({
  permitNumber: String,
  issueDate: Date,
  expiryDate: Date,
  projectName: String,
  sideCode: String,
  approvalStatus: String,
  permitDocument: String, // For storing file path
});

const Permit = permitDB.model("Permit", permitSchema);

// File upload using multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Save file with a unique name
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDFs are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter, // PDF file filtering
});

// API routes

// Create a new permit
app.post("/api/permits", upload.single("permitDocument"), async (req, res) => {
  try {
    const { permitNumber, issueDate, expiryDate, projectName, sideCode, approvalStatus } = req.body;
    const permitDocument = req.file ? `/uploads/${req.file.filename}` : null;

    // Log the file path
    console.log('File path being saved:', permitDocument);

    const newPermit = new Permit({
      permitNumber,
      issueDate,
      expiryDate,
      projectName,
      sideCode,
      approvalStatus,
      permitDocument: req.file ? `/uploads/${req.file.filename}` : null,
    });

    await newPermit.save();
    res.status(201).json({ message: "Permit created successfully", newPermit });
  } catch (error) {
    console.error("Error creating permit:", error);
    res.status(500).json({ message: "Server error" });
  }
});



// Get all permits
app.get("/api/permits", async (req, res) => {
  try {
    const permits = await Permit.find();
    res.json(permits);
  } catch (error) {
    console.error("Error fetching permits:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get permit by ID
app.get("/api/permits/:id", async (req, res) => {
  try {
    const permit = await Permit.findById(req.params.id);
    if (!permit) return res.status(404).json({ message: "Permit not found" });
    res.json(permit);
  } catch (error) {
    console.error("Error fetching permit:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update a permit
app.put("/api/permits/:id", upload.single("permitDocument"), async (req, res) => {
  try {
    const { permitNumber, issueDate, expiryDate, projectName, sideCode, approvalStatus } = req.body;
    const permitDocument = req.file ? `/uploads/${req.file.filename}` : null;

    const updatedPermit = await Permit.findByIdAndUpdate(
      req.params.id,
      {
        permitNumber,
        issueDate,
        expiryDate,
        projectName,
        sideCode,
        approvalStatus,
        permitDocument, // Update the file path if a new file is uploaded
      },
      { new: true }
    );

    if (!updatedPermit) return res.status(404).json({ message: "Permit not found" });

    res.json({ message: "Permit updated successfully", updatedPermit });
  } catch (error) {
    console.error("Error updating permit:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// Delete a permit
app.delete("/api/permits/:id", async (req, res) => {
  try {
    const permit = await Permit.findByIdAndDelete(req.params.id);
    if (!permit) return res.status(404).json({ message: "Permit not found" });

    if (permit.permitDocument) {
      fs.unlinkSync(path.join(__dirname, "uploads", permit.permitDocument)); // Delete uploaded file
    }

    res.json({ message: "Permit deleted successfully" });
  } catch (error) {
    console.error("Error deleting permit:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get permits expiring in the next 10 days or recently updated
app.get("/api/notifications", async (req, res) => {
  try {
    const today = new Date();
    const tenDaysLater = new Date(today);
    tenDaysLater.setDate(today.getDate() + 10);

    // Get permits expiring in the next 10 days or that have been updated recently
    const expiringPermits = await Permit.find({
      expiryDate: { $lte: tenDaysLater },
    });

    // Add messages to each permit depending on the situation
    const notifications = expiringPermits.map((permit) => {
      const daysRemaining = Math.ceil(
        (new Date(permit.expiryDate) - today) / (1000 * 60 * 60 * 24)
      );
      let message = `Permit ${permit.permitNumber} is expiring in ${daysRemaining} day(s).`;

      if (daysRemaining <= 0) {
        message = `Permit ${permit.permitNumber} has expired.`;
      } else if (daysRemaining <= 10) {
        message = `Permit ${permit.permitNumber} will expire soon, in ${daysRemaining} day(s).`;
      }

      return {
        ...permit._doc,
        message, // Add the custom message for each notification
      };
    });

    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Export the app
module.exports = app;

