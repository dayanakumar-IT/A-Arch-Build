const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');



const app = express();
app.use(express.json());
app.use(cors());




// Connecting to MongoDB
const projecttaskDB = mongoose.createConnection('mongodb://localhost:27017/archbuild')

projecttaskDB.on('connected', () => {
    console.log('Task DB connected');
});

// Handle connection errors
projecttaskDB.on('error', (err) => {
    console.log('Connection error:', err);
});

// Creating schema
const taskSchema = new mongoose.Schema({
    taskname: { type: String, required: true },
    assignedto: { type: String, required: true },
    taskcategory: { type: String, required: true },
    deadline: { type: Date, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], required: true },
    progress: { type: String, required: true },
    subtasks: { type: String, required: false },
    sitecode: { type: String, required: true },
    resources: {
        humanResources: { type: [String], default: [] },
        materials: { type: [String], default: [] },
        monitoringEquipment: { type: [String], default: [] },
    }
});

const taskModel = projecttaskDB.model('Task', taskSchema);

// Route for creating a new task
app.post('/tasks', async (req, res) => {
    const { taskname, assignedto, taskcategory, deadline, priority, progress, subtasks, sitecode, resources } = req.body;

    try {
        const newTask = new taskModel({
            taskname,
            assignedto,
            taskcategory,
            deadline,
            priority: priority.toLowerCase(),
            progress,
            subtasks,
            sitecode,
            resources
        });

        await newTask.save();
        res.status(201).json({ message: "Task created successfully!", task: newTask });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to create task.", error: err.message });
    }
});

// Get all tasks
app.get('/tasks', async (req, res) => {
    try {
        const tasks = await taskModel.find();
        res.json(tasks);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
});

// Update a task
app.put("/tasks/:id", async (req, res) => {
    try {
        const { taskname, assignedto, taskcategory, deadline, priority, progress, subtasks, sitecode, resources } = req.body;
        const id = req.params.id;
        const updatedTask = await taskModel.findByIdAndUpdate(
            id,
            { taskname, assignedto, taskcategory, deadline, priority, progress, subtasks, sitecode, resources },
            { new: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ message: "Task not found" });
        }
        res.json(updatedTask);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
});

// Delete a task
app.delete('/tasks/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await taskModel.findByIdAndDelete(id);
        res.status(204).end();
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
});

// Export the app
module.exports = app;