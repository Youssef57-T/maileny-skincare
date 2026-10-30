# Crops the round logo out of the Instagram post screenshot, paints over
# the carousel arrow, and saves a transparent circular PNG.
import sys, math
from PIL import Image, ImageDraw

src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGB")
px = im.load()
cx, cy = 703.5, 566.0
R = 449

def pink(p):
    r, g, b = p
    return r > 225 and 165 < g < 220 and 170 < b < 225

# ring thickness measured on the clean left side
x = 253
while pink(px[x, int(cy)]): x += 1
inner = cx - x + 1
ring = px[262, int(cy)]
print("ring inner radius", inner, "ring color", ring)

# repaint the arrow button (right side of the ring)
for y in range(540, 590):
    for x in range(1105, 1160):
        if math.hypot(x - cx, y - cy) < inner:
            px[x, y] = (255, 255, 255)

# redraw the whole outer ring flat; the screenshot clips its bottom edge
# and the arrow sat on top of it
W, H = im.size
for y in range(int(cy - R) - 1, int(cy + R) + 2):
    for x in range(int(cx - R) - 1, int(cx + R) + 2):
        if 0 <= x < W and 0 <= y < H and math.hypot(x - cx, y - cy) >= inner - 1:
            px[x, y] = ring

box = (round(cx - R), round(cy - R), round(cx + R), round(cy + R))
crop = im.crop(box)
size = crop.size[0]
scale = 4
mask = Image.new("L", (size * scale, size * scale), 0)
ImageDraw.Draw(mask).ellipse((0, 0, size * scale - 1, size * scale - 1), fill=255)
mask = mask.resize((size, size), Image.LANCZOS)
crop.putalpha(mask)
crop.resize((800, 800), Image.LANCZOS).save(out)
crop.resize((192, 192), Image.LANCZOS).save(out.replace(".png", "-192.png"))
crop.resize((64, 64), Image.LANCZOS).save(out.replace("logo.png", "favicon.png"))
print("saved", out)
