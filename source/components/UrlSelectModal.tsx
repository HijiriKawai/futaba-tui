import React from 'react';
import { Box, Text } from 'ink';

type Props = {
  urls: string[];
  onSelect: (idx: number) => void;
  onCancel: () => void;
};

export default function UrlSelectModal({ urls }: Props) {
  return (
    <Box flexDirection="column" alignItems="center" justifyContent="center">
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor="yellow"
        paddingX={2}
        paddingY={1}
        minWidth={40}
        alignItems="flex-start"
      >
        <Text color="yellow">URLを選択してください（数字:選択 q/esc:キャンセル）</Text>
        {urls.map((url, i) => (
          <Text key={i} color="cyan">{i + 1}: {url}</Text>
        ))}
      </Box>
    </Box>
  );
}
