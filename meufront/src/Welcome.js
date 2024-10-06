import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Welcome.css';

const Welcome = () => {
  const navigate = useNavigate();
  const userId = sessionStorage.getItem('userId');
  console.log(userId);

  const handleVendaClick = async () => {
    const caixaAberto = await verificarCaixaAberto();
    if (caixaAberto) {
      navigate('/venda');
    } else {
      alert("Não existe caixa aberto");
    }
  };

  const verificarCaixaAberto = async () => {
    try {
      const response = await fetch('http://localhost:3001/caixa-aberto');
      const data = await response.json();

      // Verifica se data.caixa existe e retorna true/false
      if (data && data.caixa) {
        console.log("Id: caixa aberto: ", data.caixa.id_caixa);
        sessionStorage.setItem('idcaixa', data.caixa.id_caixa);
        return true; // Caixa aberto
      } else {
        console.log("Nenhum caixa aberto encontrado.");
        sessionStorage.setItem('idcaixa', null);
        return false; // Caixa não aberto
      }
    } catch (error) {
      console.error('Erro ao verificar o caixa:', error);
      sessionStorage.setItem('idcaixa', null);
      return false; // Em caso de erro, assume-se que não há caixa aberto
    }
  };

  return (
    <div className="welcome-container">
      <h2>Bem-vindo!</h2>
      <div className="button-wrapper">
        <div className="button-grid">
          <button className="square-button" onClick={() => navigate('/estoque')}>Estoque</button>
          <button className="square-button" onClick={() => navigate('/abrirCaixa')}>Abrir ou fechar caixa</button>
          <button className="square-button" onClick={handleVendaClick}>Venda</button>
          <button className="square-button" onClick={() => navigate('/relatorio-venda')}>Relatório de Venda</button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
