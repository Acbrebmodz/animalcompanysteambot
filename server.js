const SteamUser = require('steam-user');
const axios = require('axios');
const express = require('express');

const app = express();
app.use(express.json());

const client = new SteamUser();

const STEAM_USERNAME = 'simon-lee78';
const STEAM_PASSWORD = 'Harley2014!';
const ANIMAL_COMPANY_APP_ID = 4551040;

let latestAccessToken = null;
let latestRefreshToken = null;

client.logOn({
    accountName: STEAM_USERNAME,
    password: STEAM_PASSWORD
});

client.on('loggedOn', () => {
    console.log('✅ Logged into Steam successfully!');
    client.setPersona(SteamUser.EPersonaState.Online);
    fetchAnimalCompanyToken();
});

client.on('steamGuard', (domain, callback) => {
    console.log('⚠️ Steam Guard Code Required!');
    // Render logs will display this when 2FA is needed
});

function fetchAnimalCompanyToken() {
    console.log('Fetching Steam App Ticket...');
    client.getEncryptedAppTicket(ANIMAL_COMPANY_APP_ID, Buffer.from(''), async (err, ticket) => {
        if (err) {
            console.error('❌ Failed to get Steam ticket:', err);
            return;
        }

        const ticketHex = ticket.toString('hex');

        try {
            const response = await axios.post('https://api.animalcompanygame.com/v1/auth', {
                steamTicket: ticketHex
            }, {
                headers: { 'User-Agent': 'SteamVR 1.89.1' }
            });

            if (response.data && response.data.token) {
                latestAccessToken = response.data.token;
                latestRefreshToken = response.data.refresh_token || latestRefreshToken;
                console.log('✅ Genuine token received!');
            }
        } catch (authError) {
            console.error('❌ Auth exchange failed:', authError.response ? authError.response.data : authError.message);
        }
    });
}

setInterval(fetchAnimalCompanyToken, 45 * 60 * 1000);

app.post('/get-token', (req, res) => {
    if (!latestAccessToken) {
        return res.status(503).json({ error: 'Token not ready yet.' });
    }
    
    res.json({
        token: latestAccessToken,
        refresh_token: latestRefreshToken
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
