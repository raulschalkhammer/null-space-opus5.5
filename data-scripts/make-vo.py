"""Generate narration with Kokoro-82M (Apache-2.0) via kokoro-onnx, one WAV per line, and record durations.

Usage: python data-scripts/make-vo.py <kokoro-v1.0.onnx> <voices-v1.0.bin>
Model files: https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0
"""
import json, sys, pathlib
import soundfile as sf
from kokoro_onnx import Kokoro

root = pathlib.Path(__file__).resolve().parent.parent
script = json.loads((root / 'story/track-layer-vo.json').read_text())
kokoro = Kokoro(sys.argv[1], sys.argv[2])
out = root / 'public/audio/vo'
out.mkdir(parents=True, exist_ok=True)
durations = {}
for line in script['lines']:
    samples, sr = kokoro.create(line['text'], voice=script['voice'], speed=script['speed'], lang='en-us')
    sf.write(out / f"{line['id']}.wav", samples, sr, subtype='PCM_16')
    durations[line['id']] = round(len(samples) / sr, 3)
    print(line['id'], durations[line['id']], 's')
(root / 'fixtures/track-layer-vo.json').write_text(json.dumps({'voice': script['voice'], 'lines': [{**l, 'duration': durations[l['id']]} for l in script['lines']]}, indent=2) + '\n')
