const fs = require('fs');
const path = require('path');

// Função para imprimir o relatório do caixa
function imprimirRelatorio({ receita, custo, lucro, data }) {
    const relatorio = `
        Relatório do Caixa - Data: ${data}
        -----------------------------
        Receita Total: R$ ${receita}
        Custo Total: R$ ${custo}
        Lucro Total: R$ ${lucro}
        -----------------------------
    `;

    // Exibe o relatório no console
    console.log(relatorio);

    // Opcional: Salvar o relatório em um arquivo
    const filePath = path.join(__dirname, 'relatorio_caixa.txt');
    
    try {
        fs.writeFileSync(filePath, relatorio);
        console.log(`Relatório salvo em: ${filePath}`);
    } catch (error) {
        console.error('Erro ao salvar o relatório:', error.message);
    }
}

module.exports = { imprimirRelatorio };
