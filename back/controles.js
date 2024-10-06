const servicos = require('./servicos');
//const { printReceipt } = require('./Imp.js');


// Relatório de vendas por data
function relatorioVendasData(req, res) {
    const { dataInicial, dataFinal } = req.query;

    try {
        const relatorio = servicos.obterRelatorioPorData(dataInicial, dataFinal);
        res.status(200).json(relatorio);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar relatório de vendas por data' });
    }
}

// Relatório de vendas por caixa
function relatorioVendasCaixa(req, res) {
    const { idCaixa } = req.query;

    try {
        const relatorio = servicos.obterRelatorioPorCaixa(idCaixa);
        res.status(200).json(relatorio);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar relatório de vendas por caixa' });
    }
}

// Controle para inserir usuário
function AtualizarEstoque(req, res) {
    const { nomeProduto, valorDe, valor,  codigoBarras, qtd } = req.body;
    let produtoId;
    
    // Tentar cadastrar o produto
    try {
        
        const result = servicos.cadastrarProduto(nomeProduto, valorDe, valor, codigoBarras);
    
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
        //console.log("AI N ENTRA");
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
       // console.log("resultado da busca",resultado);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar estoque' });
    }
}

function abrirCaixa(req, res){
//rdwefasfw
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

function confirmarVenda(req,res){

    try{
       const {idCaixa, total, pagamentos,produto} = req.body;
       //console.log("formato do produto:", produto);
        //const Venda =  servicos.confirmarVendas(idCaixa,total);//registrat a venda
        console.log("Id do caixa", idCaixa);
        servicos.adicionarItemVenda(idCaixa,total,pagamentos,produto);
      
        console.log('entrou em confirmar vendas');
        //console.log(Venda);
        //console.log("2entrou em confirmar no Controler, produtos:", produto);
        //servicos.pagamentoVendas(Venda.lastInsertRowid, pagamentos);
        const impressora = 'POS-80C (copy 1)';
        //printReceipt(impressora, produto);
        return res.status(201).json({message:'Venda confirmada.'});

    }catch (error){
       return res.status(500).json({error: error.message});
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
    console.log("entrou na busca de produtos");
    const { codigoBarras } = req.query; // Recebe o código de barras da query string
        console.log("entrou na busca de produtos", req.query.codigoBarras);
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
async function fecharCaixaController(req, res) {
    const { id_caixa, valor_final } = req.body;
    const cAberto = servicos.verificarCaixaAberto();
    
    console.log("VALOR INICIAL DO CAIXA",cAberto.valor_inicial );
    try {
   
        const totalDinheiro = servicos.obterTotalPagamentosEmDinheiro(id_caixa);     // Obtendo o total de pagamentos em dinheiro para o caixa
        const valorTotal = parseFloat(totalDinheiro) + cAberto.valor_inicial;

        console.log("TOTAL EM DINHEIRO", valorTotal);
      
        const confirmacao = req.body.confirmacao; // Enviado do frontend , Confirmar se o usuário deseja realmente fechar o caixa

        if (!confirmacao) {
            return res.status(200).json({ confirmacaoRequerida: true, totalDinheiro, valorTotal });
        }

        if(valor_final!=valorTotal){
            console.log("VAlores discrepantes");
            const success = servicos.fecharCaixa(id_caixa, valor_final);// Fechar o caixa se houver confirmação
        }else{
            const success = servicos.fecharCaixa(id_caixa, valorTotal);// Fechar o caixa se houver confirmação
        } 
        
        if (success) {
            res.status(200).json({ success: true, message: 'Caixa encerrado com sucesso', valorTotal });
        } else {
            res.status(400).json({ success: false, message: 'Erro ao encerrar o caixa.' });
        }
    } catch (error) {
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
    relatorioVendasData,
    relatorioVendasCaixa,
    AtualizarEstoque,
    buscarEstoque,
    abrirCaixa,
    login,
    confirmarVenda,
    insertUser,
    adicionarEstoque,
    buscarProduto,
    abrirCaixaController,
    fecharCaixaController,
    verificarCaixaAbertoController
};
