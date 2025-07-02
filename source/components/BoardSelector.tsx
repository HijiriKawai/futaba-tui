import React from 'react';
import { Box, Text } from 'ink';
import type { Board } from '../types/futaba.js';
import config, { generateHelpText } from '../config.js';

type Props = {
  boards: Board[];
  selected: number;
};

export default function BoardSelector({ boards, selected }: Props) {
  return (
    <Box flexDirection="column">
      <Text color="cyan">{generateHelpText(config.helpText.board, config.keyConfig)}</Text>
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
