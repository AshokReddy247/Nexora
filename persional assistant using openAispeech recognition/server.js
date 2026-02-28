const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '.'))); // Serve static files from current directory

// Proxy Endpoint for OpenAI
app.post('/api/chat', async (req, res) => {
    const { message, apiKey, model } = req.body;

    if (!apiKey) {
        return res.status(400).json({ error: { message: "API Key is required." } });
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model || "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "You are a helpful, friendly, and concise personal assistant. Keep responses relatively short for voice interaction." },
                    { role: "user", content: message }
                ]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        res.json(data);

    } catch (error) {
        console.error('Proxy Error:', error);
        res.status(500).json({ error: { message: "Internal Server Error: " + error.message } });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
