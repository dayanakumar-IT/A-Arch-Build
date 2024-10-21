const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt'); // Import bcrypt for password comparison

const app = express();
const PORT = 5000;

// MongoDB connection string
const uri = 'mongodb://localhost:27017/admin'; // Your existing database
const client = new MongoClient(uri);

app.use(cors());
app.use(express.json()); // Use express.json() for parsing JSON request bodies

// Login endpoint
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Login request received:', req.body); // Debug log

    try {
        await client.connect();
        const database = client.db('admin'); // Use the existing admin database
        const usersCollection = database.collection('user'); // User collection

        // Now query the user based on the username from the request
        const user = await usersCollection.findOne({ username: username });

        // Validate user credentials with bcrypt
        if (user && await bcrypt.compare(password, user.password)) { // Compare hashed password
            return res.status(200).json({ role: user.role });
        } else {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Error:', error); // Log the error for debugging
        return res.status(500).json({ message: 'Server error', error });
    } finally {
        await client.close();
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
