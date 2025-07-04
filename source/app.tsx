import React, {useState, useEffect} from 'react';
import {useInput} from 'ink';
import BoardSelector from './components/BoardSelector.js';
import ThreadGrid from './components/ThreadGrid.js';
import ThreadDetail from './components/ThreadDetail.js';
import {SORT_MODES} from './constants.js';
import {useBoardSelector} from './hooks/useBoardSelector.js';
import {useThreadGrid} from './hooks/useThreadGrid.js';
import {useThreadDetail} from './hooks/useThreadDetail.js';
import {Box, Text} from 'ink';
import {exec} from 'child_process';
import process from 'process';
import UrlSelectModal from './components/UrlSelectModal.js';
import QuoteModal from './components/QuoteModal.js';
import type {HistoryItem, InkKey, Res} from './types/futaba.js';
import HistoryList from './components/HistoryList.js';
import SettingsEditor from './components/SettingsEditor.js';
import {loadHistory, saveHistory} from './utils.js';
import {useSettingsEditor} from './hooks/useSettingsEditor.js';
import {loadConfig, saveConfig} from './utils/settings.js';
import config, {generateHelpText} from './config.js';

type Screen =
	| 'board'
	| 'threadList'
	| 'threadDetail'
	| 'historyList'
	| 'settings';

function getSortModeIndex(name: string): number {
	const idx = SORT_MODES.findIndex(m => m.name === name);
	return idx >= 0 ? idx : 0;
}

export default function App() {
	const [screen, setScreen] = useState<Screen>('board');
	const [sortMode, setSortMode] = useState(() =>
		getSortModeIndex(loadConfig().defaultSortMode),
	);
	const [threadId, setThreadId] = useState<string | null>(null);
	const [scrollRowOffset, setScrollRowOffset] = useState(0);
	const [scrollOffset, setScrollOffset] = useState(0);
	const [reloadTrigger, setReloadTrigger] = useState(0);
	const [urlSelectMode, setUrlSelectMode] = useState<null | {
		urls: string[];
		resIdx: number;
	}>(null);
	const [hideDeletedRes, setHideDeletedRes] = useState(false);
	const [quoteModal, setQuoteModal] = useState<{
		res?: Res[];
		message?: string;
	} | null>(null);
	const [history, setHistory] = useState<HistoryItem[]>(() => loadHistory());
	const [selectedHistory, setSelectedHistory] = useState(0);
	const [showAllHistory, setShowAllHistory] = useState(false);
	const [configState, setConfigState] = useState(loadConfig());

	// 設定画面用ロジックをフックで取得
	const settings = useSettingsEditor(configState, setConfigState);

	// 板選択
	const {boards, selectedBoard, setSelectedBoard, board} = useBoardSelector();

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

	const [boxSize, setBoxSize] = useState({
		width: process.stdout.columns ? process.stdout.columns - 2 : 80,
		height: process.stdout.rows ? process.stdout.rows - 2 : 24,
	});

	useEffect(() => {
		function handleResize() {
			// 画面クリア
			process.stdout.write('\x1b[3J\x1b[2J\x1b[H');
			setBoxSize({
				width: process.stdout.columns ? process.stdout.columns - 2 : 80,
				height: process.stdout.rows ? process.stdout.rows - 2 : 24,
			});
		}
		process.stdout.on('resize', handleResize);
		return () => {
			process.stdout.off('resize', handleResize);
		};
	}, []);

	const BOX_WIDTH = boxSize.width;
	const BOX_HEIGHT = boxSize.height;
	const boxPadding = 1; // Appのpadding
	const boxBorder = 1; // AppのborderStyle="round"は上下左右+1

	// 設定編集用の全項目リスト
	const keyConfigKeys: string[] = Object.keys(configState.keyConfig);
	if (!keyConfigKeys.includes('quoteModal')) keyConfigKeys.push('quoteModal');
	// 設定値取得
	function getValue(key: string): string | number {
		if (!key) return '';
		if (keyConfigKeys.includes(key)) return configState.keyConfig[key] ?? '';
		if (key === settings.defaultSortModeKey)
			return configState.defaultSortMode || '';
		return '';
	}

	// 全角→半角変換
	function toHalfWidth(str: string) {
		return str
			.replace(/[！-～]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
			.replace(/　/g, ' ');
	}

	function isKey(input: string, key: InkKey, configKey: string) {
		const val = configState.keyConfig[configKey];
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

	// visibleColsをThreadGridと同じ計算で定義
	const CARD_WIDTH = 35;
	const visibleCols = Math.max(1, Math.floor(boxSize.width / CARD_WIDTH));

	useInput((input, key) => {
		const inputNorm = input ? toHalfWidth(input) : input;
		if (screen === 'board') {
			if (isKey(input, key, 'down'))
				setSelectedBoard(prev => (prev + 1) % boards.length);
			else if (isKey(input, key, 'up'))
				setSelectedBoard(prev => (prev - 1 + boards.length) % boards.length);
			else if (isKey(input, key, 'quit')) process.exit(0);
			else if (isKey(input, key, 'enter')) setScreen('threadList');
		}
		if (screen === 'threadList') {
			if (isKey(input, key, 'left'))
				setSelectedThread(prev => (prev - 1 + threads.length) % threads.length);
			else if (isKey(input, key, 'right'))
				setSelectedThread(prev => (prev + 1) % threads.length);
			else if (isKey(input, key, 'up'))
				setSelectedThread(prev => (prev - visibleCols + threads.length) % threads.length);
			else if (isKey(input, key, 'down'))
				setSelectedThread(prev => (prev + visibleCols) % threads.length);
			else if (isKey(input, key, 'sortPrev'))
				setSortMode(prev => (prev - 1 + SORT_MODES.length) % SORT_MODES.length);
			else if (isKey(input, key, 'sortNext'))
				setSortMode(prev => (prev + 1) % SORT_MODES.length);
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
					imgs = imgs.concat(
						res.mediaUrls.filter(url => /\.(jpe?g|png|gif|webp)$/i.test(url)),
					);
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
					setUrlSelectMode({urls: imgs, resIdx: selectedRes});
				}
			}
			if (/^[1-9]$/.test(inputNorm)) {
				const idx = parseInt(inputNorm, 10) - 1;
				if (idx >= 0 && idx < SORT_MODES.length) {
					setSortMode(idx);
				}
			} else if (isKey(inputNorm, key, 'history')) {
				setScreen('historyList');
				setSelectedHistory(0);
			}
		}
		if (screen === 'threadDetail') {
			if (isKey(input, key, 'down') || isKey(input, key, 'enter'))
				setSelectedRes(prev => (prev + 1) % responses.length);
			else if (isKey(input, key, 'up'))
				setSelectedRes(
					prev => (prev - 1 + responses.length) % responses.length,
				);
			else if (isKey(input, key, 'back')) {
				setScrollOffset(0);
				setScreen('threadList');
			} else if (isKey(input, key, 'quit')) process.exit(0);
			else if (isKey(input, key, 'openImage')) {
				const res = responses[selectedRes];
				let imgs: string[] = [];
				if (res?.imgUrl) imgs.push(res.imgUrl);
				if (res?.mediaUrls) {
					imgs = imgs.concat(
						res.mediaUrls.filter(url => /\.(jpe?g|png|gif|webp)$/i.test(url)),
					);
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
					setUrlSelectMode({urls: imgs, resIdx: selectedRes});
				}
			} else if (isKey(input, key, 'reload')) {
				setThreadId(null);
				setTimeout(() => setThreadId(threadId), 0);
			} else if (isKey(input, key, 'openLink')) {
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
						setUrlSelectMode({urls, resIdx: selectedRes});
					}
				}
			} else if (isKey(input, key, 'toggleDeleted')) {
				setHideDeletedRes(v => !v);
			} else if (isKey(input, key, 'quoteModal')) {
				const res = responses[selectedRes];
				if (res) {
					// >>の後ろの文字列（番号・文字列）をすべて抽出
					const refs = Array.from(res.body.matchAll(/>([^\s]+)/g), m => m[1]);
					// 選択中レスより前のresponsesから、res.body, res.num, res.rscのいずれかに部分一致するものをリストアップ
					const quoted = responses
						.slice(0, selectedRes)
						.filter(r =>
							refs.some(
								ref =>
									(r.num ?? '').includes(ref ?? '') ||
									(r.rsc ?? '').includes(ref ?? '') ||
									(r.body ?? '').includes(ref ?? ''),
							),
						);
					if (quoted.length > 0) {
						setQuoteModal({
							res: quoted,
							message: '引用元を選択してください',
						});
					} else {
						setQuoteModal({
							res: [],
							message: '引用元がありません',
						});
					}
				}
				return;
			}
			if (quoteModal) {
				if (
					/^[1-9]$/.test(inputNorm) &&
					quoteModal.res &&
					Array.isArray(quoteModal.res) &&
					quoteModal.res.length > 0
				) {
					const idx = parseInt(inputNorm, 10) - 1;
					const res = quoteModal.res[idx];
					if (res) {
						const origIdx = responses.indexOf(res);
						if (origIdx !== -1) setSelectedRes(origIdx);
					}
					setQuoteModal(null);
					return;
				}
				if (
					isKey(input, key, 'quit') ||
					isKey(input, key, 'escape') ||
					isKey(input, key, 'enter')
				) {
					setQuoteModal(null);
					return;
				}
				return;
			} else if (isKey(inputNorm, key, 'history')) {
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
					if (process.platform === 'darwin') cmd = `open "${url}\"`;
					else if (process.platform === 'win32') cmd = `start "" "${url}\"`;
					else cmd = `xdg-open "${url}\"`;
					exec(cmd);
				}
				setUrlSelectMode(null);
			} else if (isKey(input, key, 'quit') || isKey(input, key, 'escape')) {
				setUrlSelectMode(null);
			}
			return;
		}
		if (screen === 'historyList') {
			if (isKey(input, key, 'down'))
				setSelectedHistory(prev => (prev + 1) % history.length);
			else if (isKey(input, key, 'up'))
				setSelectedHistory(
					prev => (prev - 1 + history.length) % history.length,
				);
			else if (isKey(inputNorm, key, 'back')) setScreen('threadList');
			else if (isKey(input, key, 'enter')) {
				const item = history[selectedHistory];
				if (item) {
					setThreadId(item.threadId);
					setScreen('threadDetail');
				}
			} else if (isKey(inputNorm, key, 'clearHistory')) {
				setHistory([]);
				setSelectedHistory(0);
			} else if (isKey(inputNorm, key, 'toggleHistoryAll')) {
				setShowAllHistory(v => !v);
				setSelectedHistory(0);
			} else if (isKey(inputNorm, key, 'quit')) process.exit(0);
			return;
		}
		if (isKey(input, key, 'settings')) {
			setScreen('settings');
			return;
		}
		if (screen === 'settings') {
			if (settings.editing) {
				return;
			}
			if (settings.keyInputMode) {
				const k = settings.allKeys[settings.selected] ?? '';
				if (k && settings.keyConfigKeys.includes(k)) {
					let newConfig = {...configState};
					let val = input;
					if (key.upArrow) val = 'up';
					else if (key.downArrow) val = 'down';
					else if (key.leftArrow) val = 'left';
					else if (key.rightArrow) val = 'right';
					else if (key.return) val = 'enter';
					else if (key.escape) {
						settings.setKeyInputMode(false);
						settings.setMessage('キャンセルしました');
						return;
					}
					newConfig = {
						...newConfig,
						keyConfig: {...newConfig.keyConfig, [k]: val},
					};
					setConfigState(newConfig);
					settings.setKeyInputMode(false);
					settings.setMessage('変更を反映しました（wで保存）');
				}
				return;
			}
			if (key.upArrow) {
				settings.setSelected(
					prev =>
						(prev - 1 + settings.allKeys.length) % settings.allKeys.length,
				);
			} else if (key.downArrow) {
				settings.setSelected(prev => (prev + 1) % settings.allKeys.length);
			} else if (key.return) {
				const k = settings.allKeys[settings.selected] ?? '';
				if (k && settings.keyConfigKeys.includes(k)) {
					settings.setKeyInputMode(true);
					settings.setMessage(
						'割り当てたいキーを押してください（Escでキャンセル）',
					);
				} else if (k) {
					settings.setEditing(true);
					settings.setEditValue(String(getValue(k)));
					settings.setMessage('');
				}
			} else if (input === configState.keyConfig['saveSettings']) {
				saveConfig(configState);
				setConfigState(loadConfig());
				setSortMode(getSortModeIndex(configState.defaultSortMode));
				settings.setMessage('保存しました');
			} else if (input === configState.keyConfig['quit'] || key.escape) {
				setScreen('board');
				settings.setMessage('');
			}
		}
	});

	// ThreadDetailを開くたびに履歴を追加
	useEffect(() => {
		if (
			screen === 'threadDetail' &&
			threadId &&
			responses.length > 0 &&
			board
		) {
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

	// defaultSortModeが変わったらsortModeも更新
	useEffect(() => {
		setSortMode(getSortModeIndex(configState.defaultSortMode));
	}, [configState.defaultSortMode]);

	function handleEditValueChange(val: string) {
		settings.setEditValue(val);
	}
	function handleEditSubmit(val: string) {
		settings.submitEditValue(val);
	}

	return (
		<Box
			flexDirection="column"
			borderStyle="round"
			borderColor="cyan"
			padding={boxPadding}
			height={BOX_HEIGHT}
			width={BOX_WIDTH}
		>
			{screen === 'board' && (
				<BoardSelector boards={boards} selected={selectedBoard} />
			)}
			{screen === 'threadList' &&
				(loadingThreads ? (
					<Text color="yellow">読み込み中…</Text>
				) : errorThreads ? (
					<Text color="red">{errorThreads}</Text>
				) : (
					<ThreadGrid
						threads={threads}
						selected={selectedThread}
						sortMode={sortMode}
						sortModes={SORT_MODES}
						thumbCache={thumbCache}
						scrollRowOffset={scrollRowOffset}
						setScrollRowOffset={setScrollRowOffset}
						boxWidth={BOX_WIDTH}
						boxHeight={BOX_HEIGHT - 8}
					/>
				))}
			{screen === 'threadDetail' &&
				(loadingRes ? (
					<Text color="yellow">読み込み中…</Text>
				) : errorRes ? (
					<Text color="red">{errorRes}</Text>
				) : (
					<ThreadDetail
						responses={responses}
						selected={selectedRes}
						resThumb={resThumb}
						mediaThumbCache={mediaThumbCache}
						scrollOffset={scrollOffset}
						setScrollOffset={setScrollOffset}
						hideDeletedRes={hideDeletedRes}
						boxHeight={BOX_HEIGHT - 8}
					/>
				))}
			{screen === 'historyList' && (
				<HistoryList
					history={history}
					selectedHistory={selectedHistory}
					showAll={showAllHistory}
					visibleRows={BOX_HEIGHT - 8}
				/>
			)}
			{screen === 'settings' && (
				<SettingsEditor
					selected={settings.selected}
					editing={settings.editing}
					editValue={settings.editValue}
					message={settings.message}
					keyConfigKeys={settings.keyConfigKeys}
					allKeys={settings.allKeys}
					getValue={getValue}
					onEditValueChange={handleEditValueChange}
					onEditSubmit={handleEditSubmit}
					defaultSortModeKey={settings.defaultSortModeKey}
					BOX_HEIGHT={BOX_HEIGHT}
					boxPadding={boxPadding}
					boxBorder={boxBorder}
				/>
			)}

			{/* フローティングモーダル（中央寄せ） */}
			{(urlSelectMode || quoteModal) &&
				(() => {
					// モーダルの内容幅（画面サイズに応じて可変、最小40）
					const paddingX = 2;
					const borderX = 2; // borderStyle="round" で左右1ずつ
					const modalInnerWidth = BOX_WIDTH - borderX - paddingX * 2;

					// 折り返しを考慮した行数計算関数
					function countWrappedLines(str: string, width: number): number {
						if (!str) return 1;
						return str
							.split('\n')
							.map((line: string) =>
								Math.max(1, Math.ceil(line.length / width)),
							)
							.reduce((a: number, b: number) => a + b, 0);
					}

					let modalHeight = 8; // デフォルト
					if (urlSelectMode) {
						// ヘルプテキスト
						const helpText = generateHelpText(
							config.helpText.urlSelectModal,
							configState.keyConfig,
						);
						let lines = countWrappedLines(helpText, modalInnerWidth - 4); // paddingX=2*2
						for (let i = 0; i < urlSelectMode.urls.length; ++i) {
							lines += countWrappedLines(
								`${i + 1}: ${urlSelectMode.urls[i]}`,
								modalInnerWidth - 4,
							);
						}
						// paddingY=2, border=2
						modalHeight = lines + 2 + 2;
					}
					if (quoteModal && quoteModal.res) {
						const helpText = generateHelpText(
							config.helpText.quoteModal,
							configState.keyConfig,
						);
						let lines = 1; // ヘッダー
						for (let idx = 0; idx < quoteModal.res.length; ++idx) {
							const r = quoteModal.res[idx];
							if (!r) continue;
							lines += countWrappedLines(
								`${idx + 1}: ${r.rsc} ${r.date} No.${r.num} ${r.name} そうだね:${r.sod}`,
								modalInnerWidth - 4,
							);
							for (const bodyLine of (r.body || '').split('\n')) {
								lines += countWrappedLines(bodyLine, modalInnerWidth - 4);
							}
							if (idx < quoteModal.res.length - 1) lines += 1; // marginBottom
						}
						lines += countWrappedLines(helpText, modalInnerWidth - 4); // フッター
						// paddingY=2, border=2
						modalHeight = lines + 2 + 2;
					}

					// 画面からはみ出さないように
					modalHeight = Math.min(modalHeight, BOX_HEIGHT - 2);

					return (
						<Box
							position="absolute"
							width={modalInnerWidth}
							height={modalHeight}
						>
							{/* 背景塗りつぶし */}
							<Box
								flexDirection="column"
								position="absolute"
								width={modalInnerWidth}
								height={modalHeight}
							>
								{Array.from({length: modalHeight}).map((_, i) => (
									<Text key={i} backgroundColor="gray">
										{' '.repeat(modalInnerWidth)}
									</Text>
								))}
							</Box>
							{/* モーダル内容 */}
							<Box
								position="absolute"
								width={modalInnerWidth}
								height={modalHeight}
								justifyContent="center"
								alignItems="center"
							>
								{urlSelectMode && (
									<UrlSelectModal
										urls={urlSelectMode.urls}
										onSelect={idx => {
											const url = urlSelectMode.urls[idx];
											if (url) {
												let cmd = '';
												if (process.platform === 'darwin')
													cmd = `open "${url}"`;
												else if (process.platform === 'win32')
													cmd = `start "" "${url}"`;
												else cmd = `xdg-open "${url}"`;
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
							</Box>
						</Box>
					);
				})()}
		</Box>
	);
}
