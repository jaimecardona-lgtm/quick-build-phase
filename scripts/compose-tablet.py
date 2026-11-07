#!/usr/bin/env python3
"""Compone las capturas de Logixtic dentro de la pantalla física de la tablet con manos.

Equivalente sin OpenCV de tools/compose_tablet.py del kit:
  1. Homografía que lleva el rectángulo de la captura (1000x848) al cuadrilátero interior del vidrio.
  2. La captura se proyecta solo dentro de ese cuadrilátero (máscara con antialias).
  3. El marco físico (con la abertura transparente) va por encima: manos, dedos y bisel quedan delante.

Entradas (rutas relativas a la raíz del repositorio):
  --frame   PNG nativo de la tablet con manos (1122x1402, abertura transparente)
  --coords  tablet-screen-coordinates.json (cuatro esquinas interiores del vidrio)
  --screens capturas ya recortadas a 1000x848 (public/zenox-kit/screens/*.webp)
Salida: una imagen 1122x1402 por captura.

Uso:
  python scripts/compose-tablet.py --frame <marco.png> --coords <coords.json> \
      --screen documentos=public/zenox-kit/screens/documentos.webp ... --out-dir public/zenox-kit/devices
"""
import argparse, json
from pathlib import Path
from PIL import Image, ImageDraw


def solve(A, b):
    """Eliminación gaussiana para sistemas pequeños (8x8)."""
    n = len(b)
    M = [row[:] + [b[i]] for i, row in enumerate(A)]
    for c in range(n):
        p = max(range(c, n), key=lambda r: abs(M[r][c]))
        M[c], M[p] = M[p], M[c]
        pv = M[c][c]
        M[c] = [v / pv for v in M[c]]
        for r in range(n):
            if r != c and M[r][c] != 0:
                f = M[r][c]
                M[r] = [a - f * bb for a, bb in zip(M[r], M[c])]
    return [M[i][n] for i in range(n)]


def homography(src, dst):
    """Matriz 3x3 (h33=1) que lleva src -> dst (cuatro puntos cada uno)."""
    A, b = [], []
    for (x, y), (X, Y) in zip(src, dst):
        A.append([x, y, 1, 0, 0, 0, -x * X, -y * X]); b.append(X)
        A.append([0, 0, 0, x, y, 1, -x * Y, -y * Y]); b.append(Y)
    h11, h12, h13, h21, h22, h23, h31, h32 = solve(A, b)
    return [[h11, h12, h13], [h21, h22, h23], [h31, h32, 1.0]]


def invert3(m):
    (a, b, c), (d, e, f), (g, h, i) = m
    A = e * i - f * h; B = -(d * i - f * g); C = d * h - e * g
    det = a * A + b * B + c * C
    inv = [
        [A, -(b * i - c * h), b * f - c * e],
        [B, a * i - c * g, -(a * f - c * d)],
        [C, -(a * h - b * g), a * e - b * d],
    ]
    return [[v / det for v in row] for row in inv]


def compose(frame_path, quad, screen_path, out_path, supersample=4):
    frame = Image.open(frame_path).convert("RGBA")
    W, H = frame.size
    content = Image.open(screen_path).convert("RGB")
    sw, sh = content.size
    # PIL recorre píxeles del lienzo (dst) y lee la captura (src): necesita dst -> src.
    # La homografía calculada es quad -> rectángulo de la captura, que es exactamente ese sentido.
    src = [(0, 0), (sw, 0), (sw, sh), (0, sh)]
    Hm = homography(quad, src)
    coeffs = (Hm[0][0], Hm[0][1], Hm[0][2], Hm[1][0], Hm[1][1], Hm[1][2], Hm[2][0], Hm[2][1])
    warped = content.transform((W, H), Image.Transform.PERSPECTIVE, coeffs, Image.Resampling.BICUBIC).convert("RGBA")
    # Máscara exacta del cuadrilátero, con antialias por supermuestreo.
    big = Image.new("L", (W * supersample, H * supersample), 0)
    ImageDraw.Draw(big).polygon([(x * supersample, y * supersample) for x, y in quad], fill=255)
    mask = big.resize((W, H), Image.Resampling.LANCZOS)
    warped.putalpha(mask)
    result = Image.alpha_composite(warped, frame)
    Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    result.save(out_path, "WEBP", quality=92, method=6)
    return result


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--frame", required=True)
    p.add_argument("--coords", required=True)
    p.add_argument("--screen", action="append", required=True, help="nombre=ruta de la captura 1000x848")
    p.add_argument("--out-dir", required=True)
    a = p.parse_args()
    d = json.load(open(a.coords, encoding="utf-8"))
    quad = [tuple(pt) for pt in d["quad_top_left_top_right_bottom_right_bottom_left"]]
    for item in a.screen:
        name, path = item.split("=", 1)
        out = Path(a.out_dir) / f"tablet-{name}.webp"
        compose(a.frame, quad, path, out)
        print("generado", out)


if __name__ == "__main__":
    main()
