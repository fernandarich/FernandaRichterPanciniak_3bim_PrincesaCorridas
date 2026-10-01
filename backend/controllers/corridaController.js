const db = require('../database');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const listarCorrida = async (req, res) => {
    try {
        const resultado = await db.query(
            'SELECT * FROM corrida ORDER BY id_corrida'
        );
        res.status(200).json(resultado.rows);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao buscar corridas.' });
    }
};

const inserirCorrida = async (req, res) => {
    try {
        const { id_corrida, nome, cidade, data_corrida, id_categoria } = req.body;
        await db.query(
            `INSERT INTO corrida
             (id_corrida, nome, cidade, data_corrida, id_categoria)
             VALUES ($1, $2, $3, $4, $5)`,
            [id_corrida, nome, cidade, data_corrida || null, id_categoria || null]
        );
        res.json({ sucesso: true });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ sucesso: false, mensagem: erro.message });
    }
};

const buscarCorrida = async (req, res) => {
    try {
        const resultado = await db.query(
            'SELECT * FROM corrida WHERE id_corrida = $1',
            [req.params.id]
        );
        if (resultado.rows.length === 0) {
            return res.json({ sucesso: false });
        }
        res.json({ sucesso: true, corrida: resultado.rows[0] });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar corrida.' });
    }
};

const alterarCorrida = async (req, res) => {
    try {
        const { id_corrida, nome, cidade, data_corrida, id_categoria } = req.body;
        await db.query(
            `UPDATE corrida
             SET nome = $1,
                 cidade = $2,
                 data_corrida = $3,
                 id_categoria = $4
             WHERE id_corrida = $5`,
            [nome, cidade, data_corrida || null, id_categoria || null, req.params.id]
        );
        res.json({ sucesso: true });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ sucesso: false, mensagem: erro.message });
    }
};

const excluirCorrida = async (req, res) => {
    try {
        await db.query('DELETE FROM corrida WHERE id_corrida = $1', [req.params.id]);
        res.json({ sucesso: true });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ sucesso: false, mensagem: erro.message });
    }
};

const uploadImagemCorrida = async (req, res) => {
    try {
        const { id } = req.params;
        if (!/^\d+$/.test(id)) {
            return res.status(400).json({ sucesso: false, mensagem: 'ID da corrida inválido.' });
        }
        if (!req.file) {
            return res.status(400).json({ sucesso: false, mensagem: 'Nenhum arquivo enviado.' });
        }

        const pastaImagens = path.join(__dirname, '../../imagens/corridas');
        fs.mkdirSync(pastaImagens, { recursive: true });
        const caminhoDestino = path.join(pastaImagens, `${id}c.jpeg`);

        await sharp(req.file.buffer)
            .resize(600, 400, { fit: 'cover' })
            .jpeg({ quality: 90 })
            .toFile(caminhoDestino);

        res.json({ sucesso: true, mensagem: 'Imagem da corrida salva com sucesso.' });
    } catch (erro) {
        console.error('Erro ao salvar imagem da corrida:', erro);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao processar imagem.' });
    }
};

module.exports = {
    listarCorrida,
    inserirCorrida,
    buscarCorrida,
    alterarCorrida,
    excluirCorrida,
    uploadImagemCorrida
};