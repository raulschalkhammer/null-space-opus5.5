"""Generate narration with a Resemble AI voice, one WAV per line, and record the durations the timelines run on.

Usage: RESEMBLE_API_KEY=... python data-scripts/make-vo-resemble.py <voice_uuid> <script.json> <out-dir> <fixture.json> [--only=ID,ID]
The API key is read from the environment only; never put it in a file.
Writes 16-bit mono WAV at 44.1 kHz (what make-audio-paper.ts reads), trims the silence Resemble leaves at the
start and end of each clip (so line timing stays tight), and keeps 60 ms of air on either side.
API: https://docs.resemble.ai/api-reference/text-to-speech/synthesize
"""
import base64, io, json, os, pathlib, sys, time, urllib.error, urllib.request, wave
import numpy as np

URL = 'https://f.cluster.resemble.ai/synthesize'
RATE = 44100
PAD = int(0.06 * RATE)

args = [a for a in sys.argv[1:] if not a.startswith('--')]
opts = dict(a[2:].split('=', 1) for a in sys.argv[1:] if a.startswith('--') and '=' in a)
voice, script_path, out_dir, fixture_path = args
key = os.environ.get('RESEMBLE_API_KEY')
if not key:
    sys.exit('Set RESEMBLE_API_KEY in the environment first.')
root = pathlib.Path(__file__).resolve().parent.parent
script = json.loads((root / script_path).read_text())
out = root / out_dir
out.mkdir(parents=True, exist_ok=True)
only = set(opts['only'].split(',')) if 'only' in opts else None


def synth(text):
    body = json.dumps({'voice_uuid': voice, 'data': text, 'output_format': 'wav', 'precision': 'PCM_16', 'sample_rate': RATE}).encode()
    for attempt in range(4):
        req = urllib.request.Request(URL, data=body, headers={'Authorization': f'Bearer {key}', 'Content-Type': 'application/json'})
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                res = json.loads(r.read())
            if not res.get('success'):
                raise RuntimeError(f"synthesis failed: {res.get('issues') or res}")
            return base64.b64decode(res['audio_content'])
        except (urllib.error.URLError, TimeoutError) as e:
            if attempt == 3:
                raise
            print('  retrying after', e)
            time.sleep(3 * (attempt + 1))


def pcm16_mono(wav_bytes):
    with wave.open(io.BytesIO(wav_bytes)) as w:
        ch, width, rate, n = w.getnchannels(), w.getsampwidth(), w.getframerate(), w.getnframes()
        raw = w.readframes(n)
    if width != 2:
        raise RuntimeError(f'expected 16-bit audio, got {width * 8}-bit')
    s = np.frombuffer(raw, dtype='<i2').astype(np.float32)
    if ch > 1:
        s = s.reshape(-1, ch).mean(axis=1)
    if rate != RATE:
        s = np.interp(np.arange(0, len(s), rate / RATE), np.arange(len(s)), s)
    return s


def trim(s):
    # everything quieter than -45 dBFS at the ends counts as silence
    loud = np.nonzero(np.abs(s) > 32768 * 10 ** (-45 / 20))[0]
    if len(loud) == 0:
        return s
    return s[max(0, loud[0] - PAD): min(len(s), loud[-1] + PAD)]


fixture_file = root / fixture_path
durations = {}
if fixture_file.exists():
    for l in json.loads(fixture_file.read_text())['lines']:
        durations[l['id']] = l.get('duration')
for line in script['lines']:
    if only and line['id'] not in only:
        continue
    s = trim(pcm16_mono(synth(line['text'])))
    with wave.open(str(out / f"{line['id']}.wav"), 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(RATE)
        w.writeframes(np.clip(s, -32768, 32767).astype('<i2').tobytes())
    durations[line['id']] = round(len(s) / RATE, 3)
    print(line['id'], durations[line['id']], 's')
fixture_file.write_text(json.dumps({'voice': f'resemble:{voice}', 'lines': [{**l, 'duration': durations.get(l['id'])} for l in script['lines']]}, indent=2) + '\n')
