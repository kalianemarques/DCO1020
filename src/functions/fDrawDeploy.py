import matplotlib.pyplot as plt
from fDrawSector import draw_sector

def fDrawDeploy(dR, vtBs):
    """
    Desenha setores hexagonais e plota as posições das estações base (BSs).
    """
    plt.gca().set_aspect('equal', adjustable='box')
    plt.grid(True)
    
    # Desenha os setores hexagonais
    for iBsD in range(len(vtBs)):
        draw_sector(dR, vtBs[iBsD])
    
    # Plota as estações base (BSs)
    plt.plot(vtBs.real, vtBs.imag, 'sk')  # 'sk' para marcadores quadrados pretos