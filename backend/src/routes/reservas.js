const express = require('express');
const router = express.Router();
const { create, getAll, getById, updateStatus, cancel, getAgenda } = require('../controllers/reservasController');
const { authenticate, requireAdmin, optionalAuth } = require('../middlewares/auth');

router.post('/', optionalAuth, create);
router.get('/', authenticate, requireAdmin, getAll);
router.get('/agenda', authenticate, requireAdmin, getAgenda);
router.get('/:id', getById);
router.put('/:id/status', authenticate, requireAdmin, updateStatus);
router.post('/:id/cancel', cancel);

module.exports = router;
