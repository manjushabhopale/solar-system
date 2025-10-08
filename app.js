const path = require('path');
const express = require('express');
const OS = require('os');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/')));
app.use(cors());
app.use('/images', express.static(path.join(__dirname, 'images')));

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI,
    { useNewUrlParser: true, useUnifiedTopology: true }
).then(() => {
    console.log("MongoDB Connected");
}).catch(err => {
    console.error("MongoDB Connection Error: ", err);
});

// --- Schema ---
const planetSchema = new mongoose.Schema({
    name: String,
    id: Number,
    description: String,
    image: String,
    velocity: String,
    distance: String
});

const Planet = mongoose.model('planets', planetSchema);

// --- Routes ---
app.post('/planet', async (req, res) => {
    try {
        const planetData = await Planet.findOne({ id: req.body.id });
        if (!planetData) {
            return res.status(404).send({ error: "Planet not found. Use id 1-8." });
        }
        res.send(planetData);
    } catch (err) {
        res.status(500).send({ error: "Error fetching planet data", details: err.message });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/os', (req, res) => {
    res.json({ os: OS.hostname(), env: process.env.NODE_ENV });
});

app.get('/live', (req, res) => {
    res.json({ status: "live" });
});

app.get('/ready', (req, res) => {
    res.json({ status: "ready" });
});

// --- Start Server ---
if (require.main === module) {
    app.listen(3000,'0.0.0.0', () => console.log("Server running on port 3000"));
}

module.exports = app;

