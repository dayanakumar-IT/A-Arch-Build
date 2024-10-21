const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const axios = require('axios'); // Add axios for fetching the chart

const app = express();
app.use(express.json());
app.use(cors());



// Create a new independent connection for the Inspection database
const inspectionDB = mongoose.createConnection('mongodb://localhost:27017/inspection');

inspectionDB.on('connected', () => {
    console.log('Inspection DB connected');
});

// Handle connection errors
inspectionDB.on('error', (err) => {
    console.log('Connection error:', err);
});


// Create Inspection Schema
const inspectionSchema = new mongoose.Schema({
    sitecode: {
        required: true,
        type: String,
    },
    projectname: {
        required: true,
        type: String,
    },
    ititle: {
        required: true,
        type: String,
    },
    itype: {
        required: true,
        type: String,
    },
    idate: {
        required: true,
        type: String,
    },
    itime: {
        required: true,
        type: String,
    },
    assignee: {
        required: true,
        type: String,
    },
    projectcomplexity: {
        required: true,
        type: String,
    },
    location: {
        required: true,
        type: String,
    },
});

// Create Inspection model
const imodel = inspectionDB.model('Inspection', inspectionSchema);


// Create Notification Schema
const notificationSchema = new mongoose.Schema({
    message: String,
    date: { type: Date, default: Date.now },
    assignee: String,
});

// Create Notification model
const Notification = inspectionDB.model('Notification', notificationSchema);

// Define path for creating an inspection

app.post('/createinspection', async (req, res) => {
    const { sitecode, projectname, ititle, itype, idate, itime, assignee, projectcomplexity, location } = req.body;

    try {
        const inew = new imodel({ sitecode, projectname, ititle, itype, idate, itime, assignee, projectcomplexity, location });
        await inew.save();

        // Send a notification if the assignee is Morgan
        if (assignee === 'Morgan') {
            await Notification.create({ message: `New inspection created: ${ititle}`, assignee: 'Morgan' });
        }

        res.status(201).json(inew);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error creating inspection', error: error.message });
    }
});

// Get or read inspections
app.get('/inspection/createinspection', async (req, res) => {
    try {
        const inspectionslist = await imodel.find();
        res.json(inspectionslist);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error fetching inspections', error: error.message });
    }
});

app.put('/createinspection/:id', async (req, res) => {
    try {
        const { sitecode, projectname, ititle, itype, idate, itime, assignee, projectcomplexity, location } = req.body;
        const id = req.params.id;

        // Find the existing inspection
        const existingInspection = await imodel.findById(id);
        if (!existingInspection) {
            return res.status(404).json({ message: "Inspection NOT FOUND!" });
        }

        // Update the inspection
        const updatedInspection = await imodel.findByIdAndUpdate(
            id,
            { sitecode, projectname, ititle, itype, idate, itime, assignee, projectcomplexity, location },
            { new: true }
        );

        // Check if the assignee has changed from Morgan to someone else
        if (existingInspection.assignee === 'Morgan' && assignee !== 'Morgan') {
            // Delete the old notification
            await Notification.deleteOne({ message: `New inspection created: ${existingInspection.ititle}`, assignee: 'Morgan' });
        }

        // If the assignee is Morgan, check for existing notification
        if (assignee === 'Morgan') {
            const existingNotification = await Notification.findOne({ message: `New inspection created: ${ititle}`, assignee: 'Morgan' });
            // Only create a new notification if it doesn't already exist
            if (!existingNotification) {
                await Notification.create({ message: `New inspection created: ${ititle}`, assignee: 'Morgan' });
            }
        }

        res.json(updatedInspection);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error updating inspection', error: error.message });
    }
});

app.get('/getHighlightedDays', async (req, res) => {
    try {
      // Fetch all inspections and extract their dates
      const inspections = await imodel.find({}, 'idate');
      const highlightedDays = inspections.map((inspection) => inspection.idate);
      res.json({ days: highlightedDays });
    } catch (error) {
      console.error('Error fetching highlighted days:', error);
      res.status(500).json({ message: 'Error fetching highlighted days' });
    }
  });
  

// Delete inspection and associated notification
app.delete('/createinspection/:id', async (req, res) => {
    try {
      const id = req.params.id;
  
      // Find the inspection to be deleted
      const deletedInspection = await imodel.findByIdAndDelete(id);
      if (!deletedInspection) {
        return res.status(404).json({ message: "Inspection NOT FOUND!" });
      }
  
      // Delete the associated notification if the assignee is Morgan
      if (deletedInspection.assignee === 'Morgan') {
        await Notification.deleteOne({ message: `New inspection created: ${deletedInspection.ititle}`, assignee: 'Morgan' });
      }
  
      res.status(204).end();
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Error deleting inspection', error: error.message });
    }
  });

// Get notifications for Morgan along with inspection details
app.get('/notifications', async (req, res) => {
    try {
      // Fetch notifications for Morgan
      const notifications = await Notification.find({ assignee: 'Morgan' });
  
      // Fetch the corresponding inspection details
      const inspections = await imodel.find({ assignee: 'Morgan' });
  
      // Map notifications to include inspection details
      const notificationsWithDetails = notifications.map(notification => {
        const inspectionDetail = inspections.find(inspection => inspection.ititle === notification.message.split(': ')[1]);
        return {
          ...notification.toObject(), // Convert mongoose document to plain JavaScript object
          inspectionDetails: inspectionDetail || null // Include inspection details if available
        };
      });
  
      res.json(notificationsWithDetails);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Error fetching notifications', error: error.message });
    }
  });


  app.get('/generateReport', async (req, res) => {
    try {
        console.log('Starting report generation...');

        const inspections = await imodel.find(); // Fetch all inspections
        console.log(`Fetched ${inspections.length} inspections`);

        // Define the reports directory
        const reportsDir = path.join(__dirname, 'reports');

        // Ensure the directory exists, if not, create it
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir);
            console.log('Created reports directory');
        }

        // Create a unique file name for the PDF
        const filePath = path.join(reportsDir, `inspection-report-${Date.now()}.pdf`);
        console.log('Saving PDF at:', filePath);

        // Create a PDF document
        const doc = new PDFDocument({
            size: 'A4', // Page size
            margin: 50, // Margins for the page
        });
        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream); // Pipe the document to a writable stream

        // Set a professional blue background
        doc.rect(0, 0, doc.page.width, doc.page.height).fill('#3b5998'); // Set background color

        // Add the title
        doc
            .fontSize(20)
            .fillColor('white')
            .text('Inspection Report', { align: 'center' })
            .moveDown(0.5);

        // Add the date underneath the title
        const currentDate = new Date().toLocaleDateString();
        doc
            .fontSize(12)
            .fillColor('white')
            .text(`Generated on: ${currentDate}`, { align: 'center' })
            .moveDown(2); // Space after the date

        // Add the logo below the date, with extra spacing
        const logoPath = path.join(__dirname, 'logofill.jpeg');
        if (fs.existsSync(logoPath)) {
            const imageWidth = 100; // Image width
            const pageWidth = doc.page.width; // Get the document width
            const centerX = (pageWidth - imageWidth) / 2; // Calculate the center position
        
            doc.image(logoPath, centerX, doc.y, {
                width: imageWidth, // Scale the logo
                align: 'center',
                valign: 'center',
            });
            doc.moveDown(10); // Extra space after the logo
        }
        

        // Add the summary text
        doc
            .fontSize(14)
            .fillColor('white')
            .text(
                `This report contains ${inspections.length} inspections conducted up to ${currentDate}. The inspections focused on ensuring compliance with project safety standards, construction quality, and adherence to the project timeline.`,
                { align: 'center' }
            )
            .moveDown(2); // Ensure there's enough space between the summary and the table

            // Add table header for the inspection list
            doc
            .fontSize(12)
            .fillColor('#ffffff')
            .text('Inspection Details', { underline: true, align: 'center' })
            .moveDown(1);

            // Define the table columns with actual field names
            const tableColumns = [
            { label: 'Site Code', field: 'sitecode', width: 90 },
            { label: 'Title', field: 'ititle', width: 200 },
            { label: 'Date', field: 'idate', width: 70 },
            { label: 'Time', field: 'itime', width: 70 },
            { label: 'Assignee', field: 'assignee', width: 90 },
            ];

            // Set the initial position for the table
            let y = doc.y;
            let x = 50; // Starting position for the table columns

            // Draw table headers with background color
            doc.rect(x - 5, y - 10, tableColumns.reduce((acc, col) => acc + col.width, 0), 20).fill('#0056b3'); // Draw a rectangle for the header with blue background

            tableColumns.forEach((column) => {
            doc
                .fillColor('#ffffff') // White text for the header
                .text(column.label, x, y, { width: column.width, align: 'left' });
            x += column.width; // Move x position to next column
            });

            y += 20; // Move y position to start table rows

            // Draw table rows with inspection details and borders
            inspections.forEach((inspection) => {
            x = 50; // Reset x position for each row

            // Draw a rectangle for each row to create row borders
            doc.rect(x - 5, y - 10, tableColumns.reduce((acc, col) => acc + col.width, 0), 20).stroke();

            // Fill row data
            tableColumns.forEach((column) => {
                const text = inspection[column.field] || '-'; // Use the correct field name from the inspection object
                doc
                .fillColor('#ffffff') // Ensure white text
                .text(text, x, y, { width: column.width, align: 'left' });
                x += column.width; // Move x position to next column
            });

            y += 20; // Move y position to next row
            });



        // Finalize the PDF
        doc.end();
        console.log('PDF document finalized');

        // Listen for the 'finish' event to send the file
        writeStream.on('finish', () => {
            console.log('PDF generated:', filePath);
            res.download(filePath, (err) => {
                if (err) {
                    console.error('Error downloading file:', err);
                    res.status(500).send('Error downloading the file');
                } else {
                    console.log('File downloaded successfully');
                }
                fs.unlinkSync(filePath); // Optionally delete the file after sending it
            });
        });

        // Handle error events during file writing
        writeStream.on('error', (err) => {
            console.error('Error writing PDF:', err);
            res.status(500).send('Error generating PDF');
        });
    } catch (error) {
        console.log('Error generating report:', error);
        res.status(500).json({ message: 'Error generating report', error: error.message });
    }
});



app.post('/generateReport', async (req, res) => {
  try {
    const filteredInspections = req.body; // Get filtered inspections from the request body

    if (!filteredInspections.length) {
      return res.status(400).json({ message: 'No inspections to generate report.' });
    }

    // Define the reports directory
    const reportsDir = path.join(__dirname, 'reports');

    // Ensure the directory exists, if not, create it
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir);
    }

    // Create a unique file name for the PDF
    const filePath = path.join(reportsDir, `inspection-report-${Date.now()}.pdf`);

    // Create a PDF document
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // Add a background color for the entire page
    doc.rect(0, 0, doc.page.width, doc.page.height) // Full page rectangle
       .fill('#e6f2ff'); // Light blue background color

    // Add the title
    doc
      .fontSize(28)
      .fillColor('#003366') // Navy Blue Color for the title
      .text('Filtered Inspection Report', { align: 'center' })
      .moveDown(0.5);

    // Add the date underneath the title
    doc
      .fontSize(14)
      .fillColor('#666666') // Gray color for the date
      .text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' })
      .moveDown(1);

    // Add a separator line after the title
    doc
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .strokeColor('#003366')
      .lineWidth(2)
      .stroke()
      .moveDown(1);

    // Styling for cards
    filteredInspections.forEach((inspection, index) => {
      const yOffset = doc.y; // Get the current position for the card

      // Draw a rounded rectangle for the card background
      doc
        .roundedRect(50, yOffset, 500, 160, 10) // Rounded corners
        .fillAndStroke('#ffffff', '#003366') // White background with navy blue border
        .lineWidth(1); // Border width

      // Add a title for the inspection inside the card
      doc
        .fontSize(16)
        .fillColor('#003366') // Navy blue for the title
        .text(`Title: ${inspection.ititle}`, 70, yOffset + 20, { width: 450, align: 'left' }) // Inside the card

      // Add inspection details with different styles for the content
      doc
        .fontSize(12)
        .fillColor('#666666') // Gray for the label
        .text(`Date:`, 70, yOffset + 50, { continued: true })
        .fillColor('#003366') // Navy blue for the value
        .text(`${inspection.idate}`)
        .fillColor('#666666')
        .text(`Time:`, 70, yOffset + 70, { continued: true })
        .fillColor('#003366')
        .text(`${inspection.itime}`)
        .fillColor('#666666')
        .text(`Assignee:`, 70, yOffset + 90, { continued: true })
        .fillColor('#003366')
        .text(`${inspection.assignee}`)
        .fillColor('#666666')
        .text(`Site Code:`, 70, yOffset + 110, { continued: true })
        .fillColor('#003366')
        .text(`${inspection.sitecode}`)
        .fillColor('#666666')
        .text(`Location:`, 70, yOffset + 130, { continued: true })
        .fillColor('#003366')
        .text(`${inspection.location}`);

      // Add a subtle shadow effect by adding a rectangle below each card
      doc
        .rect(55, yOffset + 165, 490, 2) // Slightly offset to give a shadow effect
        .fillColor('#d3d3d3') // Light gray color for the shadow effect
        .fill();

      doc.moveDown(2); // Add space between cards
    });

    // Finalize and send the PDF
    doc.end();
    writeStream.on('finish', () => {
      res.download(filePath, (err) => {
        if (err) {
          console.error('Error downloading file:', err);
          res.status(500).send('Error downloading the file');
        }
        fs.unlinkSync(filePath); // Optionally delete the file after sending it
      });
    });
  } catch (error) {
    console.log('Error generating report:', error);
    res.status(500).json({ message: 'Error generating report', error: error.message });
  }
});


// Export the app
module.exports = app;
