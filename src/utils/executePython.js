const { spawn } = require('child_process');
const path = require('path');

/**
 * Executa um script Python com os parâmetros fornecidos e retorna o resultado.
 * @param {string} script - O nome do script Python a ser executado (ex.: 'Entrega1.py').
 * @param {Array<string|number>} params - Uma lista de parâmetros a serem passados para o script Python.
 * @param {Object} res - O objeto de resposta do Express para enviar os resultados ao cliente.
 * @returns {void} - A função não retorna diretamente, mas envia a resposta ao cliente via `res`.
 */
function executePython(script, params, res) {
    const pythonPath = process.env.PYTHON_PATH; // Caminho absoluto do Python configurado no .env
    const pythonProcess = spawn(pythonPath, [path.join(__dirname, '..', 'functions', script), ...params]);

    let output = ''; // Variável para armazenar a saída do script Python

    // Captura a saída padrão do script Python
    pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
    });

    // Captura erros enviados pelo script Python
    pythonProcess.stderr.on('data', (data) => {
        console.error(`Erro: ${data}`);
    });

    // Evento disparado quando o processo Python é encerrado
    pythonProcess.on('close', (code) => {
        if (code === 0) {
            try {
                const result = JSON.parse(output); // Tenta converter a saída para JSON
                res.json(result);
            } catch (err) {
                console.error(`Erro ao processar a saída do script Python: ${err}`);
                res.status(500).json({ error: 'Erro ao processar a saída do script Python.' });
            }
        } else {
            res.status(500).json({ error: 'Erro ao executar o script Python.' });
        }
    });
}

module.exports = { executePython };