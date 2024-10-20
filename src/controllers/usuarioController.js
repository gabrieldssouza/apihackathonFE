const usuarioModel = require('../models/usuarioModel');
const axios = require('axios');

exports.registrar = async (req, res) => {
    try {
        const { nome, telefone, cep, numero, cpf, bairro, cidade, rua } = req.body;

        const result = await usuarioModel.registrarUsuario(nome, telefone, cep, numero, bairro, rua, cpf);
        res.status(200).send(result);
    } catch (err) {
        res.status(500).send('Erro ao registrar usuário');
        console.log(err);
    }
}

exports.getUsuarioById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await usuarioModel.getUsuarioById(id);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllUsuarios = async (req, res) => {
    try {
        const usuarios = await usuarioModel.getAllUsuarios();
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar usuários' });
    }
};

exports.updateUsuario = async (req, res) => {
    const { id } = req.params;
    const { nome, telefone, rua, numero, bairro, cidade, estado, latitude, longitude, cpf } = req.body;
    try {
        const result = await usuarioModel.updateUsuario(id, nome, telefone, rua, numero, bairro, cidade, estado, latitude, longitude, cpf);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteUsuario = async (req, res) => {
    const { id } = req.params;
    try {
        await usuarioModel.deleteUsuario(id);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.pegarCep = async (req, res) => {
    try {
        const { cep } = req.body;
        const result = await usuarioModel.pegarCep(cep);
        const ibgeCode = result.ibge;

        const response = await axios.get(`https://api.brasilaberto.com/v1/districts-by-ibge-code/${ibgeCode}`, {
            headers: {
                'Authorization': 'Bearer qJTa3NwX96fkGKOKu2ucMl786ll5MdegYvLV4tlf88kcGyi9S9Iaq3OyGhVU0K5k'
            }
        });

        res.status(200).send({
            ibge: ibgeCode,
            bairros: response.data
        });
    } catch (err) {
        res.status(500).send('Erro ao buscar CEP');
        console.log(err);
    }
};
