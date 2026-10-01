const db = require('../database');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const listarMoto = async (req, res) => {
    try {
        const resultado = await db.query(
            'SELECT * FROM MOTO ORDER BY id_moto'
        );

        res.status(200).json(resultado.rows);

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            erro: 'Erro ao buscar motos'
        });
    }
};

const inserirMoto = async (req, res) => {
    try {
        const {
            id_moto,
            marca,
            modelo,
            ano,
            escapamento,
            suspensao,
            motor
        } = req.body;

        await db.query(
            `INSERT INTO MOTO
             (id_moto, marca, modelo, ano)
             VALUES ($1, $2, $3, $4)`,
            [id_moto, marca, modelo, ano]
        );

        if (escapamento || suspensao || motor) {
            await db.query(
                `INSERT INTO FICHA
                 (id_moto, escapamento, suspensao, motor)
                 VALUES ($1, $2, $3, $4)`,
                [id_moto, escapamento, suspensao, motor]
            );
        }

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


const buscarMoto = async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await db.query(
            `SELECT
        m.*,
        f.escapamento,
        f.suspensao,
        f.motor
     FROM MOTO m
     LEFT JOIN FICHA f
        ON m.id_moto = f.id_moto
     WHERE m.id_moto = $1`,
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.json({
                sucesso: false
            });
        }

        res.json({
            sucesso: true,
            moto: resultado.rows[0]
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao buscar moto'
        });
    }
};

const alterarMoto = async (req, res) => {
    try {
        const { id } = req.params;
        const { id_moto, marca, modelo, ano, escapamento, suspensao, motor } = req.body;

        await db.query(
            `UPDATE MOTO
             SET id_moto = $1,
                 marca = $2,
                 modelo = $3,
                 ano = $4
             WHERE id_moto = $5`,
            [id_moto, marca, modelo, ano, id]
        );

        const fichaAtiva = [escapamento, suspensao, motor].some(
            valor => typeof valor === 'string' && valor.trim() !== ''
        );

        if (fichaAtiva) {
            const valoresFicha = [escapamento || null, suspensao || null, motor || null];
            let fichaAtualizada = await db.query(
                `UPDATE FICHA
                 SET escapamento = $2, suspensao = $3, motor = $4
                 WHERE id_moto = $1`,
                [id_moto, ...valoresFicha]
            );

            if (fichaAtualizada.rowCount === 0 && String(id_moto) !== String(id)) {
                fichaAtualizada = await db.query(
                    `UPDATE FICHA
                     SET id_moto = $2, escapamento = $3, suspensao = $4, motor = $5
                     WHERE id_moto = $1`,
                    [id, id_moto, ...valoresFicha]
                );
            }

            if (fichaAtualizada.rowCount === 0) {
                await db.query(
                    `INSERT INTO FICHA (id_moto, escapamento, suspensao, motor)
                     VALUES ($1, $2, $3, $4)`,
                    [id_moto, ...valoresFicha]
                );
            }
        } else {
            await db.query(
                'DELETE FROM FICHA WHERE id_moto = $1 OR id_moto = $2',
                [id, id_moto]
            );
        }

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

const excluirMoto = async (req, res) => {
    try {
        const { id } = req.params;

        await db.query(
            'DELETE FROM MOTO WHERE id_moto = $1',
            [id]
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

const uploadImagem = async (req, res) => {
    try {
        const id = req.params.id;
        if (!req.file) {
            return res.status(400).json({ sucesso: false, mensagem: 'Nenhum arquivo enviado.' });
        }

        const pastaImagens = path.join(__dirname, '../../imagens');
        if (!fs.existsSync(pastaImagens)) {
            fs.mkdirSync(pastaImagens, { recursive: true });
        }

        const caminhoDestino = path.join(pastaImagens, `${id}.png`);

        // Processa e converte para PNG no tamanho ideal
        await sharp(req.file.buffer)
            .resize(300, 300, { fit: 'cover' })
            .toFormat('png')
            .toFile(caminhoDestino);

        res.json({ sucesso: true, mensagem: 'Imagem salva com sucesso!' });
    } catch (error) {
        console.error('Erro ao salvar imagem:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao processar imagem.' });
    }
};

module.exports = {
    listarMoto,
    inserirMoto,
    buscarMoto,
    alterarMoto,
    excluirMoto,
    uploadImagem
};