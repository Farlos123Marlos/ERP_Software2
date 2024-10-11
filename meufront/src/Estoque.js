import React, { useState, useEffect } from 'react';
import './Estoque.css';

const Estoque = () => {
  const [nomeProduto, setNomeProduto] = useState('');
  const [valorVenda, setValorVenda] = useState('');
  const [valorCompra, setValor] = useState('');
  const [codigoBarras, setCodigoBarras] = useState('');
  const [quantidadeEstoque, setQuantidadeEstoque] = useState('');
  const [validadeProduto, setValidadeProduto] = useState('');
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState('');
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [modalVisivel, setModalVisivel] = useState(false);
  const userId = sessionStorage.getItem('userId');

  console.log(userId);

  // Função para buscar produtos da API
  const buscarProdutos = async () => {
    try {
      const response = await fetch(`http://localhost:3001/buscarEstoque?busca=${busca}`);
      const data = await response.json();
      setProdutos(data);
      return data;
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
  };

  // Função para excluir produto
  const excluirProduto = async (idProduto) => {
    try {
      const response = await fetch(`http://localhost:3001/excluirProduto/${idProduto}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert('Produto excluído com sucesso!');
        buscarProdutos(); // Atualiza a lista de produtos
      } else {
        console.error('Erro ao excluir o produto');
      }
    } catch (error) {
      console.error('Erro ao excluir o produto:', error);
    }
  };

  // Função para verificar a validade dos produtos e exibir um único alert com todos os produtos
const verificarValidade = (produtos) => {
  const hoje = new Date();
  let produtosExpirados = [];
  let produtosPrestesAExpirar = [];

  produtos.forEach((produto) => {
    const validadeProduto = new Date(produto.validade);  // Converter a validade para objeto Date
    
    // Calcular a diferença em milissegundos
    const diffTime = validadeProduto - hoje;
    
    // Converter a diferença em dias
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Verificar se o produto já passou da validade ou está a 7 dias de expirar
    if (diffDays < 0) {
      produtosExpirados.push(`${produto.nome} (expirou em ${validadeProduto.toLocaleDateString()})`);
    } else if (diffDays <= 7) {
      produtosPrestesAExpirar.push(`${produto.nome} (expira em ${diffDays} dias, ${validadeProduto.toLocaleDateString()})`);
    }
  });

  // Se houver produtos expirados ou prestes a expirar, exibir alert
  if (produtosExpirados.length > 0 || produtosPrestesAExpirar.length > 0) {
    let mensagemAlerta = '';

    if (produtosExpirados.length > 0) {
      mensagemAlerta += `Produtos já expirados:\n${produtosExpirados.join('\n')}\n\n`;
    }

    if (produtosPrestesAExpirar.length > 0) {
      mensagemAlerta += `Produtos prestes a expirar (em até 7 dias):\n${produtosPrestesAExpirar.join('\n')}`;
    }

    alert(mensagemAlerta);
  }
};

useEffect(() => {
  buscarProdutos(); // Apenas busca os produtos sem verificar validade
}, [busca]);


useEffect(() => {
  const inicializarProdutos = async () => {
    const produtosBuscados = await buscarProdutos(); // Primeiro busca os produtos
    verificarValidade(produtosBuscados); // Depois verifica a validade
  };

  inicializarProdutos();
}, []); // [] garante que esse efeito só execute uma vez, quando o componente é montado



  // Função de cadastro de produto
  const cadastrarProduto = async (e) => {
    e.preventDefault();
    const produto = { 
      nomeProduto, 
      valorDe: valorVenda, 
      valor: valorCompra, 
      codigoBarras, 
      validade: validadeProduto, 
      qtd: quantidadeEstoque 
    };

    try {
      const response = await fetch('http://localhost:3001/inserirEstoque', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(produto),
      });
      if (response.ok) {
        alert('Produto cadastrado com sucesso!');
        buscarProdutos(); // Atualiza a lista de produtos
        setNomeProduto('');
        setValorVenda('');
        setValor('');
        setCodigoBarras('');
        setValidadeProduto('');
        setQuantidadeEstoque('');
      }
    } catch (error) {
      console.error('Erro ao cadastrar produto:', error);
    }
  };

  // Função para abrir o modal de edição
  const abrirModalEditar = (produto) => {
    setProdutoSelecionado(produto);  // Armazena o produto selecionado para edição
    setModalVisivel(true);  // Exibe o modal
  };

  // Função para editar o produto
  const editarProduto = async (e) => {
    e.preventDefault();
    
    // Dados atualizados do produto
    const produtoAtualizado = {
      idProduto: produtoSelecionado.id_produto, // ID do produto sendo editado
      nomeProduto: produtoSelecionado.nome,
      valorDe: produtoSelecionado.valor_compra,
      valor: produtoSelecionado.valor,
      validade: produtoSelecionado.validade,
      qtd: parseInt(produtoSelecionado.qtd, 10)
    };

    try {
      
      const response = await fetch('http://localhost:3001/atualizarProduto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(produtoAtualizado),
      });

      if (response.ok) {
        alert('Produto atualizado com sucesso!');
        buscarProdutos();  // Atualiza a lista de produtos
        fecharModal();  // Fecha o modal de edição
      } else {
        console.error('Erro ao atualizar o produto');
      }
    } catch (error) {
      console.error('Erro ao atualizar o produto:', error);
    }
  };

  // Função para fechar o modal
  const fecharModal = () => {
    setModalVisivel(false);
    setProdutoSelecionado(null); // Limpa o produto selecionado
  };


  return (
    <div className="estoque-container">
      {/* Parte de Cadastro */}
      <div className="cadastro">
        <h2>Cadastrar Produto</h2>
        <form onSubmit={cadastrarProduto}>
          <label>Nome do Produto:</label>
          <input
            type="text"
            value={nomeProduto}
            onChange={(e) => setNomeProduto(e.target.value)}
            required
          />

          <label>Valor de Venda:</label>
          <input
            type="number"
            step="0.01"
            value={valorVenda}
            onChange={(e) => setValorVenda(e.target.value)}
            required
          />

          <label>Valor de Compra:</label>
          <input
            type="number"
            step="0.01"
            value={valorCompra}
            onChange={(e) => setValor(e.target.value)}
            required
          />

          <label>Código de Barras:</label>
          <input
            type="text"
            value={codigoBarras}
            onChange={(e) => setCodigoBarras(e.target.value)}
            required
          />

          <label>Alterar validade:</label> 
          <input
            type="date"
            value={validadeProduto}
            onChange={(e) => setValidadeProduto(e.target.value)}
            required
          />

          <label>Quantidade em Estoque:</label>
          <input
            type="number"
            value={quantidadeEstoque}
            onChange={(e) => setQuantidadeEstoque(e.target.value)}
            required
          />

          <button type="submit">Cadastrar</button>
        </form>
      </div>

      {/* Parte de Busca */}
      <div className="welcome-container">
        <div className="busca">
          <h2>Buscar Produtos</h2>
          <input
            type="text"
            placeholder="Buscar por nome ou código de barras"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <table>
            <thead>
              <tr>
                <th>Nome do Produto</th>
                <th>Valor de Venda</th>
                <th>Valor de Compra</th>
                <th>Código de Barras</th>
                <th>Quantidade em Estoque</th>
                <th>Validade<br />AAAA-MM-DD</th>
                <th>Ações</th> {/* Nova coluna para ações */}
              </tr>
            </thead>
            <tbody>
              {produtos.map((produto) => (
                <tr key={produto.id}>
                  <td>{produto.nome}</td>
                  <td>{produto.valor_compra}</td>
                  <td>{produto.valor}</td>
                  <td>{produto.codigo_barras}</td>
                  <td>{produto.quantidade}</td>
                  <td>{produto.validade}</td>
                  <td>
                    <button onClick={() => abrirModalEditar(produto)}>Editar</button> {/* Botão de editar */}
                    <button onClick={() => excluirProduto(produto.id)}>Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Modal de Edição */}
          {modalVisivel && (
            <div className="modal">
              <div className="modal-content">
                <h2>Editar Produto</h2>
                <form onSubmit={editarProduto}>
                  <label>Nome do Produto:</label>
                  <input
                    type="text"
                    value={produtoSelecionado.nome}
                    onChange={(e) => setProdutoSelecionado({ ...produtoSelecionado, nome: e.target.value })}
                    required
                  />

                  <label>Valor de Venda:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={produtoSelecionado.valor_compra}
                    onChange={(e) => setProdutoSelecionado({ ...produtoSelecionado, valor_compra: e.target.value })}
                    required
                  />

                  <label>Valor de Compra:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={produtoSelecionado.valor}
                    onChange={(e) => setProdutoSelecionado({ ...produtoSelecionado, valor: e.target.value })}
                    required
                  />

                  <label>Alterar validade:</label>
                  <input
                    type="date"
                    value={produtoSelecionado.validade}
                    onChange={(e) => setProdutoSelecionado({ ...produtoSelecionado, validade: e.target.value })}
                  />

                  <label>Adicionar quantidade:</label>
                  <input
                    type="number"
                    step="1"
                    value={produtoSelecionado.qtd}
                    onChange={(e) => setProdutoSelecionado({ ...produtoSelecionado, qtd: e.target.value })}
                  />

                  <button type="submit">Salvar Alterações</button>
                  <button onClick={fecharModal}>Cancelar</button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Estoque;
