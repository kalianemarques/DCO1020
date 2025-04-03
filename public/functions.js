const API_URL = 'http://localhost:3000/api';

/**
 * Faz uma requisição ao servidor para calcular o raio celular usando o modelo Okumura-Hata.
 * @param {number} frequency - A frequência da portadora (em MHz).
 * @returns {Object|null} - Um objeto contendo o raio calculado e a taxa de outage, ou null em caso de erro.
 */
export async function definition_radius_okumura_hata(frequency) {
    try {
        const response = await fetch(`${API_URL}/definicao_raio_okumura_hata`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ frequency })
        });
        const data = await response.json();
        if (data.error) {
            alert(data.error);
            return null;
        }
        console.log(data);
        return data;
    } catch (err) {
        console.error(err);
        alert('Erro ao calcular raio.');
        return null;
    }
}

/**
 * Faz uma requisição ao servidor para calcular o raio celular usando o modelo COST-Hata.
 * @param {number} frequency - A frequência da portadora (em MHz).
 * @returns {Object|null} - Um objeto contendo o raio calculado e a taxa de outage, ou null em caso de erro.
 */
export async function definition_radius_cost_hata(frequency) {
    try {
        const response = await fetch(`${API_URL}/definicao_raio_cost_hata`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ frequency })
        });
        const data = await response.json();
        if (data.error) {
            alert(data.error);
            return null;
        }
        console.log(data);
        return data; 
    } catch (err) {
        console.error(err);
        alert('Erro ao calcular raio.');
        return null;
    }
}

/**
 * Faz uma requisição ao servidor para calcular a taxa de outage com base na frequência e no raio.
 * @param {number} frequency - A frequência da portadora (em MHz).
 * @param {number} radius - O raio da célula (em metros).
 * @returns {Object|null} - Um objeto contendo a taxa de outage, ou null em caso de erro.
 */
export async function calculate_outage(frequency, radius) {
    try {
        const response = await fetch(`${API_URL}/calculo_outage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ frequency, radius })
        });
        const data = await response.json();
        if (data.error) {
            alert(data.error);
            return null;
        }
        console.log(data);
        return data; 
    } catch (err) {
        console.error(err);
        alert('Erro ao calcular outage.');
        return null;
    }
}

/**
 * Faz uma requisição ao servidor para calcular a potência recebida e gerar um gráfico.
 * @param {number} frequency - A frequência da portadora (em MHz).
 * @param {number} radius - O raio da célula (em metros).
 * @returns {Object|null} - Um objeto contendo os dados da potência recebida, ou null em caso de erro.
 */
export async function power_calculation(frequency, radius) {
    try {
        const response = await fetch(`${API_URL}/calculo_potencia`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ frequency, radius })
        });
        const data = await response.json();
        if (data.error) {
            alert(data.error);
            return null;
        }
        return data;
    } catch (err) {
        console.error(err);
        alert('Erro ao calcular potência.');
        return null;
    }
}