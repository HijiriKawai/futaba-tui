import React from 'react';
import { Box, Text } from 'ink';
import type { HistoryItem } from '../types/futaba.js';
import config, { generateHelpText } from '../config.js';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

type Props = {
  history: HistoryItem[];
  selectedHistory: number;
  showAll: boolean;
};

export default function HistoryList({ history, selectedHistory, showAll }: Props) {
  const now = Date.now();
  const filtered = showAll
    ? history
    : history.filter(h => now - new Date(h.accessedAt).getTime() < ONE_DAY_MS);

  return (
    <Box flexDirection="column">
      <Text color="cyan">
        {generateHelpText(config.helpText.historyList, config.keyConfig)}
        {showAll ? '（全履歴表示中）' : '（24時間以内のみ表示）'}
      </Text>
      {filtered.length === 0 ? (
        <Text color="yellow">履歴がありません</Text>
      ) : (
        filtered.map((item, idx) => (
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
