const express = require('express');
const router = express.Router();
const {
  getDashboard, getFinanceiro, getAgenda, getClientes, getConfiguracoes, updateConfiguracoes,
  getBloqueios, createBloqueio, deleteBloqueio,
  getMensalistas, createMensalista, deleteMensalista
} = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middlewares/auth');

router.use(authenticate, requireAdmin);

router.get('/dashboard', getDashboard);
router.get('/financeiro', getFinanceiro);
router.get('/agenda', getAgenda);
router.get('/clientes', getClientes);
router.get('/configuracoes', getConfiguracoes);
router.put('/configuracoes', updateConfiguracoes);
router.get('/bloqueios', getBloqueios);
router.post('/bloqueios', createBloqueio);
router.delete('/bloqueios/:id', deleteBloqueio);
router.get('/mensalistas', getMensalistas);
router.post('/mensalistas', createMensalista);
router.delete('/mensalistas/:id', deleteMensalista);

module.exports = router;
