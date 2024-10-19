const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

exports.createCivilDefense = async (req, res) => {
    const { nome, telefone, email, senha } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO civil_defense (nome, telefone, email, senha) VALUES ($1, $2, $3, $4) RETURNING *',
            [nome, telefone, email, senha]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllCivilDefense = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM civil_defense');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar civil defense' });
    }
};

exports.getCivilDefenseById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM civil_defense WHERE id = $1', [id]);
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateCivilDefense = async (req, res) => {
    const { id } = req.params;
    const { nome, telefone, email, senha, status } = req.body;
    try {
        const result = await pool.query(
            'UPDATE civil_defense SET nome = $1, telefone = $2, email = $3, senha = $4, status = $5 WHERE id = $6 RETURNING *',
            [nome, telefone, email, senha, status, id]
        );
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteCivilDefense = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM civil_defense WHERE id = $1', [id]);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};