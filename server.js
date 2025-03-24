const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config(); 

const app = express();
app.use(bodyParser.json());

// Servir arquivos estáticos (frontend)
app.use(express.static(path.join(__dirname, 'public')));

// Importar rotas
const apiRoutes = require('./src/routes/apiRoutes');

// Usar rotas
app.use('/api', apiRoutes);

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});