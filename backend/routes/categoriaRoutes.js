const express = require('express');
const router = express.Router();

const categoriaController = require('../controllers/categoriaController');

router.get('/', categoriaController.listarCategorias);
router.get('/:id', categoriaController.buscarCategoria);
router.post('/', categoriaController.inserirCategoria);
router.put('/:id', categoriaController.alterarCategoria);
router.delete('/:id', categoriaController.excluirCategoria);

module.exports = router;