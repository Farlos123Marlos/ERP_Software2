import React, { useState, useEffect } from 'react';
import './Estoque.css';

const Estoque = () => {
  const [nomeProduto, setNomeProduto] = useState('');
  const [valorVenda, setValorVenda] = useState('');
  const [valorCompra, setValor] = useState('');
  const [codigoBarras, setCodigoBarras] = useState('');
  const [quantidadeEstoque, setQuantidadeEstoque] = useState('');
  const [descricaoProduto, setDescricaoProduto] = useState(''); // Estado para a descrição do produto
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState('');
  const [quantidadeAdicional, setQuantidadeAdicional] = useState('');
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [modalVisivel, setModalVisivel] = useState(false);
  const userId = sessionStorage.getItem('userId');

  console.log(userId);

  // Função para buscar produtos da API
  const buscarProdutos = async () => {
    try {
      console.log("test");
      const response = await fetch(`http://localhost:3001/buscarEstoque?busca=${busca}`);
      const data = await response.json();
      setProdutos(data);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
  };

  // Chamada inicial para carregar os produtos
  useEffect(() => {
    buscarProdutos();
  }, [busca]);

  // Função de cadastro de produto
  const cadastrarProduto = async (e) => {
    e.preventDefault();
    const produto = { 
      nomeProduto, 
      valorDe: valorVenda, 
      valor: valorCompra, 
      codigoBarras, 
      descricao: descricaoProduto, // Inclui a descrição no produto
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
        setDescricaoProduto(''); // Limpa o campo de descrição
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
      descricao: produtoSelecionado.descricao,
    };

    try {
      //console.log("valoress no front",produtoSelecionado.id,produtoSelecionado.nome, produtoSelecionado.valorDe,produtoSelecionado.valor,produtoSelecionado.descricao);
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

  // Função para adicionar quantidade ao estoque
  const adicionarQuantidade = async () => {
    if (!quantidadeAdicional || isNaN(quantidadeAdicional)) {
      alert('Por favor, insira uma quantidade válida.');
      return;
    }

    const dados = {
      id: produtoSelecionado.id_produto,  // Certifique-se de que produtoSelecionado tem o campo 'id'
      quantidade: parseInt(quantidadeAdicional, 10),
    };

    console.log('Dados enviados:', dados);  // Log para verificar se o id está correto

    try {
      const response = await fetch('http://localhost:3001/addQtd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      });

      if (response.ok) {
        alert('Quantidade adicionada com sucesso!');
        buscarProdutos(); // Atualiza a lista de produtos
        fecharModal();
      } else {
        alert('Erro ao adicionar quantidade.');
      }
    } catch (error) {
      console.error('Erro ao adicionar quantidade:', error);
      alert('Erro ao adicionar quantidade.');
    }
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

          <label>Descrição do Produto:</label>  {/* Campo de descrição */}
          <input
            type="text"
            value={descricaoProduto}
            onChange={(e) => setDescricaoProduto(e.target.value)}
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
                <th>Descrição</th>
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
                  <td className="table-descricao">{produto.descricao}</td>
                  <td>
                    <button onClick={() => abrirModalEditar(produto)}>Editar</button> {/* Botão de editar */}
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

                  <label>Descrição do Produto:</label>
                  <input
                    type="text"
                    value={produtoSelecionado.descricao}
                    onChange={(e) => setProdutoSelecionado({ ...produtoSelecionado, descricao: e.target.value })}
                    required
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
