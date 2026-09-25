// Machine-specific paths, so the scripts run both in the cloud container and on a laptop.
import {existsSync, readdirSync} from 'node:fs';
import path from 'node:path';

// The ffmpeg that ships with Remotion's compositor package for this platform (linux, darwin or win32).
export function ffmpegDir() {
	const root = 'node_modules/@remotion';
	const dirs = existsSync(root) ? readdirSync(root).filter((d) => d.startsWith(`compositor-${process.platform}-${process.arch}`)) : [];
	const dir = dirs.map((d) => path.join(root, d)).find((d) => existsSync(path.join(d, process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg')));
	if (!dir) throw new Error(`No Remotion compositor with ffmpeg for ${process.platform}-${process.arch}; run npm ci`);
	return dir;
}
export const ffmpegBin = (tool = 'ffmpeg') => path.join(ffmpegDir(), process.platform === 'win32' ? `${tool}.exe` : tool);
// its shared libraries sit next to it: LD_LIBRARY_PATH finds them on Linux, DYLD_LIBRARY_PATH on macOS
export const ffmpegEnv = () => ({...process.env, LD_LIBRARY_PATH: ffmpegDir(), DYLD_LIBRARY_PATH: ffmpegDir()});

// The cloud container has no Chrome download access, so it uses its preinstalled headless shell.
// On a laptop this returns null and Remotion uses (and downloads once) its own browser.
const CONTAINER_BROWSER = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
export const browserExecutable = () => process.env.REMOTION_BROWSER || (existsSync(CONTAINER_BROWSER) ? CONTAINER_BROWSER : null);
