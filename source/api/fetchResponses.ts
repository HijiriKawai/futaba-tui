import { Res } from '../types/futaba.js';
import { fetchHtml } from '../utils.js';
import * as cheerio from 'cheerio';

export async function fetchResponses(boardUrl: string, threadId: string): Promise<Res[]> {
  const url = `${boardUrl}res/${threadId}.htm`;
	const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  const resList: Res[] = [];

  // スレ画（最初のレス）
  const threDiv = $('.thre');
  if (threDiv.length > 0) {
    const imgA = threDiv.find('a[href$=".jpg"],a[href$=".jpeg"],a[href$=".png"],a[href$=".gif"]').first();
    let imgUrl: string | undefined = undefined;
    if (imgA.length > 0) {
      const href = imgA.attr('href');
      if (href) {
        const imgFile = href.split('/').pop();
        if (imgFile) {
          imgUrl = boardUrl.replace(/\/$/, '') + '/src/' + imgFile;
        }
      }
    }
    const num = threDiv.find('.cno').first().text().replace('No.', '');
    const name = '';
    const date = threDiv.find('.cnw').first().text();
    const block = threDiv.find('blockquote').first();
    let bodyHtml = block.length > 0 ? block.html() : '';
    let body = (bodyHtml ?? '').replace(/<br\s*\/?\>/gi, '\n');
    body = cheerio.load(body).text();
		const rsc = "0";
    const sodText = threDiv.find('.sod').first().text();
    const sodMatch = sodText.match(/そうだねx(\d+)/);
    const sod = sodMatch ? sodMatch[1] : '0';
    // body内のf/fuで始まる画像・動画ファイル名を抽出
    const mediaUrls = [];
    // スレ画サムネ画像URLをmediaUrlsの先頭に追加
    if (imgUrl) {
      const imgFile = imgUrl.split('/').pop();
      if (imgFile) {
        mediaUrls.push(boardUrl.replace(/\/$/, '') + '/src/' + imgFile);
      }
    }
    const fileRegex = /\b(fu?\d+\.(?:jpe?g|png|gif|webm|mp4))\b/gi;
    let match;
    while ((match = fileRegex.exec(body)) !== null) {
      const fname = match[1];
      if (!fname) continue;
      let url = '';
      if (fname.startsWith('fu')) {
        url = 'https://dec.2chan.net/up2/src/' + fname;
      } else if (fname.startsWith('f')) {
        url = 'https://dec.2chan.net/up/src/' + fname;
			}
      mediaUrls.push(url);
    }
    resList.push({ num, name, date, body, imgUrl, rsc, sod, mediaUrls });
  }

  // 2レス目以降
  $('table').each((_, table) => {
    const td = $(table).find('td.rtd');
    if (td.length > 0) {
      const num = td.find('.cno').text().replace('No.', '');
      const name = '';
      const date = td.find('.cnw').text();
      const block = td.find('blockquote');
      let bodyHtml = block.length > 0 ? block.html() : '';
      let body = (bodyHtml ?? '').replace(/<br\s*\/?\>/gi, '\n');
      body = cheerio.load(body).text();
      const rsc = td.find('.rsc').text();
      const sodText = td.find('.sod').text();
      const sodMatch = sodText.match(/そうだねx(\d+)/);
      const sod = sodMatch ? sodMatch[1] : '0';
      // body内のf/fuで始まる画像・動画ファイル名を抽出
      const mediaUrls = [];
      const fileRegex = /\b(fu?\d+\.(?:jpe?g|png|gif|webm|mp4))\b/gi;
      let match;
      while ((match = fileRegex.exec(body)) !== null) {
        const fname = match[1];
        if (!fname) continue;
        let url = '';
        if (fname.startsWith('fu')) {
          url = 'https://dec.2chan.net/up2/src/' + fname;
        } else if (fname.startsWith('f')) {
          url = 'https://dec.2chan.net/up/src/' + fname;
        } else {
          url = boardUrl.replace(/\/$/, '') + '/src/' + fname;
        }
        mediaUrls.push(url);
      }
      resList.push({ num, name, date, body, rsc, sod, mediaUrls });
    }
  });

  return resList;
}
