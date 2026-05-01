const express = require('express');
const router = express.Router();
const {
  getDashboard, getFinanceiro, getAgenda, getClientes, getConfiguracoes, updateConfiguracoes
} = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middlewares/auth');

router.use(authenticate, requireAdmin);

router.get('/dashboard', getDashboard);
router.get('/financeiro', getFinanceiro);
router.get('/agenda', getAgenda);
router.get('/clientes', getClientes);
router.get('/configuracoes', getConfiguracoes);
router.put('/configuracoes', updateConfiguracoes);

module.exports = router;
