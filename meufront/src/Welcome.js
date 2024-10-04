import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Welcome.css';
import { useAuth } from './AuthContext';

const Welcome = () => {
  const navigate = useNavigate();
  const userId = sessionStorage.getItem('userId');
  console.log(userId);



  return (
    <div className="welcome-container">
      <h2>Bem-vindo!</h2>
      <div className="button-wrapper">
        <div className="button-grid">
          <button className="square-button" onClick={() => navigate('/estoque')}>Estoque</button>
          <button className="square-button" onClick={() => navigate('/abrirCaixa')}>Abrir ou fechar caixa</button>
          <button className="square-button" onClick={() => navigate('/venda')}>Venda</button>
          <button className="square-button" onClick={() => navigate('/relatorio-venda')}>Relatório de Venda</button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
