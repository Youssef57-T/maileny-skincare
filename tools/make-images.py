# Builds the web images from assets/img/logo.png:
#   logo.webp  (560px, used by the hero; logo.png stays as the fallback)
#   og.jpg     (1200x630 social preview: the logo on a neumorphic blush disc)
# Run from the project folder:  python tools/make-images.py
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

img = Path(__file__).resolve().parent.parent / "assets" / "img"
logo = Image.open(img / "logo.png").convert("RGBA")

logo.resize((560, 560), Image.LANCZOS).save(img / "logo.webp", "WEBP", quality=88, method=6)

SURFACE, LIGHT, DARK = (247, 233, 236), (255, 255, 255), (220, 195, 201)
W, H, D = 1200, 630, 500
og = Image.new("RGB", (W, H), SURFACE)
x, y = (W - D) // 2, (H - D) // 2

def shadow(color, dx, dy, blur):
    # blur only the mask, so the edges fade into the surface instead of toward black
    mask = Image.new("L", (W, H), 0)
    ImageDraw.Draw(mask).ellipse((x + dx, y + dy, x + D + dx, y + D + dy), fill=255)
    og.paste(color, mask=mask.filter(ImageFilter.GaussianBlur(blur)))

shadow(DARK, 18, 18, 22)
shadow(LIGHT, -18, -18, 22)
ImageDraw.Draw(og).ellipse((x, y, x + D, y + D), fill=SURFACE)
inner = D - 60
og.paste(logo.resize((inner, inner), Image.LANCZOS), (x + 30, y + 30), logo.resize((inner, inner), Image.LANCZOS))
og.save(img / "og.jpg", "JPEG", quality=86, optimize=True, progressive=True)

for f in ("logo.png", "logo.webp", "og.jpg"):
    print(f"{f}: {(img / f).stat().st_size // 1024} KB")
