const express = require('express');
const cors = require('cors');
const { MongoClient} = require('mongodb');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const uri = 'mongodb+srv://bodasandheepsai2543:bmMkBWSel7gBjUtS@tunemood.y4vtwla.mongodb.net/?retryWrites=true&w=majority&appName=Tunemood';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function connectToMongoDB() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
}

app.post('/add-to-playlist', async (req, res) => {
    try {
        const db = client.db('your_database_name'); 
        const result = await db.collection('playlist').insertOne(req.body);
        console.log('Song added to playlist:', result.insertedId);
        res.status(200).json({ message: 'Song added to playlist' });
    } catch (err) {
        console.error('Error adding song to playlist:', err);
        res.status(500).json({ message: 'Error adding song to playlist' });
    }
});






app.get('/get-playlist', async (req, res) => {
    try {
        const db = client.db('your_database_name'); 
        const songs = await db.collection('playlist').find({}).toArray();
        res.status(200).json(songs);
    } catch (err) {
        console.error('Error fetching playlist:', err);
        res.status(500).json({ message: 'Error fetching playlist' });
    }
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    connectToMongoDB();
});

