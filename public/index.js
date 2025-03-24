import {
    definition_radius_okumura_hata,
    definition_radius_cost_hata,
    calculate_outage,
    power_calculation
} from './functions.js';

const calculateReceivedPower = document.getElementById('calculateReceivedPower');
calculateReceivedPower.addEventListener('click', () => {
    const frequency = document.getElementById('frp').value;
    const radius = document.getElementById('rrp').value; 
    if (!frequency || !radius) {
        alert('Preencha todos os campos.');
        return;
    }
    if (frequency <= 0 || radius <= 0) {
        alert('Os valores devem ser maiores que zero.');
        return;
    }
    const result = power_calculation(frequency, radius);

    // document.getElementById('resultPower').classList.remove('hiddenResult');
    // document.getElementById('resultPower').classList.add('showResult');
});

const calculateOutage = document.getElementById('calculateOutage');
calculateOutage.addEventListener('click', async() => {   
    const frequency = document.getElementById('fco').value;
    const radius = document.getElementById('rco').value;
    const taxa_de_outage = document.getElementById('taxa_de_outage_calculada');

    //! ajsutar depois as mensagens de erro, remover o alert
    if (!frequency || !radius) {
        alert('Preencha todos os campos.');
        return;
    }
    if (frequency <= 0 || radius <= 0) {
        alert('Os valores devem ser maiores que zero.');
        return;
    }    
    const result = await calculate_outage(frequency, radius);

    const outage = result.taxa_de_outage;
    taxa_de_outage.innerText = "";
    taxa_de_outage.innerText = outage.toFixed(2);

    document.getElementById('resultOutage').classList.remove('hiddenResult');
    document.getElementById('resultOutage').classList.add('showResult');
});

const calculateRadius = document.getElementById('calculateRadius');
const model = document.getElementById('model');
calculateRadius.addEventListener('click', async() => {
    const frequency = document.getElementById('fcr').value;
    const raio_aproximado = document.getElementById('raio_aproximado');
    const taxa_de_outage = document.getElementById('taxa_de_outage');
    let result;

    //! ajsutar depois as mensagens de erro, remover o alert
    if (!frequency) {
        alert('Preencha todos os campos.');
        return;
    }
    if (frequency <= 0) {
        alert('Os valores devem ser maiores que zero.');
        return;
    }

    if (model.value === 'ok') {
        result = await definition_radius_okumura_hata(frequency);
    } else if (model.value === 'cost') {
        result = await definition_radius_cost_hata(frequency);
    }
    
    const radius = result.raio_aproximado;
    const outage = result.taxa_de_outage;
    raio_aproximado.innerText = "";
    taxa_de_outage.innerText = "";
    raio_aproximado.innerText = radius.toFixed(2);
    taxa_de_outage.innerText = outage.toFixed(2);

    document.getElementById('resultCalculateRadius').classList.remove('hiddenResult');
    document.getElementById('resultCalculateRadius').classList.add('showResult');
});

// +Navegação entre as seções
const power = document.getElementById('power');
const powerSection = document.getElementById('powerSection');
const outage = document.getElementById('outage');
const outageSection = document.getElementById('outageSection');
const radius = document.getElementById('radius');
const radiusSection = document.getElementById('radiusSection');

power.addEventListener('click', () => {
    powerSection.style.display = 'flex';
    outageSection.style.display = 'none';
    radiusSection.style.display = 'none';
});

outage.addEventListener('click', () => {
    powerSection.style.display = 'none';
    outageSection.style.display = 'flex';
    radiusSection.style.display = 'none';
});

radius.addEventListener('click', () => {
    powerSection.style.display = 'none';
    outageSection.style.display = 'none';
    radiusSection.style.display = 'flex';
});