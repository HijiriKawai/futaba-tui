import React from 'react';
import { Box, Text } from 'ink';
import type { Thread, SortMode } from '../types/futaba.js';

const COLS = 5;
const ROWS = 2;

type Props = {
  threads: Thread[];
  selected: number;
  sortMode: number;
  sortModes: SortMode[];
  thumbCache: { [imgFile: string]: string };
  scrollRowOffset: number;
  setScrollRowOffset: (offset: number) => void;
};

export default function ThreadGrid({ threads, selected, sortMode, sortModes, thumbCache, scrollRowOffset, setScrollRowOffset }: Props) {
  const totalRows = Math.ceil(threads.length / COLS);
  const visibleRows = ROWS;
  const selectedRow = Math.floor(selected / COLS);
  const selectedCol = selected % COLS;

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
    for (let c = 0; c < COLS; c++) {
      const idx = r * COLS + c;
      if (idx < threads.length) row.push(threads[idx]);
      else row.push(undefined);
    }
    grid.push(row);
  }

  return (
    <Box flexDirection="column">
      <Text color="cyan">
        スレッド一覧（↑↓←→で移動、Enterで詳細、bで板選択、qで終了、[と]でソート、rでリロード）
      </Text>
      <Text color="magenta">現在のソート: {sortModes[sortMode]?.name ?? ''}</Text>
      {grid.map((row, rIdx) => (
        <Box key={rIdx}>
          {row.map((thread, cIdx) => {
            const isSelected = (selectedRow - scrollRowOffset) === rIdx && selectedCol === cIdx;
            const imgFile = thread?.imgUrl ? thread.imgUrl.split('/').pop() : '';
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
              >
                {thread ? (
                  <>
                    {thread.imgUrl && imgFile && thumbCache[imgFile] && (
                      <Text>{thumbCache[imgFile]}</Text>
                    )}
                    <Text color="gray">{thread.id}</Text>
                    <Text color={isSelected ? 'white' : undefined} backgroundColor={isSelected ? 'blue' : undefined}>{thread.title}</Text>
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
}
