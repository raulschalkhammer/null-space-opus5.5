"""Measure a video's visual pacing: how often the picture changes, hard cuts, and how much of it is nearly still.

Usage: python data-scripts/pacing.py <video.mp4> [more videos...]
Needs Pillow and numpy. Uses the ffmpeg bundled with Remotion (this build has no select/fps filters, so frames
are pulled with -r and -s). Reference, the first 5:22 of Kurzgesagt's "A.I. Humanity's Final Invention?":
a new look every 2.7 s, 25 hard cuts, nearly still 7% of the time.
"""
import glob, os, subprocess, sys, tempfile
import numpy as np
from PIL import Image

# Remotion's compositor ffmpeg for this machine (linux, darwin or win32)
FF = next(d for d in sorted(glob.glob('node_modules/@remotion/compositor-*')) if os.path.exists(os.path.join(d, 'ffmpeg')) or os.path.exists(os.path.join(d, 'ffmpeg.exe')))
for video in sys.argv[1:]:
    with tempfile.TemporaryDirectory() as tmp:
        subprocess.run([os.path.join(FF, 'ffmpeg'), '-y', '-hide_banner', '-loglevel', 'error', '-i', video, '-r', '6', '-s', '96x54', f'{tmp}/%05d.png'], check=True, env={**os.environ, 'LD_LIBRARY_PATH': FF, 'DYLD_LIBRARY_PATH': FF})
        A = np.stack([np.asarray(Image.open(f).convert('RGB'), dtype=np.float32) for f in sorted(glob.glob(f'{tmp}/*.png'))])
    # a new "look": the picture differs strongly from where the current look started (at most one per 2 s)
    anchor, looks = 0, [0]
    for i in range(1, len(A)):
        if np.abs(A[i] - A[anchor]).mean() > 28 and i - anchor >= 12:
            anchor = i
            looks.append(i)
    holds = np.diff(looks + [len(A)]) / 6
    step = np.abs(A[1:] - A[:-1]).mean(axis=(1, 2, 3))
    cuts = [i for i in range(1, len(step) - 1) if step[i] > 25 and step[i] > 3 * max(step[i - 1], step[i + 1], 1)]
    motion = np.abs(A[6:] - A[:-6]).mean(axis=(1, 2, 3))
    print(f'{video}: {len(A) / 6:.0f}s, new look every {holds.mean():.1f}s (longest {holds.max():.1f}s), {len(cuts)} hard cuts, nearly still {100 * (motion < 2).mean():.0f}%')
