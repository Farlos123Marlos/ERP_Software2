import React, { useState, useEffect } from 'react';
import './RelatorioVenda.css';

const RelatorioVenda = () => {
  const [dataInicial, setDataInicial] = useState('');
  const [dataFinal, setDataFinal] = useState('');
  const [idCaixa, setIdCaixa] = useState('');
  const [relatorio, setRelatorio] = useState([]);
  const [dataInicio, setDataInicio] = useState(''); // Estado para a data inicial
  const [dataFim, setDataFim] = useState(''); // Estado para a data final

  
  const exibirResultados = async () => {
    try {
      const response = await fetch('http://localhost:3001/relatorioTotal');
      const result = await response.json(); // Certifique-se de converter a resposta para JSON
      console.log(result); // Verifica o conteúdo completo da resposta
      setRelatorio(result.dados); // Acessa a chave "dados" da resposta
    } catch (error) {
      console.error('Erro ao buscar relatório:', error);
    }
  };

  
  // Função atualizada para buscar relatório com intervalo de datas
  const exibirResultadosPorIntervalo = async () => {
    if (!dataInicio || !dataFim) {
      console.error('Por favor, selecione ambas as datas.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/porIntervalo?dataInicio=${dataInicio}&dataFim=${dataFim}`);
      
      if (!response.ok) {
        throw new Error(`Erro na resposta: ${response.statusText}`);
      }
      
      const result = await response.json(); // Converte a resposta para JSON
      console.log(result); // Verifica o conteúdo completo da resposta
      
      if (result.sucesso) {
        setRelatorio(result.dados); // Acessa a chave "dados" da resposta
      } else {
        console.error('Erro na resposta da API:', result);
      }
    } catch (error) {
      console.error('Erro ao buscar relatório:', error);
    }
  };
  


  // useEffect que será executado quando a página for carregada
  useEffect(() => {
    exibirResultados();
  }, []); 

  return (
    <div className="relatorio-container">
      <div className="relatorio-header">
        <h2>Relatório de Vendas</h2>
      </div>

      {/* Seletor de data */}
      <div className="relatorio-seletor-data">
        <label htmlFor="dataInicio">Data de Início: </label>
        <input 
          type="date" 
          id="dataInicio" 
          value={dataInicio} 
          onChange={(e) => setDataInicio(e.target.value)} 
        />

        <label htmlFor="dataFim">Data de Fim: </label>
        <input 
          type="date" 
          id="dataFim" 
          value={dataFim} 
          onChange={(e) => setDataFim(e.target.value)} 
        />
        
        <button onClick={exibirResultadosPorIntervalo}>Exibir Relatório por Intervalo</button>
      </div>
      <button onClick={exibirResultados}>Exibir Relatório Total</button>

      {/* Exibir relatório */}
      <div className="relatorio-tabela-container">
        <h3>Dados Totais:</h3>
        <table className="relatorio-tabela">
          <thead>
            <tr>
              <th>Receita</th>
              <th>Custo</th>
              <th>Lucro Operacional</th>
            </tr>
          </thead>
          <tbody>
            {relatorio && (
              <tr>
                <td>R$ {relatorio.receitaTotal}</td>
                <td>R$ {relatorio.custoTotal}</td>
                <td>R$ {relatorio.lucroTotal}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );  
};

export default RelatorioVenda;
