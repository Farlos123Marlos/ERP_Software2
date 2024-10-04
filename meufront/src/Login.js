import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './App.css';

const Login = () => {
  const [login, setLogin] = useState(''); // Renomeado para "login"
  const [senha_hash, setPassword] = useState('');
  const { setUserId } = useAuth(); // Removido userId, se não for usado
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // Para controle de loading

  const handleSubmit = async (e) => {
    e.preventDefault();
    const usuario = { login, senha_hash };

    setLoading(true); // Inicia o loading

    try {
      const response = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(usuario),
      });

      if (response.ok) {
        const data = await response.json();
        sessionStorage.setItem('userId', data.id);
        setUserId(data.id); // Armazena o ID do usuário na Context API
        navigate('/welcome'); // Redireciona para a página de boas-vindas
      } else {
        const errorData = await response.json();
        alert(errorData.error);
      }
    } catch (error) {
      console.error('Erro ao realizar login:', error);
      alert('Erro ao realizar login. Tente novamente.');
    } finally {
      setLoading(false); // Finaliza o loading
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Usuário" 
          value={login} 
          onChange={(e) => setLogin(e.target.value)} 
          required
        />
        <input 
          type="password" 
          placeholder="Senha" 
          value={senha_hash} 
          onChange={(e) => setPassword(e.target.value)} 
          required
        />
        <button type="submit" disabled={loading}> {/* Desabilita o botão enquanto carrega */}
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
};

export default Login;
