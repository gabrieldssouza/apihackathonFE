const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

exports.createAlert = async (req, res) => {
    const { tipo_alerta, mensagem, cidade, bairro, enviado_por } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO alerts (tipo_alerta, mensagem, cidade, bairro, enviado_por) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [tipo_alerta, mensagem, cidade, bairro, enviado_por]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAlertById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM alerts WHERE id = $1', [id]);
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllAlerts = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM alerts');
        res.json(result.rows);
    } catch (error) {
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
        res.status(500).json({ error: err.message });
    }
};

exports.deleteAlert = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM alerts WHERE id = $1', [id]);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};