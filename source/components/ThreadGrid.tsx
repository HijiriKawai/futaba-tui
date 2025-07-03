import React from 'react';
import {Box, Text} from 'ink';
import type {Thread, SortMode} from '../types/futaba.js';
import config, {generateHelpText} from '../config.js';

type Props = {
	threads: Thread[];
	selected: number;
	sortMode: number;
	sortModes: SortMode[];
	thumbCache: {[imgFile: string]: string};
	scrollRowOffset: number;
	setScrollRowOffset: (offset: number) => void;
	boxWidth: number;
	boxHeight: number;
};

const CARD_HEIGHT = 11; // 1カードの高さ
const CARD_WIDTH = 35; // 1カードの幅

const ThreadGrid: React.FC<Props> = ({
	threads,
	selected,
	sortMode,
	sortModes,
	thumbCache,
	scrollRowOffset,
	setScrollRowOffset,
	boxWidth,
	boxHeight,
}) => {
	const visibleCols = Math.max(1, Math.floor(boxWidth / CARD_WIDTH));
	const visibleRows = Math.max(1, Math.floor(boxHeight / CARD_HEIGHT));
	const totalRows = Math.ceil(threads.length / visibleCols);
	const selectedRow = Math.floor(selected / visibleCols);
	const selectedCol = selected % visibleCols;

	React.useEffect(() => {
		if (selectedRow < scrollRowOffset) {
			setScrollRowOffset(selectedRow);
		} else if (selectedRow >= scrollRowOffset + visibleRows) {
			setScrollRowOffset(selectedRow - visibleRows + 1);
		}
	}, [selectedRow, scrollRowOffset, setScrollRowOffset, visibleRows]);

	const grid: (Thread | undefined)[][] = [];
	for (let r = scrollRowOffset; r < Math.min(scrollRowOffset + visibleRows, totalRows); r++) {
		const row: (Thread | undefined)[] = [];
		for (let c = 0; c < visibleCols; c++) {
			const idx = r * visibleCols + c;
			if (idx < threads.length) row.push(threads[idx]);
			else row.push(undefined);
		}
		grid.push(row);
	}

	return (
		<Box flexDirection="column">
			<Text color="cyan">
				{generateHelpText(config.helpText.threadList, config.keyConfig)}
			</Text>
			<Text color="gray">
				数字キーでソート切り替え:{' '}
				{sortModes.map((m, i) => `${i + 1}:${m.name}`).join(' ')}
			</Text>
			<Text color="yellow">
				全{threads.length}件中、
				{Math.min(scrollRowOffset * visibleCols + 1, threads.length)}〜
				{Math.min((scrollRowOffset + visibleRows) * visibleCols, threads.length)}件を表示中
			</Text>
			<Text color="magenta">
				現在のソート: {sortModes[sortMode]?.name ?? ''}
			</Text>
			{grid.map((row, rIdx) => (
				<Box key={rIdx}>
					{row.map((thread, cIdx) => {
						const isSelected =
							selectedRow - scrollRowOffset === rIdx && selectedCol === cIdx;
						const imgFile = thread?.imgUrl
							? thread.imgUrl.split('/').pop()
							: '';
						let resColor = 'green';
						if ((thread?.resCount ?? 0) >= 500) resColor = 'red';
						else if ((thread?.resCount ?? 0) >= 100) resColor = 'yellow';
						return (
							<Box
								key={cIdx}
								flexDirection="column"
								borderStyle="round"
								borderColor={isSelected ? 'blue' : 'white'}
								paddingX={1}
								paddingY={0}
								marginRight={1}
								marginBottom={1}
								height={CARD_HEIGHT}
								width={CARD_WIDTH}
								alignItems="center"
								justifyContent="center"
								{...(isSelected ? {backgroundColor: 'blue'} : {})}
							>
								{thread ? (
									<>
										{thread.imgUrl && imgFile && thumbCache[imgFile] && (
											<Text>{thumbCache[imgFile]}</Text>
										)}
										<Text
											color={isSelected ? 'white' : undefined}
											backgroundColor={isSelected ? 'blue' : undefined}
										>
											{thread.firstResHead || thread.title}
											<Text color={resColor}>（{thread.resCount ?? 0}）</Text>
										</Text>
									</>
								) : (
									<Text> </Text>
								)}
							</Box>
						);
					})}
				</Box>
			))}
		</Box>
	);
};

export default ThreadGrid;
