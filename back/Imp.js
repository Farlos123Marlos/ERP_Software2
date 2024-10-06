const { spawn } = require('child_process');
const path = require('path');

// Função que será exportada para ser chamada no controlador
function printReceipt(printerName, items) {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, 'main.py'); // Caminho para o script Python
        const pythonProcess = spawn('python', [scriptPath, printerName]);

        // Transformar o objeto items para o formato que o Python espera
        const formattedItems = items.map(item => ({
            name: item.nome,  // Mapeando "nome" para "name"
            qty: item.qtd,    // Mapeando "qtd" para "qty"
            price: item.preco // Mapeando "preco" para "price"
        }));

        // Converter os itens formatados em JSON e enviar via stdin para o Python
        pythonProcess.stdin.write(JSON.stringify(formattedItems));
        pythonProcess.stdin.end(); // Fecha a entrada para o processo Python

        // Captura a saída padrão (stdout) do script Python
        pythonProcess.stdout.on('data', (data) => {
            console.log(`Saída do Python: ${data}`);
        });

        // Captura a saída de erro (stderr) do script Python
        pythonProcess.stderr.on('data', (data) => {
            console.error(`Erro no Python: ${data}`);
            reject(`Erro no Python: ${data}`);
        });

        // Quando o processo termina
        pythonProcess.on('close', (code) => {
            console.log(`Processo Python finalizado com código ${code}`);
            if (code === 0) {
                resolve('Recibo impresso com sucesso!');
            } else {
                reject(`Erro ao imprimir recibo. Código de saída: ${code}`);
            }
        });
    });
}
    // Exporta a função
module.exports = { printReceipt };
