import numpy as np
import matplotlib.pyplot as plt
from matplotlib.ticker import ScalarFormatter
from fDrawDeploy import fDrawDeploy
import sys
import os

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

# Configuração para notação científica nos eixos
formatter = ScalarFormatter(useMathText=True)
formatter.set_powerlimits((-2, 2))  # Define os limites para usar notação científica

# Diretório de saída para salvar os gráficos
output_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'output')
os.makedirs(output_dir, exist_ok=True)  # Cria o diretório se não existir

# Calcular o REM de cada ERB e acumular a maior potência em cada ponto de medição
for iBsD in range(len(vtBs)):  # Loop nas 7 ERBs
    mtPosEachBS = (mtPosx + 1j * mtPosy) - vtBs[iBsD]
    mtDistEachBs = np.abs(mtPosEachBS)
    mtDistEachBs[mtDistEachBs < dRMin] = dRMin

    # Okumura-Hata (cidade urbana) - dB
    mtPldB = 69.55 + 26.16 * np.log10(dFc) + (44.9 - 6.55 * np.log10(dHBs)) * np.log10(mtDistEachBs / 1e3) - 13.82 * np.log10(dHBs) - dAhm
    mtPowerEachBSdBm = dPtdBm - mtPldB

    # Plot da REM de cada ERB individualmente
    plt.figure()
    plt.pcolormesh(mtPosx, mtPosy, mtPowerEachBSdBm, shading='auto', cmap='viridis')
    plt.colorbar(label='Potência (dBm)')
    fDrawDeploy(dR, vtBs)
    plt.gca().set_aspect('equal', adjustable='box')
    plt.gca().xaxis.set_major_formatter(formatter)
    plt.gca().yaxis.set_major_formatter(formatter)
    plt.title(f'ERB {iBsD + 1}')
    plt.xlabel('Posição X (m)')
    plt.ylabel('Posição Y (m)')
    plt.tight_layout()

    # Salvar o gráfico no diretório de saída
    plt.savefig(os.path.join(output_dir, f'grafico_erb_{iBsD + 1}.png'))
    plt.close()

    # Cálculo da maior potência em cada ponto de medição
    mtPowerFinaldBm = np.maximum(mtPowerFinaldBm, mtPowerEachBSdBm)

# Plot da REM de todo o grid (composição das 7 ERBs)
plt.figure()
plt.pcolormesh(mtPosx, mtPosy, mtPowerFinaldBm, shading='auto', cmap='viridis')
plt.colorbar(label='Potência (dBm)')
fDrawDeploy(dR, vtBs)
plt.gca().set_aspect('equal', adjustable='box')
plt.gca().xaxis.set_major_formatter(formatter)
plt.gca().yaxis.set_major_formatter(formatter)
plt.title('Todas as 7 ERBs')
plt.xlabel('Posição X (m)')
plt.ylabel('Posição Y (m)')
plt.tight_layout()

# Salvar o gráfico final no diretório de saída
final_graph_path = os.path.join(output_dir, 'grafico_final.png')
plt.savefig(final_graph_path)
plt.close()

# Retorna o caminho do gráfico final como saída
print(final_graph_path)