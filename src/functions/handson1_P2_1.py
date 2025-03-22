import numpy as np
import matplotlib.pyplot as plt
from fDrawDeploy import fDrawDeploy
import sys

# Receber parâmetros da linha de comando
if len(sys.argv) < 3:
    print("Uso: python handson1_P2_1.py <frequência> <raio>")
    sys.exit(1)

dFc = float(sys.argv[1])  # Frequência da portadora (MHz)
dR = float(sys.argv[2])  # Raio do hexágono (m)

# Cálculos de outras variáveis que dependem dos parâmetros de entrada
dPasso = int(np.ceil(dR / 10))  # Resolução do grid: distância entre pontos de medição
dDimX = 5 * dR  # Dimensão X do grid
dDimY = 6 * np.sqrt(3 / 4) * dR  # Dimensão Y do grid

# Vetor com posições das BSs (grid Hexagonal com 7 células, uma célula central e uma camada de células ao redor)
vtBs = [0]
dOffset = np.pi / 6
for iBs in range(2, 8):
    vtBs.append(dR * np.sqrt(3) * np.exp(1j * ((iBs - 2) * np.pi / 3 + dOffset)))

vtBs = np.array(vtBs) + (dDimX / 2 + 1j * dDimY / 2)

# Desenha setores hexagonais
fDrawDeploy(dR, vtBs)
plt.axis('equal')
plt.title('Deployment of 7 Hexagonal Cells')
plt.show()