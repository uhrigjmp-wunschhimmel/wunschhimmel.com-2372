"""
Wunschhimmel — Social Media Format Specs
Generates a visual reference sheet for all required social formats
"""
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch
import numpy as np

fig, axes = plt.subplots(2, 4, figsize=(16, 9))
fig.patch.set_facecolor('#FFF5F7')

formats = [
    {"name": "Instagram Post", "w": 1080, "h": 1080, "ratio": "1:1", "color": "#FF6B9D"},
    {"name": "Instagram Story", "w": 1080, "h": 1920, "ratio": "9:16", "color": "#A78BFA"},
    {"name": "IG Highlight Cover", "w": 1080, "h": 1080, "ratio": "1:1", "color": "#FFB347"},
    {"name": "Pinterest Pin", "w": 1000, "h": 1500, "ratio": "2:3", "color": "#FF6B9D"},
    {"name": "LinkedIn Post", "w": 1200, "h": 627, "ratio": "1.91:1", "color": "#2D1B69"},
    {"name": "Email Header", "w": 600, "h": 200, "ratio": "3:1", "color": "#A78BFA"},
    {"name": "OG Image", "w": 1200, "h": 630, "ratio": "1.91:1", "color": "#34D399"},
    {"name": "TikTok Video", "w": 1080, "h": 1920, "ratio": "9:16", "color": "#FF6B9D"},
]

for ax, fmt in zip(axes.flat, formats):
    ratio_w = 1080
    ratio_h = fmt["h"] / fmt["w"] * 1080 if fmt["h"] > fmt["w"] else 1080
    ratio_w = fmt["w"] / fmt["h"] * 1080 if fmt["w"] > fmt["h"] else ratio_w

    # Draw format card
    card = FancyBboxPatch((0.05, 0.05), 0.9, 0.9,
                           boxstyle="round,pad=0.05",
                           facecolor=fmt["color"] + "20",
                           edgecolor=fmt["color"], linewidth=2)
    ax.add_patch(card)

    # Inner ratio rectangle
    max_w, max_h = 0.7, 0.5
    aspect = fmt["w"] / fmt["h"]
    if aspect >= 1:
        bw, bh = max_w, max_w / aspect
    else:
        bh, bw = max_h, max_h * aspect
    bx = 0.5 - bw/2
    by = 0.45 - bh/2
    inner = FancyBboxPatch((bx, by), bw, bh,
                            boxstyle="round,pad=0.02",
                            facecolor=fmt["color"] + "40",
                            edgecolor=fmt["color"], linewidth=1.5)
    ax.add_patch(inner)

    ax.text(0.5, 0.88, fmt["name"], ha='center', va='center',
            fontsize=9, fontweight='bold', color='#1A0A3C')
    ax.text(0.5, 0.18, fmt["ratio"], ha='center', va='center',
            fontsize=8, color=fmt["color"], fontweight='bold')
    ax.text(0.5, 0.10, f'{fmt["w"]}×{fmt["h"]}px', ha='center', va='center',
            fontsize=7, color='#7B6FA0')

    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')

plt.suptitle('Wunschhimmel — Social Media Format Reference', 
             fontsize=14, fontweight='bold', color='#2D1B69', y=0.98)
plt.tight_layout(pad=0.5)
plt.savefig('/home/user/wunschhimmel/public/social-formats-ref.png', 
            dpi=120, bbox_inches='tight', facecolor='#FFF5F7')
print("Generated: social-formats-ref.png")
