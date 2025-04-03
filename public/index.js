import {
    definition_radius_okumura_hata,
    definition_radius_cost_hata,
    calculate_outage,
    power_calculation
} from './functions.js';

async function plotGraphsFromJSON(graphData) {
    console.log('plotGraphsFromJSON chamada com sucesso!', graphData);
    
    // Limpar elementos anteriores
    d3.select("svg").remove();
    d3.select(".tooltip").remove();
    d3.select(".erb-toggle").remove();
    
    // Configurações do SVG
    const margin = {top: 40, right: 120, bottom: 60, left: 60};
    const width = 1000 - margin.left - margin.right;
    const height = 800 - margin.top - margin.bottom;

    // Criar tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background", "rgba(255, 255, 255, 0.95)")
        .style("border", "1px solid #ddd")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .style("font-size", "13px")
        .style("box-shadow", "0 0 10px rgba(0,0,0,0.1)")
        .style("z-index", "10");

    // Criar SVG principal
    const svg = d3.select("#graph-container").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Encontrar os limites dos dados para a escala
    let allX = [], allY = [], allPower = [];
    graphData.forEach(data => {
        data.x.forEach(row => allX = allX.concat(row));
        data.y.forEach(row => allY = allY.concat(row));
        data.power.forEach(row => allPower = allPower.concat(row));
    });
    
    const minX = d3.min(allX), maxX = d3.max(allX);
    const minY = d3.min(allY), maxY = d3.max(allY);
    const minPower = d3.min(allPower), maxPower = d3.max(allPower);

    // Criar escalas
    const xScale = d3.scaleLinear()
        .domain([minX, maxX])
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([minY, maxY])
        .range([height, 0]);

    // Escala para cores (potência) com base nos dados reais
    const colorScale = d3.scaleSequential(d3.interpolateViridis)
        .domain([minPower, maxPower]);

    // Função para desenhar um hexágono
    function drawHexagon(vertices) {
        const points = vertices.map(v => [xScale(v.x), yScale(v.y)]);
        points.push(points[0]); // Fechar o hexágono
        return d3.line()(points);
    }

    // Extrair todos os hexágonos de todas as ERBs
    const allHexagons = [];
    graphData.forEach(data => {
        if (data.hexagon && data.erb !== "final") {
            allHexagons.push({
                erb: data.erb,
                hexagon: data.hexagon
            });
        }
    });

    // Processar os dados do JSON
    graphData.forEach((data, index) => {
        // Criar grupo para cada gráfico
        const group = svg.append("g")
            .attr("class", `graph-group graph-${data.erb}`)
            .attr("display", index === graphData.length - 1 ? "inline" : "none"); // Mostrar o último (final) inicialmente

        // Desenhar TODOS os hexágonos em cada gráfico
        allHexagons.forEach(hexData => {
            group.append("path")
                .attr("d", drawHexagon(hexData.hexagon))
                .attr("class", `hexagon hexagon-${hexData.erb}`)
                .attr("stroke", hexData.erb === data.erb ? "red" : "black")
                .attr("stroke-width", hexData.erb === data.erb ? 3 : 1)
                .attr("fill", "none")
                .attr("stroke-linejoin", "round");
        });

        // Converter matriz 2D em array de pontos
        const points = [];
        for (let i = 0; i < data.x.length; i++) {
            for (let j = 0; j < data.x[i].length; j++) {
                points.push({
                    x: data.x[i][j],
                    y: data.y[i][j],
                    power: data.power[i][j]
                });
            }
        }

        // Plotar os pontos de potência com interação
        group.selectAll(".power-point")
            .data(points)
            .enter()
            .append("circle")
            .attr("cx", d => xScale(d.x))
            .attr("cy", d => yScale(d.y))
            .attr("r", 3)
            .attr("fill", d => colorScale(d.power))
            .attr("opacity", 0.7)
            .attr("class", "power-point")
            .on("mouseover", function(event, d) {
                d3.select(this).attr("r", 5);
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`Potência: ${d.power.toFixed(2)} dBm<br>
                            X: ${d.x.toExponential(2)} m<br>
                            Y: ${d.y.toExponential(2)} m`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 30) + "px");
            })
            .on("mouseout", function() {
                d3.select(this).attr("r", 3);
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        // Adicionar rótulo para identificar a ERB principal
        if (data.erb !== "final") {
            group.append("text")
                .attr("x", xScale(data.hexagon[0].x))
                .attr("y", yScale(data.hexagon[0].y) - 15)
                .text(`ERB ${data.erb}`)
                .attr("font-weight", "bold")
                .attr("fill", "red")
                .attr("font-size", "14px");
        } else {
            group.append("text")
                .attr("x", width/2)
                .attr("y", -20)
                .text("Todas as ERBs (Potência Máxima)")
                .attr("font-weight", "bold")
                .attr("text-anchor", "middle")
                .attr("font-size", "16px");
        }
    });

    // Configuração dos eixos com notação científica
    const formatScientific = d3.format(".1e");
    const xAxis = d3.axisBottom(xScale)
        .tickFormat(d => {
            const formatted = formatScientific(d);
            return formatted.replace(/e\+?(-?\d+)/, '×10<sup>$1</sup>');
        });

    const yAxis = d3.axisLeft(yScale)
        .tickFormat(d => {
            const formatted = formatScientific(d);
            return formatted.replace(/e\+?(-?\d+)/, '×10<sup>$1</sup>');
        });

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    // Adicionar título do eixo X
    svg.append("text")
        .attr("transform", `translate(${width/2}, ${height + margin.top})`)
        .style("text-anchor", "middle")
        .text("Posição X (m)");

    // Adicionar título do eixo Y
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Posição Y (m)");

    // Adicionar controles de visualização
    addERBToggleButtons(graphData);
    addColorLegend(svg, colorScale, width, minPower, maxPower);
}

function addERBToggleButtons(graphData) {
    const toggleDiv = d3.select("#graph-controls").append("div")
        .attr("class", "erb-toggle")
        .style("margin-bottom", "20px")
        .style("text-align", "center");

    // Botão para cada gráfico
    graphData.forEach(data => {
        toggleDiv.append("button")
            .text(data.erb === "final" ? "Todas ERBs" : `ERB ${data.erb}`)
            .style("margin-right", "10px")
            .style("padding", "8px 15px")
            .style("background", data.erb === "final" ? "#4CAF50" : "#2196F3")
            .style("color", "white")
            .style("border", "none")
            .style("border-radius", "4px")
            .style("cursor", "pointer")
            .on("click", () => {
                d3.selectAll(".graph-group").style("display", "none");
                d3.select(`.graph-${data.erb}`).style("display", "inline");
            });
    });
}

function addColorLegend(svg, colorScale, width, minPower, maxPower) {
    const legendWidth = 100, legendHeight = 20;
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width - legendWidth - 20}, 40)`);
    
    // Título da legenda
    legend.append("text")
        .attr("x", legendWidth/2)
        .attr("y", -10)
        .text("Potência (dBm)")
        .attr("text-anchor", "middle")
        .attr("font-size", "12px");

    // Gradiente de cores
    const gradient = legend.append("defs")
        .append("linearGradient")
        .attr("id", "gradient")
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "100%").attr("y2", "0%");
    
    // Adicionar stops ao gradiente
    const stops = [0, 0.2, 0.4, 0.6, 0.8, 1];
    stops.forEach((stop, i) => {
        gradient.append("stop")
            .attr("offset", `${stop*100}%`)
            .attr("stop-color", colorScale(minPower + (maxPower - minPower) * stop));
    });
    
    // Retângulo com o gradiente
    legend.append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#gradient)");
    
    // Eixo da legenda
    const legendScale = d3.scaleLinear()
        .domain([minPower, maxPower])
        .range([0, legendWidth]);
    
    const legendAxis = d3.axisBottom(legendScale)
        .ticks(5)
        .tickFormat(d => d.toFixed(0));
    
    legend.append("g")
        .attr("transform", `translate(0,${legendHeight})`)
        .call(legendAxis)
        .selectAll("text")
        .attr("font-size", "10px");
}

const calculateReceivedPower = document.getElementById('calculateReceivedPower');
calculateReceivedPower.addEventListener('click', async(event) => {
    event.preventDefault(); 
    console.log('Calculando potência recebida...');
    
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
    const result = await power_calculation(frequency, radius);
    console.log(result);
    await plotGraphsFromJSON(result)
    console.log('Gráficos desenhados com sucesso!');
    

    document.getElementById('resultPower').classList.remove('hiddenResult');
    document.getElementById('resultPower').classList.add('showResult');
});

const calculateOutage = document.getElementById('calculateOutage');
calculateOutage.addEventListener('click', async(event) => {  
    event.preventDefault(); 
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
calculateRadius.addEventListener('click', async(event) => {
    event.preventDefault();     
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