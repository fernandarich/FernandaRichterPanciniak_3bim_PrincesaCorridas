const express = require('express');
const router = express.Router();
const multer = require('multer');

const pessoaController = require('../controllers/pessoaController');
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload/:id', upload.single('imagem'), pessoaController.uploadImagemPessoa);
router.get('/', pessoaController.listarPessoas);
router.get('/:id', pessoaController.buscarPessoa);
router.post('/', pessoaController.inserirPessoa);
router.put('/:id', pessoaController.alterarPessoa);
router.delete('/:id', pessoaController.excluirPessoa);

module.exports = router;