import axios from 'axios';
import iconv from 'iconv-lite';

export function chunkArray<T>(arr: T[], cols: number, rows: number): (T | undefined)[][] {
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

export async function fetchHtml(url: string, encoding: string = 'Shift_JIS'): Promise<string> {
  const res = await axios.get(url, {
    responseType: 'arraybuffer',
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });
  return iconv.decode(Buffer.from(res.data), encoding);
}

export async function fetchImageBuffer(url: string): Promise<Buffer> {
  const res = await axios.get(url, { responseType: 'arraybuffer' });
  return Buffer.from(res.data);
}
