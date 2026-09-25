// Minimal PNG decoder for Chrome screenshots (8-bit RGB or RGBA, not interlaced). Returns RGB bytes.
import {inflateSync} from 'node:zlib';

export function decodePng(buf: Buffer): {w: number; h: number; rgb: Uint8Array} {
	let p = 8;
	let w = 0;
	let h = 0;
	let ch = 0;
	const idat: Buffer[] = [];
	while (p < buf.length) {
		const len = buf.readUInt32BE(p);
		const type = buf.toString('ascii', p + 4, p + 8);
		const data = buf.subarray(p + 8, p + 8 + len);
		if (type === 'IHDR') {
			w = data.readUInt32BE(0);
			h = data.readUInt32BE(4);
			const [depth, color, , , interlace] = [data[8], data[9], data[10], data[11], data[12]];
			if (depth !== 8 || interlace !== 0 || (color !== 2 && color !== 6)) throw new Error(`unsupported PNG (depth ${depth}, color ${color}, interlace ${interlace})`);
			ch = color === 6 ? 4 : 3;
		} else if (type === 'IDAT') idat.push(data);
		else if (type === 'IEND') break;
		p += 12 + len;
	}
	const raw = inflateSync(Buffer.concat(idat));
	const stride = w * ch;
	const px = new Uint8Array(h * stride);
	for (let y = 0; y < h; y++) {
		const f = raw[y * (stride + 1)];
		const src = y * (stride + 1) + 1;
		const row = y * stride;
		for (let x = 0; x < stride; x++) {
			const a = x >= ch ? px[row + x - ch] : 0;
			const b = y > 0 ? px[row - stride + x] : 0;
			const c = x >= ch && y > 0 ? px[row - stride + x - ch] : 0;
			const v = raw[src + x];
			let out: number;
			if (f === 0) out = v;
			else if (f === 1) out = v + a;
			else if (f === 2) out = v + b;
			else if (f === 3) out = v + ((a + b) >> 1);
			else {
				const pp = a + b - c;
				const pa = Math.abs(pp - a);
				const pb = Math.abs(pp - b);
				const pc = Math.abs(pp - c);
				out = v + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
			}
			px[row + x] = out & 255;
		}
	}
	if (ch === 3) return {w, h, rgb: px};
	const rgb = new Uint8Array(w * h * 3);
	for (let i = 0, j = 0; i < px.length; i += 4, j += 3) {
		rgb[j] = px[i];
		rgb[j + 1] = px[i + 1];
		rgb[j + 2] = px[i + 2];
	}
	return {w, h, rgb};
}

// How much two samples of the same frame differ, in 2x2 blocks of clearly changed pixels. Rendering noise
// (anti-aliasing under blur filters, a sub-pixel edge landing on the other side of a pixel) moves scattered
// pixels or a 1-pixel line; a real edit changes an area.
export function changedBlocks(a: Buffer, b: Buffer, threshold = 48): number {
	const A = decodePng(a);
	const B = decodePng(b);
	if (A.w !== B.w || A.h !== B.h) return Infinity;
	const {w, h} = A;
	const m = new Uint8Array(w * h);
	for (let i = 0, j = 0; j < m.length; i += 3, j++) {
		const d = Math.max(Math.abs(A.rgb[i] - B.rgb[i]), Math.abs(A.rgb[i + 1] - B.rgb[i + 1]), Math.abs(A.rgb[i + 2] - B.rgb[i + 2]));
		m[j] = d > threshold ? 1 : 0;
	}
	let n = 0;
	for (let y = 0; y + 1 < h; y++) for (let x = 0; x + 1 < w; x++) {
		const i = y * w + x;
		if (m[i] && m[i + 1] && m[i + w] && m[i + w + 1]) n++;
	}
	return n;
}
