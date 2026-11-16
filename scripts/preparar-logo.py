import os
import sys
from collections import deque

from PIL import Image

ORIGEM = sys.argv[1] if len(sys.argv) > 1 else r"C:\Users\douto\Downloads\logo.png"
DESTINO = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "logo.png")
TOLERANCIA = 42


def distancia(a, b):
    return max(abs(a[0] - b[0]), abs(a[1] - b[1]), abs(a[2] - b[2]))


imagem = Image.open(ORIGEM).convert("RGBA")
largura, altura = imagem.size
pixels = imagem.load()

cantos = [(0, 0), (largura - 1, 0), (0, altura - 1), (largura - 1, altura - 1)]
fundo = [pixels[x, y][:3] for x, y in cantos]
referencia = max(set(fundo), key=fundo.count)

visitados = set()
fila = deque()
for ponto in cantos:
    if pixels[ponto][3] > 0 and distancia(pixels[ponto][:3], referencia) <= TOLERANCIA:
        fila.append(ponto)
        visitados.add(ponto)

while fila:
    x, y = fila.popleft()
    pixels[x, y] = (referencia[0], referencia[1], referencia[2], 0)
    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        vizinho = (x + dx, y + dy)
        if not (0 <= vizinho[0] < largura and 0 <= vizinho[1] < altura):
            continue
        if vizinho in visitados:
            continue
        cor = pixels[vizinho]
        if cor[3] > 0 and distancia(cor[:3], referencia) <= TOLERANCIA:
            visitados.add(vizinho)
            fila.append(vizinho)

recorte = imagem.getbbox()
if recorte:
    imagem = imagem.crop(recorte)

lado = max(imagem.size)
quadrado = Image.new("RGBA", (lado, lado), (0, 0, 0, 0))
quadrado.paste(imagem, ((lado - imagem.width) // 2, (lado - imagem.height) // 2), imagem)
if lado > 512:
    quadrado = quadrado.resize((512, 512), Image.LANCZOS)

os.makedirs(os.path.dirname(DESTINO), exist_ok=True)
quadrado.save(DESTINO, "PNG")
print("logo gerada:", DESTINO, quadrado.size, "| pixels de fundo removidos:", len(visitados))
