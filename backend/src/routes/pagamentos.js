const express = require('express');
const router = express.Router();
const { createPix, createCard, webhook, getStatus } = require('../controllers/pagamentosController');

router.post('/pix', createPix);
router.post('/cartao', createCard);
router.post('/webhook', webhook);
router.get('/:id/status', getStatus);

module.exports = router;
