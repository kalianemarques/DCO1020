const express = require('express');
const router = express.Router();
const { executePython } = require('../utils/executePython');

// Rota para definição de raio celular para uma Outage planejada (Okumura-Hata)
router.post('/definicao_raio_okumura_hata', (req, res) => {
    const { frequency } = req.body;
    if (!frequency) {
        return res.status(400).json({ error: 'Parâmetro "frequency" é obrigatório.' });
    }
    executePython('Entrega1.py', [frequency], res);
});

// Rota para definição de raio celular para uma Outage planejada (COST-Hata)
router.post('/definicao_raio_cost_hata', (req, res) => {
    const { frequency } = req.body;
    if (!frequency) {
        return res.status(400).json({ error: 'Parâmetro "frequency" é obrigatório.' });
    }
    executePython('Entrega2.py', [frequency], res);
});

// Rota para cálculo de uma Outage a partir de frequência e raio
router.post('/calculo_outage', (req, res) => {
    const { frequency, radius } = req.body;
    if (!frequency || !radius) {
        return res.status(400).json({ error: 'Parâmetros "frequency" e "radius" são obrigatórios.' });
    }
    executePython('handson1_p4_1.py', [frequency, radius], res);
});

// Rota para cálculo de potência recebida e geração de gráfico
router.post('/calculo_potencia', (req, res) => {
    const { frequency, radius } = req.body;
    if (!frequency || !radius) {
        return res.status(400).json({ error: 'Parâmetros "frequency" e "radius" são obrigatórios.' });
    }
    executePython('handson1_p3_1.py', [frequency, radius], res, true); // Define isFileResponse como true
});

module.exports = router;