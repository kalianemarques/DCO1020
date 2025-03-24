import numpy as np
import sys
import json

# Receber parâmetros da linha de comando
if len(sys.argv) < 2:
    print("Uso: python Entrega1.py <frequência>")
    sys.exit(1)

dFc = float(sys.argv[1])  # Frequência da portadora (MHz)

# Parâmetros fixos
dSensitivity = -104  # Sensibilidade do receptor
dPtdBm = 57  # EIRP (incluindo ganho e perdas)
dHMob = 5  # Altura do receptor
dHBs = 30  # Altura do transmissor
dAhm = 3.2 * (np.log10(11.75 * dHMob)) ** 2 - 4.97  # Modelo Okumura-Hata: Cidade grande e fc >= 400MHz
dPasso = 1000  # Resolução inicial do grid (ajustável)

# Função para calcular a taxa de outage
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
        mtDistEachBs = np.abs(mtPosEachBS)
        mtDistEachBs[mtDistEachBs < dRMin] = dRMin

        # Okumura-Hata (cidade urbana) - dB
        mtPldB = 69.55 + 26.16 * np.log10(dFc) + (44.9 - 6.55 * np.log10(dHBs)) * np.log10(mtDistEachBs / 1e3) - 13.82 * np.log10(dHBs) - dAhm
        mtPowerEachBSdBm = dPtdBm - mtPldB

        # Cálculo da maior potência em cada ponto de medição
        mtPowerFinaldBm = np.maximum(mtPowerFinaldBm, mtPowerEachBSdBm)

    # Outage (limite 10%)
    dOutRate = 100 * len(np.where(mtPowerFinaldBm < dSensitivity)[0]) / mtPowerFinaldBm.size

    return dOutRate

# Função para encontrar o maior raio com Outage <= 10%
def find_max_radius(dFc, target_outage=10, tolerance=0.1):
    dR_min = 100  # Raio mínimo inicial (m)
    dR_max = 50000  # Raio máximo inicial (m)
    dR = (dR_min + dR_max) / 2  # Raio inicial (m)

    while dR_max - dR_min > tolerance:
        outage = calculate_outage(dR, dFc)
        if outage > target_outage:
            dR_max = dR  # Reduz o raio máximo
        else:
            dR_min = dR  # Aumenta o raio mínimo
        dR = (dR_min + dR_max) / 2  # Atualiza o raio

    return dR

# Determinar o maior raio com Outage <= 10%
dR = find_max_radius(dFc)

# Calcular a taxa de Outage para o raio encontrado
dOutRate = calculate_outage(dR, dFc)

# Retornar o resultado como JSON
result = {
    "frequência": dFc,
    "raio_aproximado": dR,
    "taxa_de_outage": dOutRate
}
print(json.dumps(result))