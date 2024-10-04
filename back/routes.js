const express = require('express');
const router = express.Router();
const controles = require('./controles');

// Rota de estoque
router.post('/inserirEstoque', controles.AtualizarEstoque);
router.get('/buscarEstoque', controles.buscarEstoque);
router.post('/addQtd', controles.adicionarEstoque);

// Rota de caixa
router.post('/abrirCaixa', controles.abrirCaixaController);
router.post('/fecharCaixa', controles.fecharCaixaController);
router.get('/caixa-aberto', controles.verificarCaixaAbertoController);


// Rota de produto e venda
router.get('/buscaProduto', controles.buscarProduto);

// Rotas abrir caixa
router.post('/abrirCaixa', controles.abrirCaixa);

// Rotas de usuario
router.post('/login', controles.login);
router.post('/newUser', controles.insertUser);

module.exports = router;