import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Welcome from './Welcome';
import Estoque from './Estoque';
import Venda from './Venda';
import AbrirCaixa from './abrirCaixa';
import RelatorioVenda from './RelatorioVenda';
import { AuthProvider } from './AuthContext';

function App() {
  return (
    <AuthProvider> {/* Move o AuthProvider para fora do Router */}
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/estoque" element={<Estoque />} />
          <Route path="/abrirCaixa" element={<AbrirCaixa />} />
          <Route path="/venda" element={<Venda />} />
          <Route path="/relatorio-venda" element={<RelatorioVenda />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
