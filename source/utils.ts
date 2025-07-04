import axios from 'axios';
import iconv from 'iconv-lite';
import fs from 'fs';
import path from 'path';
import os from 'os';
import type {HistoryItem} from './types/futaba.js';

export function chunkArray<T>(
	arr: T[],
	cols: number,
	rows: number,
): (T | undefined)[][] {
	const result: (T | undefined)[][] = [];
	for (let r = 0; r < rows; r++) {
		const row: (T | undefined)[] = [];
		for (let c = 0; c < cols; c++) {
			const idx = r * cols + c;
			if (idx < arr.length) row.push(arr[idx]);
			else row.push(undefined);
		}
		result.push(row);
	}
	return result;
}

export async function fetchHtml(
	url: string,
	encoding: string = 'Shift_JIS',
): Promise<string> {
	const res = await axios.get(url, {
		responseType: 'arraybuffer',
		headers: {'User-Agent': 'Mozilla/5.0'},
	});
	return iconv.decode(Buffer.from(res.data), encoding);
}

export async function fetchImageBuffer(url: string): Promise<Buffer> {
	const res = await axios.get(url, {responseType: 'arraybuffer'});
	return Buffer.from(res.data);
}

// 履歴ファイルのパス（XDG Base Directory対応）
export function getHistoryFilePath(): string {
	const xdgConfigHome =
		process.env['XDG_CONFIG_HOME'] || path.join(os.homedir(), '.config');
	const dir = path.join(xdgConfigHome, 'futaba-tui');
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive: true});
	return path.join(dir, 'history.json');
}

export function loadHistory(): HistoryItem[] {
	const file = getHistoryFilePath();
	if (fs.existsSync(file)) {
		try {
			const json = JSON.parse(fs.readFileSync(file, 'utf-8'));
			if (Array.isArray(json)) return json;
		} catch (error) {
			console.error('履歴ファイルの読み込みに失敗:', error);
		}
	}
	return [];
}

export function saveHistory(history: HistoryItem[]): void {
	const file = getHistoryFilePath();
	fs.writeFileSync(file, JSON.stringify(history, null, 2), 'utf-8');
}
