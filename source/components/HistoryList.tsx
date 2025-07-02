import React from 'react';
import { Box, Text } from 'ink';
import type { HistoryItem } from '../types/futaba.js';

type Props = {
  history: HistoryItem[];
  selectedHistory: number;
  setSelectedHistory: (idx: number) => void;
};

export default function HistoryList({ history, selectedHistory }: Props) {
  return (
    <Box flexDirection="column">
      <Text color="cyan">履歴一覧（↑↓:移動 Enter:開く b:戻る q:終了）</Text>
      {history.length === 0 ? (
        <Text color="yellow">履歴がありません</Text>
      ) : (
        history.map((item, idx) => (
          <Box key={item.threadId} flexDirection="row" borderStyle="round" borderColor={selectedHistory === idx ? 'blue' : 'white'} paddingX={1} marginBottom={1} alignItems="center">
            <Text color={selectedHistory === idx ? 'white' : undefined} backgroundColor={selectedHistory === idx ? 'blue' : undefined}>
              {selectedHistory === idx ? '▶ ' : '  '}
              板:{item.boardName} スレ:{item.threadId} {item.thumbUrl ? `[img]` : ''} 「{item.firstResHead}」 {new Date(item.accessedAt).toLocaleString()}
            </Text>
          </Box>
        ))
      )}
    </Box>
  );
}
