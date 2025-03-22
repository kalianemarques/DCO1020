import numpy as np
import sys
import json

# Receber parâmetros da linha de comando
if len(sys.argv) < 3:
    print("Uso: python Entrega2.py <frequência> <raio>")
    sys.exit(1)

dFc = float(sys.argv[1])  # Frequência da portadora (MHz)
dR = float(sys.argv[2])  # Raio do hexágono (m)

# Parâmetros fixos
dSensitivity = -104  # Sensibilidade do receptor
dPtdBm = 57  # EIRP (incluindo ganho e perdas)
dHMob = 5  # Altura do receptor
dHBs = 30  # Altura do transmissor
dPasso = 1000  # Resolução inicial do grid (ajustável)
C = 3  # Constante de ajuste para áreas metropolitanas

# Função para calcular a correção para a altura do receptor móvel
def correction_hm(h_M, f):
    if f > 1500:  # Frequências acima de 1500 MHz
        return 3.2 * (np.log10(11.75 * h_M))**2 - 4.97
    else:  # Frequências abaixo de 1500 MHz
        return 0

# Função para calcular a taxa de outage usando o modelo COST-Hata
def calculate_outage(dR, dFc):
    dDimX = 5 * dR  # Dimensão X do grid
    dDimY = 6 * np.sqrt(3 / 4) * dR  # Dimensão Y do grid
    dRMin = dPasso  # Raio de segurança

    # Vetor com posições das BSs (grid Hexagonal com 7 células, uma célula central e uma camada de células ao redor)
    vtBs = [0]
    dOffset = np.pi / 6
    for iBs in range(2, 8):
        vtBs.append(dR * np.sqrt(3) * np.exp(1j * ((iBs - 2) * np.pi / 3 + dOffset)))
    vtBs = np.array(vtBs) + (dDimX / 2 + 1j * dDimY / 2)  # Ajuste de posição das bases

    # Matriz de referência com posição de cada ponto do grid
    dDimY = int(np.ceil(dDimY + (dDimY % dPasso)))
    dDimX = int(np.ceil(dDimX + (dDimX % dPasso)))
    mtPosx, mtPosy = np.meshgrid(np.arange(0, dDimX + dPasso, dPasso), np.arange(0, dDimY + dPasso, dPasso))

    # Iniciação da Matriz de potência recebida máxima em cada ponto medido
    mtPowerFinaldBm = -np.inf * np.ones_like(mtPosy)

    # Calcular o REM de cada ERB e acumular a maior potência em cada ponto de medição
    for iBsD in range(len(vtBs)):
        mtPosEachBS = (mtPosx + 1j * mtPosy) - vtBs[iBsD]
        mtDistEachBs = np.abs(mtPosEachBS) / 1e3  # Converter para km
        mtDistEachBs[mtDistEachBs < dRMin / 1e3] = dRMin / 1e3  # Raio mínimo em km

        # Modelo COST-Hata (cidade urbana) - dB
        a_hm = correction_hm(dHMob, dFc)
        mtPldB = (
            46.3
            + 33.9 * np.log10(dFc)
            - 13.82 * np.log10(dHBs)
            - a_hm
            + (44.9 - 6.55 * np.log10(dHBs)) * np.log10(mtDistEachBs)
            + C
        )
        mtPowerEachBSdBm = dPtdBm - mtPldB

        # Cálculo da maior potência em cada ponto de medição
        mtPowerFinaldBm = np.maximum(mtPowerFinaldBm, mtPowerEachBSdBm)

    # Outage (limite 10%)
    dOutRate = 100 * len(np.where(mtPowerFinaldBm < dSensitivity)[0]) / mtPowerFinaldBm.size

    return dOutRate

# Calcular a taxa de outage e retornar como JSON
dOutRate = calculate_outage(dR, dFc)
result = {
    "frequência": dFc,
    "raio": dR,
    "taxa_de_outage": dOutRate
}
print(json.dumps(result))