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

const COLS = 5;

type Screen = 'board' | 'threadList' | 'threadDetail';

export default function App() {
	const [screen, setScreen] = useState<Screen>('board');
	const [sortMode, setSortMode] = useState(0);
	const [threadId, setThreadId] = useState<string | null>(null);
	const [scrollRowOffset, setScrollRowOffset] = useState(0);
	const [scrollOffset, setScrollOffset] = useState(0);

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
	} = useThreadGrid(board?.url ?? '', sortMode);

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
				// 再取得はuseThreadGridの依存で自動
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
			}
		}
		if (screen === 'threadDetail') {
			if (key.downArrow) setSelectedRes(prev => (prev + 1) % responses.length);
			else if (key.upArrow) setSelectedRes(prev => (prev - 1 + responses.length) % responses.length);
			else if (input === 'b') {
				setScrollOffset(0);
				setScreen('threadList');
			} else if (input === 'q') process.exit(0);
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
			<ThreadDetail
				responses={responses}
				selected={selectedRes}
				resThumb={resThumb}
				mediaThumbCache={mediaThumbCache}
				scrollOffset={scrollOffset}
				setScrollOffset={setScrollOffset}
			/>
		);
	}
	return null;
}
