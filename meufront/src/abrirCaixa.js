import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './abrirCaixa.css';

const AbrirCaixa = () => {
  const [caixaAberto, setCaixaAberto] = useState(null); // Estado para o caixa atual
  const [valorInicial, setValorInicial] = useState(''); // Valor para abrir novo caixa
  const [valorEncerramento, setValorEncerramento] = useState(''); // Valor para encerrar caixa
  const [mostrarCampoEncerramento, setMostrarCampoEncerramento] = useState(false); // Controla a exibição do campo de encerramento
  const navigate = useNavigate();

  // Função para verificar se existe um caixa aberto
  const verificarCaixaAberto = async () => {
    try {
      const response = await fetch('http://localhost:3001/caixa-aberto');
      const data = await response.json();
      setCaixaAberto(data.caixa || null); // Define o caixa aberto, ou null se não houver
      sessionStorage.setItem('idcaixa', data.caixa || null);
    } catch (error) {
      console.error('Erro ao verificar o caixa:', error);
    }
  };

  const userId = sessionStorage.getItem('userId');
  function getCurrentDateTime() {
    const now = new Date();
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false, // Para formato 24 horas
    };
    return now.toLocaleString('pt-BR', options); // Ajuste o locale conforme necessário
}

  // Função para abrir um novo caixa
  const abrirCaixa = async () => {
    const dados ={
        "id_usuario": userId,
        "data_hora_abertura": getCurrentDateTime(),
        "valor_inicial":valorInicial
    }
    console.log(dados);
    try {
      const response = await fetch('http://localhost:3001/abrirCaixa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
      });
      const data = await response.json();
      setCaixaAberto(data.caixa); // Atualiza o estado do caixa aberto
      sessionStorage.setItem('idcaixa', data.caixa);
      verificarCaixaAberto();
    } catch (error) {
      console.error('Erro ao abrir o caixa:', error);
    }
  };

  // Função para fechar o caixa atual com valor de encerramento
  const fecharCaixa = async () => {
    const dados = {
        "id_caixa": caixaAberto.id_caixa,
        "valor_final": valorEncerramento
      };
    try {
      const response = await fetch(`http://localhost:3001/fecharCaixa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
      });
      const data = await response.json(); // Captura a resposta em JSON

        if (response.ok) {
            console.log(data.message); // Loga a mensagem de sucesso
            setCaixaAberto(null); // Define como null após fechar o caixa
            setValorEncerramento(''); // Limpa o campo de encerramento
            setMostrarCampoEncerramento(false); // Oculta o campo após o fechamento
            alert('Caixa encerrado com sucesso!');
        } else {
            console.error(data.message); // Loga a mensagem de erro se houver
        }
    } catch (error) {
        console.error('Erro ao fechar o caixa:', error);
    }
  };

  // UseEffect para carregar os dados ao iniciar
  useEffect(() => {
    verificarCaixaAberto();
  }, []);

  return (
    <div className="caixa-container">
      <div className="status-caixa">
        <h2>Status do Caixa</h2>
        {caixaAberto ? (
          <div className="info">
            <p><strong>ID do Caixa:</strong> {caixaAberto.id_caixa}</p>
            <p><strong>Valor Inicial:</strong> {caixaAberto.valor_inicial}</p>
            <p><strong>Data de Abertura:</strong> {caixaAberto.data_hora_abertura}</p>
          </div>
        ) : (
          <p>Não há caixa aberto no momento.</p>
        )}
      </div>

      <div className="gerenciar-caixa">
        <h2>Gerenciar Caixa</h2>
        <div className="button-wrapper">
          {!caixaAberto && (
            <div>
              <input
                type="number"
                placeholder="Valor inicial"
                value={valorInicial}
                onChange={(e) => setValorInicial(e.target.value)}
              />
              <button onClick={abrirCaixa}>Abrir Caixa</button>
            </div>
          )}

          {caixaAberto && (
            <div>
              {!mostrarCampoEncerramento ? (
                <button onClick={() => setMostrarCampoEncerramento(true)}>Fechar Caixa</button>
              ) : (
                <div>
                  <input
                    type="number"
                    placeholder="Valor de encerramento"
                    value={valorEncerramento}
                    onChange={(e) => setValorEncerramento(e.target.value)}
                  />
                  <button onClick={fecharCaixa}>Confirmar Fechamento</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AbrirCaixa;
