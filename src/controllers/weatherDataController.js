const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

exports.createWeatherData = async (req, res) => {
    const { cidade, nivel_chuva, nivel_rio } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO weather_data (cidade, nivel_chuva, nivel_rio) VALUES ($1, $2, $3) RETURNING *',
            [cidade, nivel_chuva, nivel_rio]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getWeatherDataById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM weather_data WHERE id = $1', [id]);
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateWeatherData = async (req, res) => {
    const { id } = req.params;
    const { cidade, nivel_chuva, nivel_rio } = req.body;
    try {
        const result = await pool.query(
            'UPDATE weather_data SET cidade = $1, nivel_chuva = $2, nivel_rio = $3 WHERE id = $4 RETURNING *',
            [cidade, nivel_chuva, nivel_rio, id]
        );
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteWeatherData = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM weather_data WHERE id = $1', [id]);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};