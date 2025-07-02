import React from 'react';
import { Box, Text } from 'ink';
import type { Thread, SortMode } from '../types/futaba.js';
import config, { generateHelpText } from '../config.js';

type Props = {
  threads: Thread[];
  selected: number;
  sortMode: number;
  sortModes: SortMode[];
  thumbCache: { [imgFile: string]: string };
  scrollRowOffset: number;
  setScrollRowOffset: (offset: number) => void;
  cols: number;
  rows: number;
};

const ThreadGrid: React.FC<Props> = ({ threads, selected, sortMode, sortModes, thumbCache, scrollRowOffset, setScrollRowOffset, cols, rows }) => {
  const totalRows = Math.ceil(threads.length / cols);
  const visibleRows = rows;
  const selectedRow = Math.floor(selected / cols);
  const selectedCol = selected % cols;

  React.useEffect(() => {
    if (selectedRow < scrollRowOffset) {
      setScrollRowOffset(selectedRow);
    } else if (selectedRow >= scrollRowOffset + visibleRows) {
      setScrollRowOffset(selectedRow - visibleRows + 1);
    }
  }, [selectedRow, scrollRowOffset, setScrollRowOffset]);

  const grid: (Thread | undefined)[][] = [];
  for (let r = scrollRowOffset; r < Math.min(scrollRowOffset + visibleRows, totalRows); r++) {
    const row: (Thread | undefined)[] = [];
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
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
				数字キーでソート切り替え: {sortModes.map((m, i) => `${i+1}:${m.name}`).join(' ')}
			</Text>
			<Text color="yellow">
				全{threads.length}件中、
				{Math.min(scrollRowOffset * cols + 1, threads.length)}〜
				{Math.min((scrollRowOffset + rows) * cols, threads.length)}件を表示中
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
								minWidth={35}
								alignItems="center"
								justifyContent="center"
							>
								{thread ? (
									<>
										{thread.imgUrl && imgFile && thumbCache[imgFile] && (
											<Text>{thumbCache[imgFile]}</Text>
										)}
										<Text color="gray">{thread.id}</Text>
										<Text
											color={isSelected ? 'white' : undefined}
											backgroundColor={isSelected ? 'blue' : undefined}
										>
											{thread.title}
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
