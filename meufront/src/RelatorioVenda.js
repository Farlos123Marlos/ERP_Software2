import React, { useState } from 'react';

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
    <div>
      <h2>Relatório de Vendas</h2>

      {/* Filtrar por datas */}
      <div>
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
        <button onClick={buscarRelatorioPorData}>Buscar Relatório por Datas</button>
      </div>

      <hr />

      {/* Filtrar por abertura de caixa */}
      <div>
        <h3>Filtrar por Abertura de Caixa:</h3>
        <label>ID do Caixa:</label>
        <input
          type="number"
          value={idCaixa}
          onChange={(e) => setIdCaixa(e.target.value)}
        />
        <button onClick={buscarRelatorioPorCaixa}>Buscar Relatório por Caixa</button>
      </div>

      <hr />

      {/* Exibir relatório */}
      <h3>Resultados do Relatório:</h3>
      <table>
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
  );
};

export default RelatorioVenda;

