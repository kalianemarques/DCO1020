import numpy as np
import matplotlib.pyplot as plt

def draw_sector(d_r, d_center):
    # Initialize empty array for hexagon vertices
    vt_hex = np.zeros(6, dtype=complex)
    
    # Calculate vertices
    for ie in range(6):
        vt_hex[ie] = d_r * (np.cos(ie * np.pi/3) + 1j * np.sin(ie * np.pi/3))
    
    # Add center offset
    vt_hex = vt_hex + d_center
    
    # Add first point to end to close the hexagon
    vt_hex_plot = np.append(vt_hex, vt_hex[0])
    
    # Plot the hexagon
    plt.plot(vt_hex_plot.real, vt_hex_plot.imag, 'k-')