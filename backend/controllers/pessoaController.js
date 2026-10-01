const db = require('../database');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const listarPessoas = async (req, res) => {
    try {
        const resultado = await db.query(
            'SELECT pessoa.*, pessoa.ehpiloto AS "ehPiloto" FROM pessoa ORDER BY id_pessoa'
        );

        res.status(200).json(resultado.rows);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: 'Erro ao buscar pessoas'
        });
    }
};

const inserirPessoa = async (req, res) => {
    try {
        const {
            id_pessoa,
            nome,
            data_nascimento,
            cidade,
            telefone,
            email,
            ehPiloto,
            numero,
            id_moto,
            id_categoria
        } = req.body;

        await db.query(
            `INSERT INTO pessoa
            (id_pessoa, nome, data_nascimento,
             cidade, telefone, email, ehPiloto,
             numero, id_moto, id_categoria)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
                id_pessoa,
                nome,
                data_nascimento,
                cidade,
                telefone,
                email,
                Boolean(ehPiloto),
                numero || null,
                id_moto || null,
                id_categoria || null
            ]
        );

        res.json({
            sucesso: true
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            sucesso: false,
            mensagem: erro.message
        });
    }
};

const buscarPessoa = async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await db.query(
            'SELECT pessoa.*, pessoa.ehpiloto AS "ehPiloto" FROM pessoa WHERE id_pessoa = $1',
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.json({
                sucesso: false
            });
        }

        res.json({
            sucesso: true,
            pessoa: resultado.rows[0]
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao buscar pessoa'
        });
    }
};

const alterarPessoa = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            id_pessoa,
            nome,
            data_nascimento,
            cidade,
            telefone,
            email,
            ehPiloto,
            numero,
            id_moto,
            id_categoria
        } = req.body;

        await db.query(
            `UPDATE pessoa
             SET id_pessoa = $1,
                 nome = $2,
                 data_nascimento = $3,
                 cidade = $4,
                 telefone = $5,
                 email = $6,
                 ehPiloto = $7,
                 numero = $8,
                 id_moto = $9,
                 id_categoria = $10
             WHERE id_pessoa = $11`,
            [
                id_pessoa,
                nome,
                data_nascimento,
                cidade,
                telefone,
                email,
                Boolean(ehPiloto),
                numero || null,
                id_moto || null,
                id_categoria || null,
                id
            ]
        );

        res.json({
            sucesso: true
        });

    } catch (erro) {
        console.error(erro);

        res.json({
            sucesso: false,
            mensagem: erro.message
        });
    }
};

const excluirPessoa = async (req, res) => {
    try {
        const { id } = req.params;

        await db.query(
            'DELETE FROM pessoa WHERE id_pessoa = $1',
            [id]
        );

        res.json({
            sucesso: true
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            sucesso: false,
            mensagem: erro.message
        });
    }
};

const uploadImagemPessoa = async (req, res) => {
    try {
        const { id } = req.params;
        if (!/^\d+$/.test(id)) {
            return res.status(400).json({ sucesso: false, mensagem: 'ID de pessoa inválido.' });
        }
        if (!req.file) {
            return res.status(400).json({ sucesso: false, mensagem: 'Nenhum arquivo enviado.' });
        }

        const pastaImagens = path.join(__dirname, '../../imagens/pessoas');
        await fs.promises.mkdir(pastaImagens, { recursive: true });

        const caminhoDestino = path.join(pastaImagens, `${id}p.jpeg`);
        await sharp(req.file.buffer)
            .resize(300, 300, { fit: 'cover' })
            .jpeg({ quality: 90 })
            .toFile(caminhoDestino);

        res.json({ sucesso: true, mensagem: 'Imagem salva com sucesso!' });
    } catch (erro) {
        console.error('Erro ao salvar imagem da pessoa:', erro);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao processar imagem.' });
    }
};

module.exports = {
    listarPessoas,
    inserirPessoa,
    buscarPessoa,
    alterarPessoa,
    excluirPessoa,
    uploadImagemPessoa
};