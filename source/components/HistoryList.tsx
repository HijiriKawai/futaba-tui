import React from 'react';
import { Box, Text } from 'ink';
import type { HistoryItem } from '../types/futaba.js';
import config, { generateHelpText } from '../config.js';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

type Props = {
  history: HistoryItem[];
  selectedHistory: number;
  showAll: boolean;
  visibleRows?: number;
};

export default function HistoryList({ history, selectedHistory, showAll, visibleRows }: Props) {
  const now = Date.now();
  const filtered = showAll
    ? history
    : history.filter(h => now - new Date(h.accessedAt).getTime() < ONE_DAY_MS);

  const size = visibleRows ?? filtered.length;
  const start = Math.max(0, selectedHistory - Math.floor(size / 2));
  const visible = filtered.slice(start, start + size);

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
          const realIdx = start + idx;
          return (
            <Box key={item.threadId} flexDirection="row" borderStyle="round" borderColor={selectedHistory === realIdx ? 'blue' : 'white'} paddingX={1} marginBottom={1} alignItems="center" {...(selectedHistory === realIdx ? {backgroundColor: 'blue'} : {})}>
              <Text color={selectedHistory === realIdx ? 'white' : undefined}>
                {selectedHistory === realIdx ? '▶ ' : '  '}
                {item.thumbUrl ? '[img] ' : ''}
                <Text>{item.firstResHead}</Text>{' '}
                <Text color="gray">{new Date(item.accessedAt).toLocaleString()}</Text>
              </Text>
            </Box>
          );
        })
      )}
    </Box>
  );
}
