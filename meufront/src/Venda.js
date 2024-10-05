import React, { useState } from 'react';
import './Venda.css';

function Venda() {
    const [produtos, setProdutos] = useState([]); // Lista temporária de produtos
    const [produtoAtual, setProdutoAtual] = useState(''); // Código de barras do produto atual
    const [quantidade, setQuantidade] = useState(1); // Quantidade selecionada para o produto atual
    const [total, setTotal] = useState(0); // Valor total da venda
    const [formaPagamento, setFormaPagamento] = useState('dinheiro'); // Forma de pagamento

    // Função para buscar o produto via API
    const buscarProduto = async () => {
        try {
            const response = await fetch(`http://localhost:3001/buscarEstoque?busca=${produtoAtual}`);
            if (!response.ok) throw new Error('Produto não encontrado');
            const produto = await response.json();
            // Adicionar o produto à lista temporária com a quantidade e preço
            const  novoProduto =  {
             id: produto[0].id_produto,
              nome:  produto[0].nome,
              qtd: quantidade,
             preco: produto[0].valor_compra,
            };
            console.log("teste de Np",novoProduto.preco);
            setProdutos([...produtos, novoProduto]);
            setTotal(total + novoProduto.preco * quantidade);
            setProdutoAtual('');
            setQuantidade(1);
        } catch (error) {
            console.error('Erro ao buscar o produto:', error);
        }
    };

    // Função para confirmar a venda e enviar ao backend
    const confirmarVenda = async () => {
        const venda = {
            data_venda: new Date().toISOString().split('T')[0],
            valor_total: total,
            forma_pagamento: formaPagamento,
        };

        try {
            const response = await fetch('/api/venda', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ venda, itens: produtos }),
            });

            if (!response.ok) throw new Error('Erro ao registrar venda');
            alert('Venda registrada com sucesso!');
            setProdutos([]); // Limpa o "carrinho" após confirmação
            setTotal(0);
        } catch (error) {
            console.error('Erro ao confirmar a venda:', error);
        }
    };

    return (
        <div className="venda-container">
            <div className="venda-produtos">
                <input
                    type="text"
                    placeholder="Código de barras"
                    value={produtoAtual}
                    onChange={(e) => setProdutoAtual(e.target.value)}
                />
                <input
                    type="number"
                    min="1"
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                />
                <button onClick={buscarProduto}>Buscar Produto</button>

                <ul>
                    {produtos.map((produto, index) => (
                        <li key={index}>
                            {produto.nome} - Quantidade: {produto.qtd} - Preço: R$ {(produto.preco * produto.qtd).toFixed(2)}
                        </li>
                    ))}
                </ul>

                <h2>Total: R$ {total.toFixed(2)}</h2>
            </div>

            <div className="venda-detalhes">
                <h1>Valor Total: R$ {total.toFixed(2)}</h1>
                <p>Quantidade de produtos: {produtos.length}</p>

                <div className="forma-pagamento">
                    <label htmlFor="pagamento">Forma de Pagamento:</label>
                    <select
                        id="pagamento"
                        value={formaPagamento}
                        onChange={(e) => setFormaPagamento(e.target.value)}
                    >
                        <option value="dinheiro">Dinheiro</option>
                        <option value="cartao">Cartão</option>
                        <option value="pix">Pix</option>
                    </select>
                </div>

                <button className="confirmar-venda" onClick={confirmarVenda}>Confirmar Venda</button>
            </div>
        </div>
    );
}

export default Venda;
