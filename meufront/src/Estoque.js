import React, { useState, useEffect } from 'react';
import './Estoque.css';

const Estoque = () => {
  const [nomeProduto, setNomeProduto] = useState('');
  const [valorVenda, setValorVenda] = useState('');
  const [valorCompra, setValor] = useState('');
  const [codigoBarras, setCodigoBarras] = useState('');
  const [quantidadeEstoque, setQuantidadeEstoque] = useState('');
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
    console.log("entrou em cP");
    e.preventDefault();
    const produto = { nomeProduto: nomeProduto, valorDe: valorVenda, valor: valorCompra, codigoBarras: codigoBarras, qtd: quantidadeEstoque };

    try {
      const response = await fetch('http://localhost:3001/inserirEstoque', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(produto),
      });

      if (response.ok) {
        alert('Produto cadastrado com sucesso!');
        buscarProdutos(); // Atualiza a tabela após o cadastro
        setNomeProduto('');
        setValorVenda('');
        setValor('');
        setCodigoBarras('');
        setQuantidadeEstoque('');
      }
    } catch (error) {
      console.error('Erro ao cadastrar produto:', error);
    }
  };

  // Função para abrir o modal de adição de quantidade
  const abrirModalAdicionarQtd = (produto) => {
    console.log('Produto selecionado:', produto);  // Log para verificar o produto
    setProdutoSelecionado(produto);
    setModalVisivel(true);
  };

  // Função para fechar o modal
  const fecharModal = () => {
    setModalVisivel(false);
    setQuantidadeAdicional('');
    setProdutoSelecionado(null);
  };

  // Função para adicionar quantidade
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
                <td>
                <button onClick={() => abrirModalAdicionarQtd(produto)}>
                  Adicionar Quantidade
                </button>
              </td>
              </tr>
            ))}
          </tbody>
        </table>
        {modalVisivel && (
        <div className="modal">
          <div className="modal-content">
            <h2>Adicionar Quantidade</h2>
            <p>Produto: {produtoSelecionado.nomeProduto}</p>
            <input
              type="number"
              value={quantidadeAdicional}
              onChange={(e) => setQuantidadeAdicional(e.target.value)}
              placeholder="Digite a quantidade"
            />
            <button onClick={adicionarQuantidade}>Adicionar</button>
            <button onClick={fecharModal}>Cancelar</button>
          </div>
        </div>
      )}
      </div>
      </div>
    </div>
  );
};

export default Estoque;
