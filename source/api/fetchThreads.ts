import { Thread } from '../types/futaba.js';
import { SORT_MODES } from '../constants.js';
import * as cheerio from 'cheerio';
import { fetchHtml } from '../utils.js';

export async function fetchThreads(boardUrl: string, sortIdx: number): Promise<Thread[]> {
  const param = SORT_MODES[sortIdx]?.param ?? '';
  const html = await fetchHtml(`${boardUrl}futaba.php?mode=cat${param}`);
  const $ = cheerio.load(html);
  const threadList: Thread[] = [];
  $('#cattable td').each((_, td) => {
    const a = $(td).find("a[href^='res/']");
    const href = a.attr('href');
    if (href && href.startsWith('res/')) {
      const id = href.replace('res/', '').replace('.htm', '');
      const resCount = $(td).find('font[size=2]').text();
      const imgTag = $(td).find('img');
      const imgSrc = imgTag.attr('src');
      const hasImage = !!imgSrc;
      let imgUrl: string | undefined = undefined;
      if (hasImage && imgSrc) {
        const imgFile = imgSrc.split('/').pop();
        if (imgFile) {
          imgUrl = boardUrl.replace(/\/$/, '') + '/cat/' + imgFile;
        }
      }
      threadList.push({ id, title: `レス数:${resCount}`, imgUrl, resCount: Number(resCount) || 0 });
    }
  });
  return threadList;
}
