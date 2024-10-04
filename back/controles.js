const servicos = require('./servicos');

// Controle para inserir usuário
function AtualizarEstoque(req, res) {
    console.log("AtualizarEstoque em andamento");
    const { nomeProduto, valorDe, codigoBarras, qtd } = req.body;
    let produtoId;

    // Tentar cadastrar o produto
    try {
        const result = servicos.cadastrarProduto(nomeProduto, valorDe, codigoBarras);
        produtoId = result.lastInsertRowid; // Pegar o ID do produto cadastrado
    } catch (error) {
        // Retornar erro ao cadastrar o produto
        return res.status(500).json({ error: 'Erro ao cadastrar o produto' });
    }

    // Se o produto foi cadastrado, tentar inserir no estoque
    try {
        servicos.inserirEstoque(produtoId, qtd);
        // Retornar sucesso com o ID do produto e a quantidade inserida no estoque
        res.status(201).json({ id: produtoId, quantidade: qtd });
    } catch (error) {
        // Retornar erro ao atualizar o estoque
        return res.status(500).json({ error: 'Erro ao atualizar o estoque' });
    }
}


// Controle para buscar todos os usuários
function buscarEstoque(req, res) {
    const { busca } = req.query; // Recebe o parâmetro de busca

    try {
        const resultado = servicos.buscarEstoque(busca); // Chama o serviço com o parâmetro de busca
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar estoque' });
    }
}

function abrirCaixa(req, res){

}

function login(req, res) {
    const { login, senha_hash } = req.body;

    try {
        const userId = servicos.loginUser(login, senha_hash); // Chama o serviço de login
        res.status(200).json({ id: userId }); // Retorna o ID do usuário
    } catch (error) {
        res.status(401).json({ error: error.message }); // Retorna erro 401 para credenciais inválidas
    }
}


function insertUser(req, res) {
    const { login, senha_hash } = req.body;

    try {
        const result = servicos.insertUser(login, senha_hash); // Retorna o objeto da inserção
        const newUserId = result.lastInsertRowid; // Pega o ID do novo usuário
        res.status(201).json({ id: newUserId }); // Retorna o ID no JSON de resposta
    } catch (error) {
        res.status(500).json({ error: 'Erro ao inserir usuário' });
    }
}

// Função para adicionar ao estoque via controlador
function adicionarEstoque(req, res) {
    const { id, quantidade } = req.body;
    console.log("adicionarEstoque rodando");
    console.log(id, quantidade);

    try {
        const result = servicos.adicionarAoEstoque(id, quantidade);
        res.status(200).json({ message: 'Estoque atualizado com sucesso.' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar estoque: ' + error.message });
    }
}

function buscarProduto(req, res) {
    const { codigoBarras } = req.query; // Recebe o código de barras da query string

    try {
        const produto = servicos.buscarProduto(codigoBarras);
        if (!produto) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }
        res.status(200).json(produto);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar produto: ' + error.message });
    }
}

// Controlador para abrir o caixa
function abrirCaixaController(req, res) {
    const { id_usuario, data_hora_abertura, valor_inicial } = req.body;
    console.log("Rodando abrir caixa");
    console.log(id_usuario, data_hora_abertura, valor_inicial);

    try {
        const id_caixa = servicos.abrirCaixa(id_usuario, data_hora_abertura, valor_inicial);
        res.status(201).json({ success: true, id_caixa });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao abrir o caixa', error });
    }
}

// Controlador para fechar o caixa
function fecharCaixaController(req, res) {
    const { id_caixa, valor_final } = req.body;
    console.log("Rodando fechar caixa");
    console.log(id_caixa, valor_final);

    try {
        const success = servicos.fecharCaixa(id_caixa, valor_final);
        if (success) {
            res.status(200).json({ success: true, message: 'Caixa encerrado com sucesso' });
        } else {
            res.status(400).json({ success: false, message: 'Erro ao encerrar o caixa. Verifique se o caixa está aberto.' });
        }
    } catch (error) {
        console.error("Erro ao encerrar o caixa:", error);
        res.status(500).json({ success: false, message: 'Erro ao encerrar o caixa', error });
    }
}

// Controlador para verificar se há caixa aberto
function verificarCaixaAbertoController(req, res) {
    console.log("Rodando verifcar caixa");

    try {
        const caixaAberto = servicos.verificarCaixaAberto();
        if (caixaAberto) {
            res.status(200).json({ aberto: true, caixa: caixaAberto });
        } else {
            res.status(200).json({ aberto: false });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao verificar caixa', error });
    }
}

module.exports = {
    AtualizarEstoque,
    buscarEstoque,
    abrirCaixa,
    login,
    insertUser,
    adicionarEstoque,
    buscarProduto,
    abrirCaixaController,
    fecharCaixaController,
    verificarCaixaAbertoController
};
