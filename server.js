const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = "https://reportes.agd-online.com/api/v1";
const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;
app.use(express.json());
async function authenticate() {
    try {
        const authUrl = `${BASE_URL}/account/authenticate`;
        const payload = { 
            username: USERNAME, 
            password: PASSWORD 
        };
        const response = await axios.post(authUrl, payload, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        return response.data.access_token;
    } catch (error) {
        console.error('Authentication Error:', error.response ? error.response.data : error.message);
        throw error;
    }
}
app.get('/tel', async (req, res) => {
    try {
        const phone = req.query.ph;
        if (!phone) {
            return res.status(400).json({ error: 'Phone number is required' });
        }
        const token = await authenticate();
        const searchUrl = `${BASE_URL}/telefono/?tel=${phone}&page=1&per_page=20&web_request=true`;
        const searchResponse = await axios.get(searchUrl, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });
        res.json(searchResponse.data);
    } catch (error) {
        console.error('Search Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ 
            error: 'Failed to perform phone search', 
            details: error.response ? error.response.data : error.message 
        });
    }
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
module.exports = app;
