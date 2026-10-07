"""Regenerate public/media/aist-pinhole.jpg: a pinhole view cut out of the raw 3DGRUT panorama.

The run shows it as a splat billboard in the vestibule, where the story starts from "a plain
pinhole video". The source footage itself is third-party video and is never shown on the site:
this picture is a reprojection of a render (public/media/pano-raw.jpg, the raw 3DGRUT panorama),
at the field of view of the source camera used during development (93.72 x 60.93 degrees).

  python tools/pinhole.py [yaw_deg] [pitch_deg]

Needs: python with numpy and Pillow.
"""
import math
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
MEDIA = ROOT / 'public' / 'media'
HFOV, VFOV = 93.72, 60.93          # source camera of the development clip (README of artifixer-360-pipeline)
W = 640
YAW = float(sys.argv[1]) if len(sys.argv) > 1 else 22.0     # centre of the view, degrees right of the panorama centre
PITCH = float(sys.argv[2]) if len(sys.argv) > 2 else -2.0   # degrees above the horizon

erp = np.asarray(Image.open(MEDIA / 'pano-raw.jpg').convert('RGB'), dtype=np.float32)
eh, ew, _ = erp.shape

f = (W / 2) / math.tan(math.radians(HFOV) / 2)
H = int(round(2 * f * math.tan(math.radians(VFOV) / 2) / 2)) * 2
xs, ys = np.meshgrid(np.arange(W) + 0.5 - W / 2, np.arange(H) + 0.5 - H / 2)
d = np.stack([xs, -ys, np.full_like(xs, f)], axis=-1)
d /= np.linalg.norm(d, axis=-1, keepdims=True)
cp, sp = math.cos(math.radians(PITCH)), math.sin(math.radians(PITCH))
cy, sy = math.cos(math.radians(YAW)), math.sin(math.radians(YAW))
x, y, z = d[..., 0], d[..., 1] * cp + d[..., 2] * sp, -d[..., 1] * sp + d[..., 2] * cp
x, z = x * cy + z * sy, -x * sy + z * cy
lon, lat = np.arctan2(x, z), np.arcsin(np.clip(y, -1, 1))
u = (lon / (2 * math.pi) + 0.5) * ew - 0.5
v = (0.5 - lat / math.pi) * eh - 0.5
u0, v0 = np.floor(u).astype(int), np.floor(v).astype(int)
fu, fv = (u - u0)[..., None], (v - v0)[..., None]
v0c, v1c = np.clip(v0, 0, eh - 1), np.clip(v0 + 1, 0, eh - 1)
u0w, u1w = u0 % ew, (u0 + 1) % ew
out = (erp[v0c, u0w] * (1 - fu) * (1 - fv) + erp[v0c, u1w] * fu * (1 - fv)
       + erp[v1c, u0w] * (1 - fu) * fv + erp[v1c, u1w] * fu * fv)
dst = MEDIA / 'aist-pinhole.jpg'
Image.fromarray(np.clip(out + 0.5, 0, 255).astype(np.uint8)).save(dst, quality=84, optimize=True, progressive=True)
print(dst.name, (W, H), dst.stat().st_size, 'bytes')
