# Hands-on 01 - Cálculos de Redes

Este projeto é uma aplicação web que realiza cálculos relacionados a redes de telecomunicações, como potência recebida, taxa de Outage e raio celular utilizando os modelos Okumura-Hata e COST-Hata.

---

## Pré-requisitos

Antes de começar, certifique-se de que sua máquina possui os seguintes softwares instalados:

1. **Node.js** (versão 14 ou superior)
   - [Download Node.js](https://nodejs.org/)
   - O Node.js é necessário para rodar o servidor da aplicação.

2. **Python** (versão 3.8 ou superior)
   - [Download Python](https://www.python.org/downloads/)
   - O Python é necessário para executar os cálculos matemáticos.

3. **Gerenciador de pacotes `pip`** (incluso no Python)
   - O `pip` será usado para instalar as bibliotecas Python necessárias.

4. **Bibliotecas Python necessárias**:
   - `numpy`
   - `matplotlib`

   Para instalar as bibliotecas, siga o passo 4 na seção "Como configurar o projeto".

---

## Como configurar o projeto

Siga os passos abaixo para configurar e iniciar a aplicação:

### Passo 1: Baixar o projeto

1. Faça o download do projeto clicando no botão "Code" no GitHub e selecionando "Download ZIP".
2. Extraia o conteúdo do arquivo ZIP para uma pasta de sua escolha.

**OU**

Se você tiver o Git instalado, clone o repositório:
```bash
git clone https://github.com/kalianemarques/DCO1020.git
cd DCO1020
```

---

### Passo 2: Instalar o Node.js

1. Acesse o site oficial do Node.js: [https://nodejs.org/](https://nodejs.org/).
2. Baixe e instale a versão LTS recomendada.
3. Após a instalação, verifique se o Node.js está funcionando:
   ```bash
   node -v
   ```
   O comando acima deve exibir a versão do Node.js instalada.

---

### Passo 3: Instalar o Python

1. Acesse o site oficial do Python: [https://www.python.org/downloads/](https://www.python.org/downloads/).
2. Baixe e instale a versão mais recente do Python 3.
3. Durante a instalação, marque a opção **"Add Python to PATH"**.
4. Após a instalação, verifique se o Python está funcionando:
   ```bash
   python --version
   ```
   O comando acima deve exibir a versão do Python instalada.

---

### Passo 4: Instalar as bibliotecas Python

1. Abra o terminal ou prompt de comando.
2. Instale as bibliotecas necessárias com o seguinte comando:
   ```bash
   pip install --user numpy matplotlib
   ```
3. Verifique se as bibliotecas foram instaladas corretamente:
   ```bash
   pip show numpy matplotlib
   ```

---

### Passo 5: Configurar o projeto

1. Abra a pasta do projeto no terminal.
2. Instale as dependências do Node.js:
   ```bash
   npm install
   ```
3. Crie o arquivo `.env` com base no arquivo de exemplo:
   ```bash
   cp .env.example .env
   ```
4. Edite o arquivo `.env` e configure as variáveis de ambiente:
   ```properties
   PYTHON_PATH=C:\Users\SeuUsuario\AppData\Local\Programs\Python\Python39\python.exe
   PORT=3000
   ```
   Substitua o caminho acima pelo caminho do executável do Python na sua máquina.

---

### Passo 6: Iniciar a aplicação

1. No terminal, inicie o servidor Node.js:
   ```bash
   npm start
   ```
2. Abra o navegador e acesse:
   ```
   http://localhost:3000
   ```

---

## Como usar a aplicação

A aplicação possui três funcionalidades principais:

1. **Cálculo de Potência Recebida**:
   - Insira a potência transmitida e a distância para calcular a potência recebida.

2. **Cálculo de Outage**:
   - Insira a frequência e o raio para calcular a taxa de Outage.

3. **Cálculo de Raio Celular**:
   - Escolha o modelo (Okumura-Hata ou COST-Hata) e insira a frequência para calcular o raio celular.

---

## Estrutura do projeto

```
Hands-on_01/
├── public/                # Arquivos estáticos (frontend)
│   ├── index.html         # Página principal
│   ├── index.js           # Lógica do frontend
│   ├── functions.js       # Funções utilitárias do frontend
│   ├── style.css          # Estilos CSS
├── src/
│   ├── functions/         # Scripts Python
│   │   ├── Entrega1.py    # Modelo Okumura-Hata
│   │   ├── Entrega2.py    # Modelo COST-Hata
│   │   ├── handson1_p3_1.py # Cálculo de potência recebida
│   │   ├── handson1_p4_1.py # Cálculo de Outage
│   ├── routes/            # Rotas da API
│   │   ├── apiRoutes.js   # Rotas para comunicação com os scripts Python
│   ├── utils/             # Utilitários
│   │   ├── executePython.js # Função para executar scripts Python
├── server.js              # Configuração do servidor Node.js
├── .env                   # Configurações do ambiente
├── .env.example           # Exemplo de configuração do ambiente
├── package.json           # Dependências do Node.js
```

---

## Problemas comuns

1. **Erro: "PYTHON_PATH não configurado"**:
   - Certifique-se de que o caminho do Python está configurado corretamente no arquivo `.env`.

2. **Erro: "Bibliotecas Python não encontradas"**:
   - Certifique-se de que as bibliotecas `numpy` e `matplotlib` estão instaladas:
     ```bash
     pip install numpy matplotlib
     ```

3. **Porta em uso**:
   - Se a porta 3000 já estiver em uso, altere a variável `PORT` no arquivo `.env`:
     ```
     PORT=4000
     ```

