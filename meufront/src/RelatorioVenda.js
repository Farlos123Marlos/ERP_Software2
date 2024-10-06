import React, { useState } from 'react';
import './RelatorioVenda.css';

const RelatorioVenda = () => {
  const [dataInicial, setDataInicial] = useState('');
  const [dataFinal, setDataFinal] = useState('');
  const [idCaixa, setIdCaixa] = useState('');
  const [relatorio, setRelatorio] = useState([]);

  const buscarRelatorioPorData = async () => {
    try {
      const response = await fetch(`http://localhost:3001/relatorioPorData?dataInicial=${dataInicial}&dataFinal=${dataFinal}`);
      const result = await response.json();
      setRelatorio(result);
    } catch (error) {
      console.error('Erro ao buscar relatório por datas:', error);
    }
  };

  const buscarRelatorioPorCaixa = async () => {
    try {
      const response = await fetch(`http://localhost:3001/relatorioPorCaixa?idCaixa=${idCaixa}`);
      const result = await response.json();
      setRelatorio(result);
    } catch (error) {
      console.error('Erro ao buscar relatório por caixa:', error);
    }
  };

  return (
    <div className="relatorio-container">
      <div className="relatorio-header">
        <h2>Relatório de Vendas</h2>
      </div>

      {/* Filtrar por datas */}
      <div className="filtro-datas">
        <h3>Filtrar por datas:</h3>
        <label>Data Inicial:</label>
        <input
          type="date"
          value={dataInicial}
          onChange={(e) => setDataInicial(e.target.value)}
        />
        <label>Data Final:</label>
        <input
          type="date"
          value={dataFinal}
          onChange={(e) => setDataFinal(e.target.value)}
        />
        <button className="relatorio-export" onClick={buscarRelatorioPorData}>
          Buscar Relatório por Datas
        </button>
      </div>

      {/* Filtrar por abertura de caixa */}
      <div className="filtro-caixa">
        <h3>Filtrar por Abertura de Caixa:</h3>
        <label>ID do Caixa:</label>
        <input
          type="number"
          value={idCaixa}
          onChange={(e) => setIdCaixa(e.target.value)}
        />
        <button className="relatorio-export" onClick={buscarRelatorioPorCaixa}>
          Buscar Relatório por Caixa
        </button>
      </div>

      {/* Exibir relatório */}
      <div className="relatorio-tabela-container">
        <h3>Resultados do Relatório:</h3>
        <table className="relatorio-tabela">
          <thead>
            <tr>
              <th>ID Venda</th>
              <th>Data/Hora</th>
              <th>Total</th>
              <th>ID Caixa</th>
            </tr>
          </thead>
          <tbody>
            {relatorio.map((venda) => (
              <tr key={venda.id_venda}>
                <td>{venda.id_venda}</td>
                <td>{new Date(venda.data_hora_venda).toLocaleString()}</td>
                <td>R$ {venda.valor_total.toFixed(2)}</td>
                <td>{venda.id_caixa}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RelatorioVenda;
