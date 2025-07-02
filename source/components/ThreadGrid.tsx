import React from 'react';
import { Box, Text } from 'ink';
import type { Thread, SortMode } from '../types/futaba.js';

const COLS = 5;
const ROWS = 15;

type Props = {
  threads: Thread[];
  selected: number;
  sortMode: number;
  sortModes: SortMode[];
  thumbCache: { [imgFile: string]: string };
};

export default function ThreadGrid({ threads, selected, sortMode, sortModes, thumbCache }: Props) {
  const chunkArray = (arr: Thread[], cols: number, rows: number): (Thread | undefined)[][] => {
    const result: (Thread | undefined)[][] = [];
    for (let r = 0; r < rows; r++) {
      const row: (Thread | undefined)[] = [];
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        if (idx < arr.length) row.push(arr[idx]);
        else row.push(undefined);
      }
      result.push(row);
    }
    return result;
  };
  const grid = chunkArray(threads, COLS, ROWS);
  const selectedRow = Math.floor(selected / COLS);
  const selectedCol = selected % COLS;

  return (
    <Box flexDirection="column">
      <Text color="cyan">
        スレッド一覧（↑↓←→で移動、Enterで詳細、bで板選択、qで終了、[と]でソート、rでリロード）
      </Text>
      <Text color="magenta">現在のソート: {sortModes[sortMode]?.name ?? ''}</Text>
      {grid.map((row, rIdx) => (
        <Box key={rIdx}>
          {row.map((thread, cIdx) => {
            const isSelected = selectedRow === rIdx && selectedCol === cIdx;
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
