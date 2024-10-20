require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function getAllUsuarios() {
    const result = await pool.query('SELECT * FROM users');
    return result.rows;
}

async function getUsuarioById(id) {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
}

async function updateUsuario(id, nome, telefone, rua, numero, bairro, cidade, estado, latitude, longitude, cpf) {
    const result = await pool.query(
        'UPDATE users SET nome = $1, telefone = $2, rua = $3, numero = $4, bairro = $5, cidade = $6, estado = $7, latitude = $8, longitude = $9, cpf = $10 WHERE id = $11 RETURNING *',
        [nome, telefone, rua, numero, bairro, cidade, estado, latitude, longitude, cpf, id]
    );
    return result.rows[0];
}

async function deleteUsuario(id) {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
}

async function registrarUsuario(nome, telefone, cep, numero, bairro, rua, cpf) {
    const cepData = await pegarCep(cep);
    const { localidade: cidade, uf: estado } = cepData;

    const result = await pool.query(
        'INSERT INTO users (nome, telefone, rua, numero, bairro, cidade, estado, cpf, cep) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
        [nome, telefone, rua, numero, bairro, cidade, estado, cpf, cep]
    );
    return result.rows[0];
}

async function pegarCep(cep) {
    const axios = require('axios');
    const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
    return response.data;
}

module.exports = {
    getAllUsuarios,
    getUsuarioById,
    updateUsuario,
    deleteUsuario,
    registrarUsuario,
    pegarCep
};
