import React from 'react';
import { Box, Text } from 'ink';
import type { Res } from '../types/futaba.js';

type Props = {
  res?: Res[];
  message?: string;
  onClose: () => void;
};

export default function QuoteModal({ res, message }: Props) {
  return (
    <Box flexDirection="column" alignItems="center" justifyContent="center">
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor="cyan"
        paddingX={2}
        paddingY={1}
        minWidth={40}
        alignItems="flex-start"
      >
        {res && res.length > 0 ? (
          <>
            <Text color="cyan">引用元レス{res.length > 1 ? '（複数）' : ''}</Text>
            {res.map((r, idx) => (
              <Box key={idx} flexDirection="column" marginBottom={1}>
                <Text>{r.rsc} {r.date} No.{r.num} {r.name} そうだね:{r.sod}</Text>
                {r.body.split('\n').map((line, i) =>
                  line.startsWith('書き込みをした人によって削除されました') ||
                  line.startsWith('スレッドを立てた人によって削除されました') ||
                  line.startsWith('削除依頼によって隔離されました') ? (
                    <Text key={i} color="red">{line}</Text>
                  ) : line.startsWith('>') ? (
                    <Text key={i} color="green">{line}</Text>
                  ) : (
                    <Text key={i}>{line}</Text>
                  )
                )}
              </Box>
            ))}
          </>
        ) : (
          <Text color="red">{message ?? '引用元が見つかりません'}</Text>
        )}
        <Text color="gray">q/esc/Enterで閉じる</Text>
      </Box>
    </Box>
  );
}
