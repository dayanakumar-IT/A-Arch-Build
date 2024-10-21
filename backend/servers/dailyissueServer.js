const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


const app = express();

app.use(express.json());
app.use(cors());


const dailyissuesDB = mongoose.createConnection('mongodb://localhost:27017/construction')

dailyissuesDB.on('connected', () => {
    console.log('Daily Issues DB connected');
});

// Handle connection errors
dailyissuesDB.on('error', (err) => {
    console.log('Connection error:', err);
});

const issueSchema = new mongoose.Schema({
    sitecode: String,
    location: String,
    date: String,
    issuetitle: String,
    otherIssueTitle: String,
    issuedes: String,
    assignedPersonOrTeam: String,
    priorityLevel: String,
    status: String,
    impactOnSchedule: String,

});


const issueModel = dailyissuesDB.model('issue', issueSchema);


app.post('/issues', async (req, res) => {
    const { sitecode, location, date, issuetitle, otherIssueTitle, issuedes, assignedPersonOrTeam, priorityLevel, status, impactOnSchedule} = req.body;  

    try {
        const newIssue = new issueModel({ sitecode, location, date, issuetitle, otherIssueTitle, issuedes, assignedPersonOrTeam, priorityLevel, status, impactOnSchedule});  
        await newIssue.save();
        res.status(201).json(newIssue);  
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
});


app.get('/issues', async (req, res) => {
    try {
        const issues = await issueModel.find();
        res.json(issues);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
});


app.put("/issues/:id", async (req, res) => {
    try {
        const { sitecode, location, date, issuetitle, otherIssueTitle, issuedes, assignedPersonOrTeam, priorityLevel, status, impactOnSchedule } = req.body;  
        const id = req.params.id;
        const updatedIssue = await issueModel.findByIdAndUpdate(
            id,
            { sitecode, location, date, issuetitle, otherIssueTitle, issuedes, assignedPersonOrTeam, priorityLevel, status, impactOnSchedule },  
            { new: true }
        );

        if (!updatedIssue) {
            return res.status(400).json({ message: "Issue not found" });  
        }
        res.json(updatedIssue);

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
});


app.delete('/issues/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await issueModel.findByIdAndDelete(id);
        res.status(204).end();
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
});



// Export the app
module.exports = app;




