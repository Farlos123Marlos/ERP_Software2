import React, { useState } from 'react';
import './Venda.css';

function Venda() {
    const [produtos, setProdutos] = useState([]); // Lista temporária de produtos
    const [produtoAtual, setProdutoAtual] = useState(''); // Código de barras do produto atual
    const [quantidade, setQuantidade] = useState(1); // Quantidade selecionada para o produto atual
    const [total, setTotal] = useState(0); // Valor total da venda
    const [pagamentos, setPagamentos] = useState([]); // Lista de pagamentos
    const [formaPagamentoAtual, setFormaPagamentoAtual] = useState('dinheiro'); // Método de pagamento atual
    const [valorPagamento, setValorPagamento] = useState(0); // Valor do pagamento atual
    const [valorFaltante, setValorFaltante] = useState(0); // Valor ainda a ser pago

    const idCaixaAtual = sessionStorage.getItem('idcaixa');

    const adicionarPagamento = () => {
        if (valorPagamento > 0 && valorPagamento <= valorFaltante) {
            const novoPagamento = {
                metodo_pagamento: formaPagamentoAtual,
                valor: valorPagamento,
            };
    
            setPagamentos([...pagamentos, novoPagamento]);
            setValorFaltante(valorFaltante - valorPagamento); // Atualiza o valor restante
            setValorPagamento(0); // Reseta o valor do pagamento atual
        } else {
            alert('Valor inválido ou excede o valor faltante.');
        }
    };

    // Função para remover um produto da lista
    const removerProduto = (index) => {
        const produtoRemovido = produtos[index];
        const novoTotal = total - produtoRemovido.preco * produtoRemovido.qtd;
        setTotal(novoTotal);
        setValorFaltante(valorFaltante - produtoRemovido.preco * produtoRemovido.qtd);

        // Remove o produto da lista
        const novaListaProdutos = produtos.filter((_, i) => i !== index);
        setProdutos(novaListaProdutos);
    };

    // Função para remover um pagamento da lista
    const removerPagamento = (index) => {
        const pagamentoRemovido = pagamentos[index];
        const novoValorFaltante = valorFaltante + pagamentoRemovido.valor;

        // Remove o pagamento da lista
        const novaListaPagamentos = pagamentos.filter((_, i) => i !== index);
        setPagamentos(novaListaPagamentos);
        setValorFaltante(novoValorFaltante);
    };

    // Função para buscar o produto via API
    const buscarProduto = async () => {
        try {
            const response = await fetch(`http://localhost:3001/buscarEstoque?busca=${produtoAtual}`);
            if (!response.ok) throw new Error('Produto não encontrado');
            const produto = await response.json();
            const novoProduto = {
                id: produto[0].id_produto,
                nome: produto[0].nome,
                qtd: quantidade,
                preco: produto[0].valor_compra,
            };
            setProdutos([...produtos, novoProduto]);
            setTotal(total + novoProduto.preco * quantidade);
            setValorFaltante(valorFaltante + novoProduto.preco * quantidade);
            setProdutoAtual('');
            setQuantidade(1);
        } catch (error) {
            console.error('Erro ao buscar o produto:', error);
        }
    };

    // Função para confirmar a venda e enviar ao backend
    const confirmarVenda = async () => {
        if (valorFaltante > 0) {
            alert('Ainda há saldo pendente!');
            return;
        }
    
        try {
            const response = await fetch('http://localhost:3001/confirmarVenda', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    idCaixa: idCaixaAtual,
                    total: total,
                    pagamentos: pagamentos,
                    produto: produtos,
                }),
            });
            const result = await response.json();
            console.log('Venda confirmada', result);
            setTotal(0);
            setProdutos([]);
            setPagamentos([]);
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
                            <button onClick={() => removerProduto(index)}>Remover</button>
                        </li>
                    ))}
                </ul>

                <h2>Total: R$ {total.toFixed(2)}</h2>
            </div>

            <div className="venda-detalhes">
                <h2>Total: R${total.toFixed(2)}</h2>
                <h3>Faltante: R${valorFaltante.toFixed(2)}</h3>

                {/* Interface para adicionar pagamentos */}
                <div>
                    <label>Forma de Pagamento:</label>
                    <select value={formaPagamentoAtual} onChange={(e) => setFormaPagamentoAtual(e.target.value)}>
                        <option value="dinheiro">Dinheiro</option>
                        <option value="cartao_credito">Cartão de Crédito</option>
                        <option value="cartao_debito">Cartão de Débito</option>
                    </select>

                    <label>Valor:</label>
                    <input 
                        type="number" 
                        value={valorPagamento} 
                        onChange={(e) => setValorPagamento(parseFloat(e.target.value))}
                    />

                    <button onClick={adicionarPagamento}>Adicionar Pagamento</button>
                </div>

                {/* Lista de pagamentos */}
                <h4>Pagamentos:</h4>
                <ul>
                    {pagamentos.map((pagamento, index) => (
                        <li key={index}>
                            {pagamento.metodo_pagamento}: R${pagamento.valor}
                            <button onClick={() => removerPagamento(index)}>Remover</button>
                        </li>
                    ))}
                </ul>

                {/* Botão para confirmar venda quando o valor total for coberto */}
                {valorFaltante === 0 && (
                    <button onClick={confirmarVenda}>Confirmar Venda</button>
                )}
            </div>
        </div>
    );
}

export default Venda;
