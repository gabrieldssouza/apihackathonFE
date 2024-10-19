const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

exports.createSosRequest = async (req, res) => {
    const { user_id, latitude, longitude, status } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO sos_requests (user_id, latitude, longitude, status) VALUES ($1, $2, $3, $4) RETURNING *',
            [user_id, latitude, longitude, status]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllSosRequests = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM sos_requests');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar SOS requests' });
    }
};

exports.getSosRequestById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM sos_requests WHERE id = $1', [id]);
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getSosRequestsByUserId = async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await pool.query('SELECT * FROM sos_requests WHERE user_id = $1', [userId]);
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getRecentSosRequests = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT DISTINCT ON (user_id) *
            FROM sos_requests
            WHERE data_solicitacao >= NOW() - INTERVAL '1 week'
            ORDER BY user_id, data_solicitacao DESC
        `);
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateSosRequest = async (req, res) => {
    const { id } = req.params;
    const { user_id, latitude, longitude, status } = req.body;
    try {
        const result = await pool.query(
            'UPDATE sos_requests SET user_id = $1, latitude = $2, longitude = $3, status = $4 WHERE id = $5 RETURNING *',
            [user_id, latitude, longitude, status, id]
        );
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteSosRequest = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM sos_requests WHERE id = $1', [id]);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
