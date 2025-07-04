import React from 'react';
import {Box, Text} from 'ink';
import type {HistoryItem} from '../types/futaba.js';
import config, {generateHelpText} from '../config.js';
import process from 'process';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

type Props = {
	history: HistoryItem[];
	selectedHistory: number;
	showAll: boolean;
	visibleRows?: number;
	scrollOffset: number;
	setScrollOffset: (offset: number) => void;
};

export default function HistoryList({
	history,
	selectedHistory,
	showAll,
	visibleRows,
	scrollOffset,
	setScrollOffset,
}: Props) {
	const now = Date.now();
	const filtered = showAll
		? history
		: history.filter(h => now - new Date(h.accessedAt).getTime() < ONE_DAY_MS);

	// 1アイテムの高さを計算（border上下+2, marginBottom+1, 本体の折り返し行数）
	function estimateItemHeight(item: HistoryItem, width: number): number {
		const text = `${item.thumbUrl ? '[img] ' : ''}${item.firstResHead} ${new Date(item.accessedAt).toLocaleString()}`;
		const lines = Math.ceil(text.length / width);
		return lines + 2 + 1;
	}

	const termRows = process.stdout?.rows ? process.stdout.rows - 8 : 10;
	const boxWidth = process.stdout?.columns ? process.stdout.columns - 4 : 80;
	const size = visibleRows ?? termRows;

	const maxOffset = Math.max(0, filtered.length - size);
	const safeScrollOffset = Math.min(Math.max(scrollOffset, 0), maxOffset);

	React.useEffect(() => {
		if (selectedHistory < safeScrollOffset) {
			setScrollOffset(selectedHistory);
		} else if (selectedHistory >= safeScrollOffset + size) {
			setScrollOffset(selectedHistory - size + 1);
		}
	}, [selectedHistory, safeScrollOffset, setScrollOffset, size]);

	// 合計高さで収まる分だけ表示
	let total = 0;
	const visible: HistoryItem[] = [];
	for (let i = safeScrollOffset; i < filtered.length; i++) {
		const item = filtered[i];
		if (!item) continue;
		const h = estimateItemHeight(item, boxWidth);
		if (total + h > size) break;
		visible.push(item);
		total += h;
	}

	return (
		<Box flexDirection="column">
			<Text color="cyan">
				{generateHelpText(config.helpText.historyList, config.keyConfig)}
				{showAll ? '（全履歴表示中）' : '（24時間以内のみ表示）'}
			</Text>
			{visible.length === 0 ? (
				<Text color="yellow">履歴がありません</Text>
			) : (
				visible.map((item, idx) => {
					const realIdx = safeScrollOffset + idx;
					return (
						<Box
							key={item.threadId}
							flexDirection="row"
							borderStyle="round"
							borderColor={selectedHistory === realIdx ? 'blue' : 'white'}
							paddingX={1}
							marginBottom={1}
							alignItems="center"
							{...(selectedHistory === realIdx
								? {backgroundColor: 'blue'}
							: {})}
						>
							<Text color={selectedHistory === realIdx ? 'white' : undefined}>
								{selectedHistory === realIdx ? '▶ ' : '  '}
								{item.thumbUrl ? '[img] ' : ''}
								<Text>{item.firstResHead}</Text>{' '}
								<Text color="gray">
									{new Date(item.accessedAt).toLocaleString()}
								</Text>
							</Text>
						</Box>
					);
				})
			)}
		</Box>
	);
}
