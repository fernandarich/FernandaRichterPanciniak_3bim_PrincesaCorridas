const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const pool = require('./database');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/imagens', express.static(path.join(__dirname, '../imagens')));

const categoriaRoutes = require('./routes/categoriaRoutes');
const corridaRoutes = require('./routes/corridaController');
const motoRoutes = require('./routes/motoRoutes');
const pessoaRoutes = require('./routes/pessoaRoutes');

app.use('/categorias', categoriaRoutes);
app.use('/corridas', corridaRoutes);
app.use('/motos', motoRoutes);
app.use('/pessoas', pessoaRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, async () => {
    console.log(`\n=================================`);
    console.log(`🚀 Servidor executando na porta ${PORT}`);
    
    try {
        await pool.query(`
            ALTER TABLE pessoa
            ADD COLUMN IF NOT EXISTS ehpiloto BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS numero INTEGER,
            ADD COLUMN IF NOT EXISTS id_moto INTEGER,
            ADD COLUMN IF NOT EXISTS id_categoria INTEGER
        `);

        await pool.query(`
            ALTER TABLE piloto DROP CONSTRAINT IF EXISTS piloto_id_pessoa_fkey;
            ALTER TABLE piloto
            ADD CONSTRAINT piloto_id_pessoa_fkey
            FOREIGN KEY (id_pessoa) REFERENCES pessoa(id_pessoa)
            ON DELETE CASCADE ON UPDATE CASCADE
        `);

        await pool.query('SELECT 1');
        console.log(`✅ Banco de Dados  ${process.env.DB_DATABASE} conectado com sucesso!`);
    } catch (error) {
        console.error(`❌ FALHA NA CONEXÃO COM O BANCO DE DADOS:`);
        console.error(`   Motivo: ${error.message}`);
        console.error(`👉 Ajuste o arquivo .env com a senha correta do seu PostgreSQL.`);
    }
    console.log(`=================================\n`);
});