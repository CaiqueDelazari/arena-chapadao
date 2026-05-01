const express = require('express');
const router = express.Router();
const { getAll, getById, getAvailableSlots, create, update, remove } = require('../controllers/quadrasController');
const { authenticate, requireAdmin } = require('../middlewares/auth');

router.get('/', getAll);
router.get('/:id', getById);
router.get('/:id/slots', getAvailableSlots);
router.post('/', authenticate, requireAdmin, create);
router.put('/:id', authenticate, requireAdmin, update);
router.delete('/:id', authenticate, requireAdmin, remove);

module.exports = router;
