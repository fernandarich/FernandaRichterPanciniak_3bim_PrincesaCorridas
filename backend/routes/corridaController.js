const express = require('express');
const router = express.Router();
const multer = require('multer');

const corridaController = require('../controllers/corridaController');
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload/:id', upload.single('imagem'), corridaController.uploadImagemCorrida);
router.get('/', corridaController.listarCorrida);
router.get('/:id', corridaController.buscarCorrida);
router.post('/', corridaController.inserirCorrida);
router.put('/:id', corridaController.alterarCorrida);
router.delete('/:id', corridaController.excluirCorrida);

module.exports = router;