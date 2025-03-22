const express = require('express');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const path = require('path');

require('dotenv').config(); 

const app = express();
app.use(bodyParser.json());

// Servir arquivos estáticos (frontend)
app.use(express.static(path.join(__dirname, 'public')));

const fs = require('fs'); // Importa o módulo para manipulação de arquivos

// Função auxiliar para executar scripts Python
function executePython(script, params, res, isFileResponse = false) {
    const pythonPath = process.env.PYTHON_PATH;  // Caminho absoluto do Python
    const pythonProcess = spawn(pythonPath, [path.join(__dirname, 'src', 'functions', script), ...params]);

    let output = '';
    pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Erro: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        if (code === 0) {
            if (isFileResponse) {
                const filePath = path.join(__dirname, 'output', 'grafico.png'); // Caminho do arquivo gerado
                if (fs.existsSync(filePath)) {
                    res.sendFile(filePath, (err) => {
                        if (err) {
                            console.error(`Erro ao enviar o arquivo: ${err}`);
                            res.status(500).json({ error: 'Erro ao enviar o arquivo gerado.' });
                        }
                    });
                } else {
                    res.status(500).json({ error: 'Arquivo gerado não encontrado.' });
                }
            } else {
                try {
                    const result = JSON.parse(output); // Tenta converter a saída para JSON
                    res.json(result);
                } catch (err) {
                    res.status(500).json({ error: 'Erro ao processar a saída do script Python.' });
                }
            }
        } else {
            res.status(500).json({ error: 'Erro ao executar o script Python.' });
        }
    });
}

// Rota para definição de raio celular para uma Outage planejada (Okumura-Hata)
app.post('/api/definicao_raio_okumura_hata', (req, res) => {
    const { frequencia, raio } = req.body;
    if (!frequencia || !raio) {
        return res.status(400).json({ error: 'Parâmetros "frequencia" e "raio" são obrigatórios.' });
    }
    executePython('Entrega1.py', [frequencia, raio], res);
});

// Rota para definição de raio celular para uma Outage planejada (COST-Hata)
app.post('/api/definicao_raio_cost_hata', (req, res) => {
    const { frequencia, raio } = req.body;
    if (!frequencia || !raio) {
        return res.status(400).json({ error: 'Parâmetros "frequencia" e "raio" são obrigatórios.' });
    }
    executePython('Entrega2.py', [frequencia, raio], res);
});

// Rota para cálculo de uma Outage a partir de frequência e raio
app.post('/api/calculo_outage', (req, res) => {
    const { frequencia, raio } = req.body;
    if (!frequencia || !raio) {
        return res.status(400).json({ error: 'Parâmetros "frequencia" e "raio" são obrigatórios.' });
    }
    executePython('handson1_p4_1.py', [frequencia, raio], res);
});

// Rota para cálculo de potência recebida e geração de gráfico
app.post('/api/calculo_potencia', (req, res) => {
    const { frequencia, raio } = req.body;
    if (!frequencia || !raio) {
        return res.status(400).json({ error: 'Parâmetros "frequencia" e "raio" são obrigatórios.' });
    }
    executePython('handson1_p3_1.py', [frequencia, raio], res, true); // Define isFileResponse como true
});

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});