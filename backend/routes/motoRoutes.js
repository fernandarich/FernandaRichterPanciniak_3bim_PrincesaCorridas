const express = require('express');
const router = express.Router();
const multer = require('multer');
const motoController = require('../controllers/motoController');

const upload = multer({ storage: multer.memoryStorage() });

router.get('/', motoController.listarMoto);
router.get('/:id', motoController.buscarMoto);
router.post('/', motoController.inserirMoto);
router.put('/:id', motoController.alterarMoto);
router.delete('/:id', motoController.excluirMoto);

router.post('/upload/:id', upload.single('imagem'), motoController.uploadImagem);

module.exports = router;