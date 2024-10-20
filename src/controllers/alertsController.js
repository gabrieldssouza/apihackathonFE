const { emitToUser } = require('../websocket');
const { getSharedVariable } = require('../../bin/config');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const sendAlertToConnectedUsers = (users, alert) => {
    const connectedUsers = getSharedVariable();
    console.log('Connected users:', connectedUsers);

    users.forEach(user => {
        const socketId = connectedUsers[user.id];
        if (socketId) {
            emitToUser(user.id, 'alert', alert);
            console.log(`Alert sent to user ${user.id}`);
        } else {
            console.log(`No socket connection for user ${user.id}`);
        }
    });
};

exports.createAlert = async (req, res) => {
    const { tipo_alerta, mensagem, cidade, bairro, enviado_por } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO alerts (tipo_alerta, mensagem, cidade, bairro, enviado_por) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [tipo_alerta, mensagem, cidade, bairro, enviado_por]
        );

        console.log('Alert created:', result.rows[0]);

        const users = await getUsersToNotify(cidade, bairro);
        console.log('Users to notify:', users);

        sendAlertToConnectedUsers(users, result.rows[0]);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating alert:', err);
        res.status(500).json({ error: err.message });
    }
};

const getUsersToNotify = async (cidade, bairro) => {
    let query = 'SELECT * FROM users WHERE cidade = $1';
    const params = [cidade];

    if (bairro) {
        query += ' AND bairro = $2';
        params.push(bairro);
    }

    const usersResult = await pool.query(query, params);
    return usersResult.rows;
};

exports.getAlertById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM alerts WHERE id = $1', [id]);
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching alert:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.getAllAlerts = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM alerts');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching alerts:', error);
        res.status(500).json({ error: 'Erro ao listar alertas' });
    }
};

exports.getAlertsByAddress = async (req, res) => {
    const { cidade, bairro } = req.query;
    console.log(cidade, bairro);

    let query = 'SELECT * FROM alerts';
    const params = [];

    if (cidade) {
        query += ' WHERE cidade = $1';
        params.push(cidade);
        if (bairro) {
            query += ' AND (bairro IS NULL OR bairro = $2)';
            params.push(bairro);
        }
    }
    query += ' ORDER BY data_envio DESC;';

    try {
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching alerts by address:', error);
        res.status(500).json({ error: 'Erro ao listar alertas' });
    }
};

exports.updateAlert = async (req, res) => {
    const { id } = req.params;
    const { tipo_alerta, mensagem, cidade, bairro, enviado_por } = req.body;

    try {
        const result = await pool.query(
            'UPDATE alerts SET tipo_alerta = $1, mensagem = $2, cidade = $3, bairro = $4, enviado_por = $5 WHERE id = $6 RETURNING *',
            [tipo_alerta, mensagem, cidade, bairro, enviado_por, id]
        );
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error updating alert:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.deleteAlert = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM alerts WHERE id = $1', [id]);
        res.status(204).send();
    } catch (err) {
        console.error('Error deleting alert:', err);
        res.status(500).json({ error: err.message });
    }
};
