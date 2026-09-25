"""Tile rendered review frames into contact sheets, labelled with frame number and time.

Usage: python data-scripts/contact-sheet.py <framesDir> <outPrefix> [perSheet=25] [fps=24]
Frames come from data-scripts/frames.mjs (files named ...-<frame>.jpeg or .png). Needs Pillow.
"""
import glob, re, sys
from PIL import Image, ImageDraw

d, out = sys.argv[1], sys.argv[2]
per = int(sys.argv[3]) if len(sys.argv) > 3 else 25
fps = int(sys.argv[4]) if len(sys.argv) > 4 else 24
num = lambda p: int(re.findall(r'(\d+)\.(?:jpe?g|png)$', p)[0])
fs = sorted(glob.glob(d + '/*.jpeg') + glob.glob(d + '/*.jpg') + glob.glob(d + '/*.png'), key=num)
W, H, cols = 480, 270, 5
for s in range(0, len(fs), per):
    chunk = fs[s:s + per]
    rows = (len(chunk) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * W, rows * (H + 18)), 'black')
    draw = ImageDraw.Draw(sheet)
    for i, f in enumerate(chunk):
        x, y = (i % cols) * W, (i // cols) * (H + 18)
        sheet.paste(Image.open(f).convert('RGB').resize((W, H)), (x, y))
        fr = num(f)
        draw.text((x + 4, y + H + 3), f'f{fr}  {fr // fps // 60}:{fr // fps % 60:02d}', fill='white')
    sheet.save(f'{out}{s // per}.png')
    print(f'{out}{s // per}.png')
