const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/quadras', require('./quadras'));
router.use('/reservas', require('./reservas'));
router.use('/pagamentos', require('./pagamentos'));
router.use('/admin', require('./admin'));

module.exports = router;
