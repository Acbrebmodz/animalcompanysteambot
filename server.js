const express = require('express');
const SteamUser = require('steam-user');

const app = express();
const port = process.env.PORT || 10000;
const client = new SteamUser();

const logOnOptions = {};

if (process.env.STEAM_REFRESH_TOKEN) {
    logOnOptions.refreshToken = process.env.STEAM_REFRESH_TOKEN;
} else {
    logOnOptions.accountName = process.env.STEAM_USERNAME || 'simon-lee78';
    logOnOptions.password = process.env.STEAM_PASSWORD || 'Harley14';
}

client.logOn(logOnOptions);

client.on('loggedOn', () => {
    console.log('✅ Logged into Steam successfully!');
});

client.on('error', (err) => {
    console.error('Steam login error:', err.message);
});

app.get('/', (req, res) => {
    res.send('Steam Bot is running!');
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
