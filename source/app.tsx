import React, { useState } from 'react';
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

const COLS = 5;

type Screen = 'board' | 'threadList' | 'threadDetail';

export default function App() {
	const [screen, setScreen] = useState<Screen>('board');
	const [sortMode, setSortMode] = useState(0);
	const [threadId, setThreadId] = useState<string | null>(null);
	const [scrollRowOffset, setScrollRowOffset] = useState(0);
	const [scrollOffset, setScrollOffset] = useState(0);
	const [reloadTrigger, setReloadTrigger] = useState(0);
	const [urlSelectMode, setUrlSelectMode] = useState<null | { urls: string[]; resIdx: number }> (null);
	const [hideDeletedRes, setHideDeletedRes] = useState(false);

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

	useInput((input, key) => {
		if (screen === 'board') {
			if (key.downArrow) setSelectedBoard(prev => (prev + 1) % boards.length);
			else if (key.upArrow) setSelectedBoard(prev => (prev - 1 + boards.length) % boards.length);
			else if (input === 'q') process.exit(0);
			else if (key.return) setScreen('threadList');
		}
		if (screen === 'threadList') {
			if (key.leftArrow) setSelectedThread(prev => (prev - 1 + threads.length) % threads.length);
			else if (key.rightArrow) setSelectedThread(prev => (prev + 1) % threads.length);
			else if (key.upArrow) setSelectedThread(prev => (prev - COLS + threads.length) % threads.length);
			else if (key.downArrow) setSelectedThread(prev => (prev + COLS) % threads.length);
			else if (input === '[') {
				setSortMode(prev => (prev - 1 + SORT_MODES.length) % SORT_MODES.length);
			} else if (input === ']') {
				setSortMode(prev => (prev + 1) % SORT_MODES.length);
			} else if (input === 'r') {
				setReloadTrigger(t => t + 1);
			} else if (input === 'b') {
				setScrollRowOffset(0);
				setScreen('board');
			} else if (input === 'q') process.exit(0);
			else if (key.return) {
				const thread = threads[selectedThread];
				if (thread) {
					setThreadId(thread.id);
					setScrollRowOffset(0);
					setScreen('threadDetail');
				}
			} else if (input === 'o') {
				const res = responses[selectedRes];
				let imgs: string[] = [];
				if (res?.imgUrl) imgs.push(res.imgUrl);
				if (res?.mediaUrls) {
					imgs = imgs.concat(res.mediaUrls.filter(url => /\.(jpe?g|png|gif)$/i.test(url)));
				}
				imgs = Array.from(new Set(imgs)); // 重複除去
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
		}
		if (screen === 'threadDetail') {
			if (key.downArrow) setSelectedRes(prev => (prev + 1) % responses.length);
			else if (key.upArrow) setSelectedRes(prev => (prev - 1 + responses.length) % responses.length);
			else if (input === 'b') {
				setScrollOffset(0);
				setScreen('threadList');
			} else if (input === 'q') process.exit(0);
			else if (input === 'o') {
				const res = responses[selectedRes];
				let imgs: string[] = [];
				if (res?.imgUrl) imgs.push(res.imgUrl);
				if (res?.mediaUrls) {
					imgs = imgs.concat(res.mediaUrls.filter(url => /\.(jpe?g|png|gif)$/i.test(url)));
				}
				imgs = Array.from(new Set(imgs)); // 重複除去
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
			else if (input === 'r') {
				// レス一覧リロード: threadIdを一度nullにしてから再セット
				setThreadId(null);
				setTimeout(() => setThreadId(threadId), 0);
			}
			else if (input === 'l') {
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
			else if (input === 'h') {
				setHideDeletedRes(v => !v);
			}
		}
		if (urlSelectMode) {
			if (/^[1-9]$/.test(input)) {
				const idx = parseInt(input, 10) - 1;
				const url = urlSelectMode.urls[idx];
				if (url) {
					let cmd = '';
					if (process.platform === 'darwin') cmd = `open \"${url}\"`;
					else if (process.platform === 'win32') cmd = `start \"\" \"${url}\"`;
					else cmd = `xdg-open \"${url}\"`;
					exec(cmd);
				}
				setUrlSelectMode(null);
			} else if (input === 'q' || key.escape) {
				setUrlSelectMode(null);
			}
			return;
		}
	});

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
			</>
		);
	}
	return null;
}
