import {useState, useEffect} from 'react';
import {fetchThreads} from '../api/fetchThreads.js';
import terminalImage from 'terminal-image';
import {Thread} from '../types/futaba.js';
import {fetchHtml} from '../utils.js';
import * as cheerio from 'cheerio';

export function useThreadGrid(
	boardUrl: string,
	sortMode: number,
	reloadTrigger: number,
) {
	const [threads, setThreads] = useState<Thread[]>([]);
	const [selectedThread, setSelectedThread] = useState(0);
	const [thumbCache, setThumbCache] = useState<{[imgFile: string]: string}>({});
	const [titleCache, setTitleCache] = useState<{[threadId: string]: string}>(
		{},
	);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		setLoading(true);
		setSelectedThread(0);
		setError(null);
		fetchThreads(boardUrl, sortMode)
			.then(async fetchedThreads => {
				// 既存キャッシュを使い、未取得分だけfetch
				const threadsWithTitle = await Promise.all(
					fetchedThreads.map(async thread => {
						if (titleCache[thread.id]) {
							return {...thread, firstResHead: titleCache[thread.id]};
						} else {
							// 1レス目取得
							try {
								const html = await fetchHtml(
									boardUrl + 'res/' + thread.id + '.htm',
								);
								const match = html.match(
									/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/i,
								);
								let body = match ? match[1] : '';
								// HTMLタグ除去・改行除去
								body = (body || '').replace(/<[^>]+>/g, '').replace(/\n/g, '');
								body = cheerio.load(body).text();
								let head = body.slice(0, 4);
								if (body.length > 4) head += '…';
								setTitleCache(prev => ({...prev, [thread.id]: head}));
								return {...thread, firstResHead: head};
							} catch {
								return {...thread, firstResHead: ''};
							}
						}
					}),
				);
				setThreads(threadsWithTitle);
			})
			.catch(() => setError('スレッド一覧の取得に失敗しました'))
			.finally(() => setLoading(false));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [boardUrl, sortMode, reloadTrigger]);

	useEffect(() => {
		async function loadThumbs() {
			const promises = threads.map(async thread => {
				if (thread.imgUrl) {
					const imgFile = thread.imgUrl.split('/').pop() || thread.id;
					if (!thumbCache[imgFile]) {
						try {
							const imgUrl = boardUrl + 'cat/' + imgFile;
							const buffer = await (
								await fetch(imgUrl, {method: 'GET'})
							).arrayBuffer();
							const img = await terminalImage.buffer(Buffer.from(buffer), {
								width: '15%',
								height: '15%',
								preserveAspectRatio: true,
							});
							return {imgFile, img};
						} catch {
							return {imgFile, img: ''};
						}
					}
				}
				return null;
			});
			const results = await Promise.all(promises);
			const newCache: {[imgFile: string]: string} = {};
			results.forEach(r => {
				if (r && r.img) newCache[r.imgFile] = r.img;
			});
			if (Object.keys(newCache).length > 0)
				setThumbCache(prev => ({...prev, ...newCache}));
		}
		loadThumbs();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [threads, boardUrl]);

	return {
		threads,
		selectedThread,
		setSelectedThread,
		thumbCache,
		loading,
		error,
	};
}
