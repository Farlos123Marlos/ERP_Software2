const Database = require('better-sqlite3');
const db = new Database(process.env.DATABASE_FILE);

// Função para inicializar o banco de dados
function initializeDatabase() {
    // Criando a tabela de usuários
    const createUsersTable = `
        CREATE TABLE IF NOT EXISTS usuarios (
            id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
            login TEXT UNIQUE NOT NULL,
            senha_hash TEXT NOT NULL
        );
    `;
    
    // Criando a tabela de abertura de caixa
    const createCaixaTable = `
        CREATE TABLE IF NOT EXISTS abertura_caixa (
            id_caixa INTEGER PRIMARY KEY AUTOINCREMENT,
            id_usuario INTEGER NOT NULL,
            data_hora_abertura DATETIME NOT NULL,
            valor_inicial DECIMAL(10, 2) NOT NULL,
            valor_final DECIMAL(10, 2),
            status TEXT CHECK(status IN ('aberta', 'encerrada')) NOT NULL DEFAULT 'aberta',
            FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
        );
    `;
    
    // Criando a tabela de vendas
    const createVendasTable = `
        CREATE TABLE IF NOT EXISTS vendas (
            id_venda INTEGER PRIMARY KEY AUTOINCREMENT,
            id_caixa INTEGER NOT NULL,
            data_hora_venda DATETIME NOT NULL,
            valor_total DECIMAL(10, 2) NOT NULL,
            FOREIGN KEY (id_caixa) REFERENCES abertura_caixa(id_caixa)
        );
    `;
    
    // Criando a tabela de produtos
    const createProdutosTable = `
        CREATE TABLE IF NOT EXISTS produtos (
            id_produto INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT UNIQUE NOT NULL,
            valor_compra DECIMAL(10, 2) NOT NULL,
            valor DECIMAL(10, 2) NOT NULL,
            codigo_barras TEXT UNIQUE NOT NULL
        );
    `;
    
    // Criando a tabela de estoque
    const createEstoqueTable = `
        CREATE TABLE IF NOT EXISTS estoque (
            id_produto INTEGER PRIMARY KEY,
            quantidade INTEGER NOT NULL,
            FOREIGN KEY (id_produto) REFERENCES produtos(id_produto)
        );
    `;
    
    // Criando a tabela de itens da venda
    const createItensVendaTable = `
        CREATE TABLE IF NOT EXISTS itens_venda (
            id_venda INTEGER NOT NULL,
            id_produto INTEGER NOT NULL,
            quantidade INTEGER NOT NULL,
            FOREIGN KEY (id_venda) REFERENCES vendas(id_venda),
            FOREIGN KEY (id_produto) REFERENCES produtos(id_produto)
        );
    `;
    const createVendaPagamentosTable = `
    CREATE TABLE IF NOT EXISTS venda_pagamentos (
        id_pagamento INTEGER PRIMARY KEY AUTOINCREMENT,
        id_venda INTEGER NOT NULL,
        metodo_pagamento TEXT NOT NULL,
        valor DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (id_venda) REFERENCES vendas(id_venda)
        ); 
    `;

  


    // Executando as queries de criação
    db.exec(createVendaPagamentosTable);
    db.exec(createUsersTable);
    db.exec(createCaixaTable);
    db.exec(createVendasTable);
    db.exec(createProdutosTable);
    db.exec(createEstoqueTable);
    db.exec(createItensVendaTable);

    // Trigger para atualizar o estoque após venda
    const createTrigger = `
        CREATE TRIGGER IF NOT EXISTS atualizar_estoque AFTER INSERT ON itens_venda
        BEGIN
            UPDATE estoque
            SET quantidade = quantidade - NEW.quantidade
            WHERE id_produto = NEW.id_produto;
        END;
    `;
    db.exec(createTrigger);

    // Trigger para reverter o estoque ao cancelar uma venda
    const createRevertTrigger = `
        CREATE TRIGGER IF NOT EXISTS reverter_estoque AFTER DELETE ON itens_venda
        BEGIN
            UPDATE estoque
            SET quantidade = quantidade + OLD.quantidade
            WHERE id_produto = OLD.id_produto;
        END;
    `;
    db.exec(createRevertTrigger);
}

function getCurrentDateTime() {
    const now = new Date();
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false, // Para formato 24 horas
    };
    return now.toLocaleString('pt-BR', options); // Ajuste o locale conforme necessário
}
// Função para inserir um usuário
function insertUser(login, senha_hash) {
    const stmt = db.prepare('INSERT INTO usuarios (login, senha_hash) VALUES (?, ?)');
    return stmt.run(login, senha_hash);
}

// Função para abrir o caixa
function abrirCaixa(id_usuario, data_hora_abertura, valor_inicial) {
    const stmt = db.prepare(`
        INSERT INTO abertura_caixa (id_usuario, data_hora_abertura, valor_inicial)
        VALUES (?, ?, ?)
    `);
    const info = stmt.run(id_usuario, data_hora_abertura, valor_inicial);
    return info.lastInsertRowid;  // Retorna o id_caixa que foi criado
}

// Função para fechar o caixa
function fecharCaixa(id_caixa, valor_final) {
    try {
        const stmt = db.prepare(`
            UPDATE abertura_caixa
            SET valor_final = ?, status = 'encerrada'
            WHERE id_caixa = ? AND status = 'aberta'
        `);
        const result = stmt.run(valor_final, id_caixa);
        return result.changes > 0;  // Retorna true se o caixa foi fechado com sucesso
    } catch (error) {
        console.error("Erro ao fechar o caixa:", error);
        throw error;
    }
}

function confirmarVendas(id_caixa, valor_total) {
        console.log("aaaaaaaaaaaa", id_caixa, valor_total);
        const data_hora_venda = getCurrentDateTime() // Pega a data e hora atual no formato ISO
        //console.log("DATA E HORA", data_hora_venda);
        const stmt = db.prepare(`
            INSERT INTO vendas (id_caixa, data_hora_venda, valor_total) 
            VALUES (?, ?, ?)
        `);

         return stmt.run(id_caixa, data_hora_venda, valor_total);
        
}

function pagamentoVendas(id_venda, pagamentos){

    console.log("id da venda", id_venda);
    console.log("/Pagamentos dentro de pagamentoVendas: ", pagamentos);
    
    const stmt = db.prepare(`
        INSERT INTO venda_pagamentos (id_venda, metodo_pagamento, valor) 
        VALUES (?, ?, ?)
    `);
    const select = db.prepare(`
        SELECT * from venda_pagamentos
    `);
    

 
    pagamentos.forEach(pagamento => {
        console.log("teste doos parametros pagametno: ",pagamento.metodo_pagamento, pagamento.valor)
        stmt.run(id_venda, pagamento.metodo_pagamento, pagamento.valor);
    });
    const tabela = select.all();
    console.log("Log da tabela pags:", tabela);
}


// Função para adicionar itens à venda
function adicionarItemVenda(idCaixa,total,pagamentos,produtos) {
    const produtosAgrupados = {};

    produtos.forEach(produto => {
        // Verifica se o produto com o mesmo ID já foi adicionado ao agrupamento
        if (produtosAgrupados[produto.id]) {
            // Se sim, soma a quantidade
            produtosAgrupados[produto.id].qtd += produto.qtd;
        } else {
            // Se não, adiciona o produto ao agrupamento
            produtosAgrupados[produto.id] = { ...produto };
        }
    });
        console.log("Produtos agrupados", produtosAgrupados);
    // Verifica se há estoque suficiente

    Object.values(produtosAgrupados).forEach(produto => {
        const estoque = db.prepare('SELECT quantidade FROM estoque WHERE id_produto = ?').get(produto.id);
        
        // Verifica se a quantidade em estoque é suficiente para o produto
        if (estoque.quantidade < produto.qtd) {
            throw new Error(`Estoque insuficiente para o produto ID: ${produto.id} - Nome: ${produto.nome}`);
        }else console.log("passou");
    });
    console.log("Todos os produtos têm estoque suficiente.");

        venda = confirmarVendas(idCaixa,total); //gerar a venda e em seguida add venda do produto
        console.log("VENDA OK.Id da venda:", venda.lastInsertRowid);

        const stmt = db.prepare(`
           INSERT INTO itens_venda (id_venda, id_produto, quantidade)
            VALUES (?, ?, ?)
        `);

        Object.values(produtosAgrupados).forEach(produto => {
            // Insere o produto na tabela itens_venda
            stmt.run(venda.lastInsertRowid, produto.id, produto.qtd);
            //console.log(`Venda registrada: Produto ID: ${produtosAgrupados.id}, Quantidade: ${produtosAgrupados.qtd}`);
        });
        
    }



// Função para cadastrar um produto
function cadastrarProduto(nome, valor_compra, valor, codigo_barras) {
    const stmt = db.prepare('INSERT INTO produtos (nome, valor_compra, valor, codigo_barras) VALUES (?, ?, ?, ?)');
    return stmt.run(nome, valor_compra, valor, codigo_barras);
}

// Função para inserir um produto no estoque
function inserirEstoque(id_produto, quantidade) {
    console.log("entrou em inserir estoque");
    const stmt = db.prepare('INSERT INTO estoque (id_produto, quantidade) VALUES (?, ?)');
    return stmt.run(id_produto, quantidade);
}

//Função para buscar estoque
function buscarEstoque(busca = '') {
    //console.log("entrou na clausula de busca");
    let query = `
        SELECT 
            produtos.id_produto, 
            produtos.nome, 
            produtos.valor_compra,
            produtos.valor,
            produtos.codigo_barras, 
            estoque.quantidade
        FROM estoque
        JOIN produtos ON estoque.id_produto = produtos.id_produto
    `;

    // Verifica se há busca e adiciona a cláusula WHERE para filtrar
    if (busca) {
       console.log("entrou na clausula de busca");
        query += `
            WHERE produtos.nome LIKE ? OR produtos.codigo_barras LIKE ?
        `;
        const stmt = db.prepare(query);
        return stmt.all(`%${busca}%`, `%${busca}%`);  // Utiliza os parâmetros de busca
    } else {
        const stmt = db.prepare(query);
        return stmt.all();  // Retorna todos os produtos se não houver busca
    }
}

function loginUser(login, senha) {
    // Busca o usuário pelo login
    //insertUser("kauan","123");
    //console.log("inseriu?");
    const usuario = db.prepare('SELECT id_usuario, senha_hash FROM usuarios WHERE login = ?').get(login);
    console.log(senha);
    // Se o usuário não existir, retorne um erro
    if (!usuario) {
        throw new Error('Usuário não encontrado.');
    }

    // Verifica se a senha fornecida corresponde à armazenada
    if (usuario.senha_hash !== senha) {
        throw new Error('Senha inválida.');
    }

    // Retorne o ID do usuário se a autenticação for bem-sucedida
    return usuario.id_usuario;
}

// Função para adicionar ao estoque
function adicionarAoEstoque(id_produto, quantidade) {
    const produtoEstoque = db.prepare('SELECT quantidade FROM estoque WHERE id_produto = ?').get(id_produto);
    if (!produtoEstoque) {
        throw new Error('Produto não encontrado no estoque.');
    }

    const novaQuantidade = produtoEstoque.quantidade + quantidade;
    const stmt = db.prepare('UPDATE estoque SET quantidade = ? WHERE id_produto = ?');
    return stmt.run(novaQuantidade, id_produto);
}

// Função para buscar produto pelo código de barras
function buscarProduto(codigoBarras) {
    console.log("entrou no buscar produtos do service")
    const db = getDatabaseConnection();
    const query = `SELECT * FROM produtos WHERE codigo_barras = ?`;
    return db.prepare(query).get(codigoBarras);
}


// Função para verificar se há um caixa aberto
function verificarCaixaAberto() {
    const stmt = db.prepare(`
        SELECT * FROM abertura_caixa
        WHERE status = 'aberta'
    `);
    const caixaAberto = stmt.get();
    return caixaAberto; // Retorna o caixa aberto, se existir
}

module.exports = {
    initializeDatabase,
    insertUser,
    abrirCaixa,
    fecharCaixa,
    confirmarVendas,
    adicionarItemVenda,
    pagamentoVendas,
    cadastrarProduto,
    inserirEstoque,
    buscarEstoque,
    loginUser,
    adicionarAoEstoque,
    buscarProduto,
    verificarCaixaAberto
};
