const express = require('express');
const router = express.Router();
const controles = require('./controles');

// Rota de estoque
router.post('/inserirEstoque', controles.AtualizarEstoque);
router.get('/buscarEstoque', controles.buscarEstoque);
router.post('/atualizarProduto', controles.atualizarProduto);

// Rota de caixa
router.post('/abrirCaixa', controles.abrirCaixaController);
router.post('/fecharCaixa', controles.fecharCaixaController);
router.get('/caixa-aberto', controles.verificarCaixaAbertoController);


// Rota de produto e venda
router.get('/buscaProduto', controles.buscarProduto);
router.post('/confirmarVenda', controles.confirmarVenda)

// Rotas de usuario
router.post('/login', controles.login);
router.post('/newUser', controles.insertUser);

// Rotas de relatorio
/*router.get('/relatorioPorData', controles.relatorioVendasData);
router.get('/relatorioPorCaixa', controles.relatorioVendasCaixa);*/
router.get('/relatorioTotal', controles.exibirResultados);
router.get('/porData', controles.calcularRelatorioPorIntervaloDeDatas);

module.exports = router;
