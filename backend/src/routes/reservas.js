const express = require('express');
const router = express.Router();
const { create, getAll, getById, updateStatus, cancel, getAgenda, getMyReservas, reschedule } = require('../controllers/reservasController');
const { authenticate, requireAdmin, optionalAuth } = require('../middlewares/auth');

router.post('/', optionalAuth, create);
router.get('/minhas', authenticate, getMyReservas);
router.get('/', authenticate, requireAdmin, getAll);
router.get('/agenda', authenticate, requireAdmin, getAgenda);
router.get('/:id', authenticate, getById);
router.put('/:id/status', authenticate, requireAdmin, updateStatus);
router.put('/:id/remarcar', authenticate, reschedule);
router.post('/:id/cancel', authenticate, cancel);

module.exports = router;
