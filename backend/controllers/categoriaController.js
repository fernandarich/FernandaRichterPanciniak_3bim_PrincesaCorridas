const db = require('../database');

const listarCategorias = async (req, res) => {
    try {
        const resultado = await db.query(
            'SELECT * FROM categoria ORDER BY id_categoria'
        );

        res.status(200).json(resultado.rows);

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            erro: 'Erro ao buscar categorias'
        });
    }
};

const inserirCategoria = async (req, res) => {
    try {
        const { id_categoria, nome_categoria, descricao } = req.body;

        await db.query(
            `INSERT INTO categoria (id_categoria, nome_categoria, descricao)
             VALUES ($1, $2, $3)`,
            [id_categoria, nome_categoria, descricao]
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


const buscarCategoria = async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await db.query(
            'SELECT * FROM categoria WHERE id_categoria = $1',
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.json({
                sucesso: false
            });
        }

        res.json({
            sucesso: true,
            categoria: resultado.rows[0]
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao buscar categoria'
        });
    }
};

const alterarCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const { id_categoria, nome_categoria, descricao } = req.body;

        await db.query(
            `UPDATE categoria
             SET id_categoria = $1,
                 nome_categoria = $2,
                 descricao = $3
             WHERE id_categoria = $4`,
            [id_categoria, nome_categoria, descricao, id]
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

const excluirCategoria = async (req, res) => {
    try {
        const { id } = req.params;

        await db.query(
            'DELETE FROM categoria WHERE id_categoria = $1',
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

module.exports = {
    listarCategorias,
    inserirCategoria,
    buscarCategoria,
    alterarCategoria,
    excluirCategoria
};