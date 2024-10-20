const express = require('express');
const app = express();
const cors = require('cors');
const { neon } = require('@neondatabase/serverless');
const usuarioController = require('./controllers/usuarioController');
const civilDefenseController = require('./controllers/civilDefenseController');
const sosRequestsController = require('./controllers/sosRequestsController');
const weatherDataController = require('./controllers/weatherDataController');
const alertsController = require('./controllers/alertsController');
const schedule = require('node-schedule');
const clima = require('./autoruns/clima');
const message = require('./autoruns/nivel');

require('dotenv').config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


schedule.scheduleJob('0 6,18 * * *', () => {
    clima.verificarClima();
});

app.get('/', async (_, res) => {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const response = await sql`SELECT version()`;
    const { version } = response[0];
    res.json({ version });
});

app.post('/pegarcep', async (req, res) => {
    const usuarioController = require('./controllers/usuarioController');
    await usuarioController.pegarCep(req, res);
});

// Rotas para usuários
app.post('/usuarios', usuarioController.registrar);
app.get('/usuarios', usuarioController.getAllUsuarios);
app.get('/usuarios/:id', usuarioController.getUsuarioById);
app.put('/usuarios/:id', usuarioController.updateUsuario);
app.delete('/usuarios/:id', usuarioController.deleteUsuario);

// Rotas para civil defense
app.post('/civil_defense', civilDefenseController.createCivilDefense);
app.get('/civil_defense', civilDefenseController.getAllCivilDefense);
app.get('/civil_defense/:id', civilDefenseController.getCivilDefenseById);
app.put('/civil_defense/:id', civilDefenseController.updateCivilDefense);
app.delete('/civil_defense/:id', civilDefenseController.deleteCivilDefense);

// Rotas para SOS requests
app.post('/sos_requests', sosRequestsController.createSosRequest);
app.get('/sos_requests', sosRequestsController.getAllSosRequests);
app.get('/sos_requests/user/:id', sosRequestsController.getSosRequestById);
app.get('/sos_requests/user/:userId', sosRequestsController.getSosRequestsByUserId); // New route for user-specific SOS requests
app.get('/sos_requests/recent', sosRequestsController.getRecentSosRequests); // New route for recent SOS requests
app.put('/sos_requests/:id', sosRequestsController.updateSosRequest);
app.delete('/sos_requests/:id', sosRequestsController.deleteSosRequest);

// Rotas para weather data
app.post('/weather_data', weatherDataController.createWeatherData);
app.get('/weather_data/:id', weatherDataController.getWeatherDataById);
app.put('/weather_data/:id', weatherDataController.updateWeatherData);
app.delete('/weather_data/:id', weatherDataController.deleteWeatherData);

// Rotas para alerts
app.post('/alerts', alertsController.createAlert);
app.get('/alerts', alertsController.getAllAlerts);
app.get('/alerts/address', alertsController.getAlertsByAddress);
app.get('/alerts/:id', alertsController.getAlertById);
app.put('/alerts/:id', alertsController.updateAlert);
app.delete('/alerts/:id', alertsController.deleteAlert);

module.exports = app;

const TelegramBot = require('node-telegram-bot-api');
const token = '7496633391:AAHeXypmvpk5LtwOe5rPUGztr7P-deBt4iI';
const bot = new TelegramBot(token, { polling: true });
console.log("Telegram bot is up and running.");

bot.on('message', (msg) => {
    const result = message.interpretMessage(msg);
});

