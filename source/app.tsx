import React, { useState, useEffect } from 'react';
import { useInput } from 'ink';
import BoardSelector from './components/BoardSelector.js';
import ThreadGrid from './components/ThreadGrid.js';
import ThreadDetail from './components/ThreadDetail.js';
import { SORT_MODES } from './constants.js';
import { useBoardSelector } from './hooks/useBoardSelector.js';
import { useThreadGrid } from './hooks/useThreadGrid.js';
import { useThreadDetail } from './hooks/useThreadDetail.js';
import { Text } from 'ink';
import { exec } from 'child_process';
import process from 'process';
import UrlSelectModal from './components/UrlSelectModal.js';
import QuoteModal from './components/QuoteModal.js';
import type { HistoryItem } from './types/futaba.js';
import HistoryList from './components/HistoryList.js';
import config from './config.js';
import { loadHistory, saveHistory } from './utils.js';

type Screen = 'board' | 'threadList' | 'threadDetail' | 'historyList';

export default function App() {
	const [screen, setScreen] = useState<Screen>('board');
	const [sortMode, setSortMode] = useState(0);
	const [threadId, setThreadId] = useState<string | null>(null);
	const [scrollRowOffset, setScrollRowOffset] = useState(0);
	const [scrollOffset, setScrollOffset] = useState(0);
	const [reloadTrigger, setReloadTrigger] = useState(0);
	const [urlSelectMode, setUrlSelectMode] = useState<null | { urls: string[]; resIdx: number }> (null);
	const [hideDeletedRes, setHideDeletedRes] = useState(false);
	const [jumpMessage, _setJumpMessage] = useState<string | null>(null);
	const [quoteModal, setQuoteModal] = useState<{res?: any, message?: string} | null>(null);
	const [history, setHistory] = useState<HistoryItem[]>(() => loadHistory());
	const [selectedHistory, setSelectedHistory] = useState(0);

	// 板選択
	const {
		boards,
		selectedBoard,
		setSelectedBoard,
		board,
	} = useBoardSelector();

	// スレッド一覧
	const {
		threads,
		selectedThread,
		setSelectedThread,
		thumbCache,
		loading: loadingThreads,
		error: errorThreads,
	} = useThreadGrid(board?.url ?? '', sortMode, reloadTrigger);

	// レス一覧
	const {
		responses,
		selectedRes,
		setSelectedRes,
		resThumb,
		mediaThumbCache,
		loading: loadingRes,
		error: errorRes,
	} = useThreadDetail(board?.url ?? '', threadId);

	// 全角→半角変換
	function toHalfWidth(str: string) {
		return str.replace(/[！-～]/g, s =>
			String.fromCharCode(s.charCodeAt(0) - 0xfee0)
		).replace(/　/g, ' ');
	}

	function isKey(input: string, key: any, configKey: string) {
		const val = config.keyConfig[configKey];
		if (!val) return false;
		// 特殊キー
		if (val === 'up' && key.upArrow) return true;
		if (val === 'down' && key.downArrow) return true;
		if (val === 'left' && key.leftArrow) return true;
		if (val === 'right' && key.rightArrow) return true;
		if (val === 'enter' && key.return) return true;
		if (val === 'escape' && key.escape) return true;
		// 通常キー
		return input === val;
	}

	useInput((input, key) => {
		const inputNorm = input ? toHalfWidth(input) : input;
		if (screen === 'board') {
			if (isKey(input, key, 'down')) setSelectedBoard(prev => (prev + 1) % boards.length);
			else if (isKey(input, key, 'up')) setSelectedBoard(prev => (prev - 1 + boards.length) % boards.length);
			else if (isKey(input, key, 'quit')) process.exit(0);
			else if (isKey(input, key, 'enter')) setScreen('threadList');
		}
		if (screen === 'threadList') {
			if (isKey(input, key, 'left')) setSelectedThread(prev => (prev - 1 + threads.length) % threads.length);
			else if (isKey(input, key, 'right')) setSelectedThread(prev => (prev + 1) % threads.length);
			else if (isKey(input, key, 'up')) setSelectedThread(prev => (prev - config.threadGrid.cols + threads.length) % threads.length);
			else if (isKey(input, key, 'down')) setSelectedThread(prev => (prev + config.threadGrid.cols) % threads.length);
			else if (isKey(input, key, 'sortPrev')) setSortMode(prev => (prev - 1 + SORT_MODES.length) % SORT_MODES.length);
			else if (isKey(input, key, 'sortNext')) setSortMode(prev => (prev + 1) % SORT_MODES.length);
			else if (isKey(input, key, 'reload')) setReloadTrigger(t => t + 1);
			else if (isKey(input, key, 'back')) {
				setScrollRowOffset(0);
				setScreen('board');
			} else if (isKey(input, key, 'quit')) process.exit(0);
			else if (isKey(input, key, 'enter')) {
				const thread = threads[selectedThread];
				if (thread) {
					setThreadId(thread.id);
					setScrollRowOffset(0);
					setScreen('threadDetail');
				}
			} else if (isKey(input, key, 'openImage')) {
				const res = responses[selectedRes];
				let imgs: string[] = [];
				if (res?.imgUrl) imgs.push(res.imgUrl);
				if (res?.mediaUrls) {
					imgs = imgs.concat(res.mediaUrls.filter(url => /\.(jpe?g|png|gif)$/i.test(url)));
				}
				imgs = Array.from(new Set(imgs));
				if (imgs.length === 1) {
					const img = imgs[0];
					let cmd = '';
					if (process.platform === 'darwin') cmd = `open \"${img}\"`;
					else if (process.platform === 'win32') cmd = `start \"\" \"${img}\"`;
					else cmd = `xdg-open \"${img}\"`;
					exec(cmd);
				} else if (imgs.length > 1) {
					setUrlSelectMode({ urls: imgs, resIdx: selectedRes });
				}
			}
			if (/^[1-9]$/.test(inputNorm)) {
				const idx = parseInt(inputNorm, 10) - 1;
				if (idx >= 0 && idx < SORT_MODES.length) {
					setSortMode(idx);
				}
			}
			else if (isKey(inputNorm, key, 'history')) {
				setScreen('historyList');
				setSelectedHistory(0);
			}
		}
		if (screen === 'threadDetail') {
			if (isKey(input, key, 'down') || isKey(input, key, 'enter')) setSelectedRes(prev => (prev + 1) % responses.length);
			else if (isKey(input, key, 'up')) setSelectedRes(prev => (prev - 1 + responses.length) % responses.length);
			else if (isKey(input, key, 'back')) {
				setScrollOffset(0);
				setScreen('threadList');
			} else if (isKey(input, key, 'quit')) process.exit(0);
			else if (isKey(input, key, 'openImage')) {
				const res = responses[selectedRes];
				let imgs: string[] = [];
				if (res?.imgUrl) imgs.push(res.imgUrl);
				if (res?.mediaUrls) {
					imgs = imgs.concat(res.mediaUrls.filter(url => /\.(jpe?g|png|gif)$/i.test(url)));
				}
				imgs = Array.from(new Set(imgs));
				if (imgs.length === 1) {
					const img = imgs[0];
					let cmd = '';
					if (process.platform === 'darwin') cmd = `open \"${img}\"`;
					else if (process.platform === 'win32') cmd = `start \"\" \"${img}\"`;
					else cmd = `xdg-open \"${img}\"`;
					exec(cmd);
				} else if (imgs.length > 1) {
					setUrlSelectMode({ urls: imgs, resIdx: selectedRes });
				}
			}
			else if (isKey(input, key, 'reload')) {
				setThreadId(null);
				setTimeout(() => setThreadId(threadId), 0);
			}
			else if (isKey(input, key, 'openLink')) {
				const res = responses[selectedRes];
				const urls = res?.body.match(/https?:\/\/[^\s]+/g);
				if (urls && urls.length > 0) {
					if (urls.length === 1) {
						const url = urls[0];
						let cmd = '';
						if (process.platform === 'darwin') cmd = `open "${url}"`;
						else if (process.platform === 'win32') cmd = `start "" "${url}"`;
						else cmd = `xdg-open "${url}"`;
						exec(cmd);
					} else {
						setUrlSelectMode({ urls, resIdx: selectedRes });
					}
				}
			}
			else if (isKey(input, key, 'toggleDeleted')) {
				setHideDeletedRes(v => !v);
			}
			if (quoteModal) {
				if (/^[1-9]$/.test(inputNorm) && quoteModal.res && Array.isArray(quoteModal.res) && quoteModal.res.length > 0) {
					const idx = parseInt(inputNorm, 10) - 1;
					const res = quoteModal.res[idx];
					if (res) {
						const origIdx = responses.indexOf(res);
						if (origIdx !== -1) setSelectedRes(origIdx);
					}
					setQuoteModal(null);
					return;
				}
				if (isKey(input, key, 'quit') || isKey(input, key, 'escape') || isKey(input, key, 'enter')) {
					setQuoteModal(null);
					return;
				}
				return;
			}
			else if (isKey(inputNorm, key, 'history')) {
				setScreen('historyList');
				setSelectedHistory(0);
			}
		}
		if (urlSelectMode) {
			if (/^[1-9]$/.test(inputNorm)) {
				const idx = parseInt(inputNorm, 10) - 1;
				const url = urlSelectMode.urls[idx];
				if (url) {
					let cmd = '';
					if (process.platform === 'darwin') cmd = `open \"${url}\"`;
					else if (process.platform === 'win32') cmd = `start \"\" \"${url}\"`;
					else cmd = `xdg-open \"${url}\"`;
					exec(cmd);
				}
				setUrlSelectMode(null);
			} else if (isKey(input, key, 'quit') || isKey(input, key, 'escape')) {
				setUrlSelectMode(null);
			}
			return;
		}
		if (screen === 'historyList') {
			if (isKey(input, key, 'down')) setSelectedHistory(prev => (prev + 1) % history.length);
			else if (isKey(input, key, 'up')) setSelectedHistory(prev => (prev - 1 + history.length) % history.length);
			else if (isKey(inputNorm, key, 'back')) setScreen('threadList');
			else if (isKey(input, key, 'enter')) {
				const item = history[selectedHistory];
				if (item) {
					setThreadId(item.threadId);
					setScreen('threadDetail');
				}
			}
			else if (isKey(inputNorm, key, 'quit')) process.exit(0);
			return;
		}
	});

	// ThreadDetailを開くたびに履歴を追加
	useEffect(() => {
		if (screen === 'threadDetail' && threadId && responses.length > 0 && board) {
			const firstRes = responses[0];
			if (!firstRes) return;
			let firstResHead = firstRes.body.replace(/\n/g, '');
			if (firstResHead.length > 10) {
				firstResHead = firstResHead.slice(0, 10) + '…';
			}
			const thumbUrl = firstRes.imgUrl;
			setHistory(prev => {
				// threadId重複は最新アクセスで上書き
				const filtered = prev.filter(h => h.threadId !== threadId);
				return [
					{
						boardName: board.name,
						threadId,
						thumbUrl,
						firstResHead,
						accessedAt: new Date().toISOString(),
					},
					...filtered,
				];
			});
		}
	}, [screen, threadId, responses, board]);

	// 履歴の保存
	useEffect(() => {
		saveHistory(history);
	}, [history]);

	if (screen === 'board') {
		return (
			<BoardSelector
				boards={boards}
				selected={selectedBoard}
			/>
		);
	}
	if (screen === 'threadList') {
		if (loadingThreads) return <Text>読み込み中…</Text>;
		if (errorThreads) return <Text color="red">{errorThreads}</Text>;
		return (
			<ThreadGrid
				threads={threads}
				selected={selectedThread}
				sortMode={sortMode}
				sortModes={SORT_MODES}
				thumbCache={thumbCache}
				scrollRowOffset={scrollRowOffset}
				setScrollRowOffset={setScrollRowOffset}
			/>
		);
	}
	if (screen === 'threadDetail') {
		if (loadingRes) return <Text>読み込み中…</Text>;
		if (errorRes) return <Text color="red">{errorRes}</Text>;
		return (
			<>
				<ThreadDetail
					responses={responses}
					selected={selectedRes}
					resThumb={resThumb}
					mediaThumbCache={mediaThumbCache}
					scrollOffset={scrollOffset}
					setScrollOffset={setScrollOffset}
					hideDeletedRes={hideDeletedRes}
				/>
				{jumpMessage && (
					<Text color="red">{jumpMessage}</Text>
				)}
				{urlSelectMode && (
					<UrlSelectModal
						urls={urlSelectMode.urls}
						onSelect={idx => {
							const url = urlSelectMode.urls[idx];
							if (url) {
								let cmd = '';
								if (process.platform === 'darwin') cmd = `open \"${url}\"`;
								else if (process.platform === 'win32') cmd = `start \"\" \"${url}\"`;
								else cmd = `xdg-open \"${url}\"`;
								exec(cmd);
							}
							setUrlSelectMode(null);
						}}
						onCancel={() => setUrlSelectMode(null)}
					/>
				)}
				{quoteModal && (
					<QuoteModal
						res={quoteModal.res}
						message={quoteModal.message}
						onClose={() => setQuoteModal(null)}
						onSelect={idx => {
							if (quoteModal.res && Array.isArray(quoteModal.res)) {
								const res = quoteModal.res[idx];
								if (res) {
									const origIdx = responses.indexOf(res);
									if (origIdx !== -1) setSelectedRes(origIdx);
								}
								setQuoteModal(null);
							}
						}}
					/>
				)}
			</>
		);
	}
	if (screen === 'historyList') {
		return (
			<HistoryList
				history={history}
				selectedHistory={selectedHistory}
				setSelectedHistory={setSelectedHistory}
			/>
		);
	}
	return null;
}
