import numpy as np
import sys
import json

# Receber parâmetros da linha de comando
if len(sys.argv) < 3:
    print("Uso: python handson1_p3_1.py <frequência> <raio>")
    sys.exit(1)

dFc = float(sys.argv[1])  # Frequência da portadora (MHz)
dR = float(sys.argv[2])  # Raio do hexágono (m)

# Cálculos de outras variáveis que dependem dos parâmetros de entrada
dPasso = int(np.ceil(dR / 10))  # Resolução do grid: distância entre pontos de medição
dRMin = dPasso  # Raio de segurança
dDimX = 5 * dR  # Dimensão X do grid
dDimY = 6 * np.sqrt(3 / 4) * dR  # Dimensão Y do grid
dPtdBm = 57  # EIRP (incluindo ganho e perdas)
dHMob = 5  # Altura do receptor
dHBs = 30  # Altura do transmissor
dAhm = 3.2 * (np.log10(11.75 * dHMob)) ** 2 - 4.97  # Modelo Okumura-Hata: Cidade grande e fc >= 400MHz

# Vetor com posições das BSs (grid Hexagonal com 7 células, uma célula central e uma camada de células ao redor)
vtBs = [0]
dOffset = np.pi / 6
for iBs in range(2, 8):
    vtBs.append(dR * np.sqrt(3) * np.exp(1j * ((iBs - 2) * np.pi / 3 + dOffset)))

vtBs = np.array(vtBs) + (dDimX / 2 + 1j * dDimY / 2)  # Ajuste de posição das bases (posição relativa ao canto inferior esquerdo)

# Matriz de referência com posição de cada ponto do grid (posição relativa ao canto inferior esquerdo)
dDimY = dDimY + (dDimY % dPasso)  # Ajuste de dimensão para medir toda a dimensão do grid
dDimX = dDimX + (dDimX % dPasso)  # Ajuste de dimensão para medir toda a dimensão do grid
mtPosx, mtPosy = np.meshgrid(np.arange(0, dDimX + dPasso, dPasso), np.arange(0, dDimY + dPasso, dPasso))

# Iniciação da Matriz de potência recebida máxima em cada ponto medido
mtPowerFinaldBm = -np.inf * np.ones_like(mtPosy)

# Dados para os gráficos
graph_data = []

# Função para calcular os vértices de um hexágono
def calculate_hexagon_vertices(center, radius):
    vertices = []
    for i in range(6):
        angle = 2 * np.pi * i / 6
        vertex = center + radius * (np.cos(angle) + 1j * np.sin(angle))
        vertices.append({"x": vertex.real, "y": vertex.imag})
    return vertices

# Calcular o REM de cada ERB e acumular a maior potência em cada ponto de medição
for iBsD in range(len(vtBs)):  # Loop nas 7 ERBs
    mtPosEachBS = (mtPosx + 1j * mtPosy) - vtBs[iBsD]
    mtDistEachBs = np.abs(mtPosEachBS)
    mtDistEachBs[mtDistEachBs < dRMin] = dRMin

    # Okumura-Hata (cidade urbana) - dB
    mtPldB = 69.55 + 26.16 * np.log10(dFc) + (44.9 - 6.55 * np.log10(dHBs)) * np.log10(mtDistEachBs / 1e3) - 13.82 * np.log10(dHBs) - dAhm
    mtPowerEachBSdBm = dPtdBm - mtPldB

    # Adicionar os dados do gráfico ao vetor
    graph_data.append({
        "erb": iBsD + 1,
        "x": mtPosx.tolist(),
        "y": mtPosy.tolist(),
        "power": mtPowerEachBSdBm.tolist(),
        "hexagon": calculate_hexagon_vertices(vtBs[iBsD], dR)
    })

    # Cálculo da maior potência em cada ponto de medição
    mtPowerFinaldBm = np.maximum(mtPowerFinaldBm, mtPowerEachBSdBm)

# Adicionar os dados do gráfico final (composição das 7 ERBs)
graph_data.append({
    "erb": "final",
    "x": mtPosx.tolist(),
    "y": mtPosy.tolist(),
    "power": mtPowerFinaldBm.tolist()
})

# Retornar os dados como JSON
print(json.dumps(graph_data))