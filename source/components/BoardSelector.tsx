import React from 'react';
import { Box, Text } from 'ink';
import type { Board } from '../types/futaba.js';

type Props = {
  boards: Board[];
  selected: number;
};

export default function BoardSelector({ boards, selected }: Props) {
  return (
    <Box flexDirection="column">
      <Text color="cyan">板を選択してください（↑↓で移動、Enterで決定、qで終了）</Text>
      {boards.map((board, idx) => (
        <Text
          key={board.key}
          backgroundColor={selected === idx ? 'blue' : undefined}
          color={selected === idx ? 'white' : undefined}
        >
          {selected === idx ? '▶ ' : '  '}
          {board.name}（{board.key}）
        </Text>
      ))}
    </Box>
  );
}
