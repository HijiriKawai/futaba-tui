import React from 'react';
import { Box, Text } from 'ink';
import type { Res } from '../types/futaba.js';

type Props = {
  responses: Res[];
  selected: number;
  resThumb: string | null;
  mediaThumbCache: { [url: string]: string };
};

export default function ThreadDetail({ responses, selected, resThumb, mediaThumbCache }: Props) {
  return (
    <Box flexDirection="column">
      <Text color="cyan">レス一覧（↑↓で移動、bでスレ一覧に戻る、qで終了）</Text>
      {responses.length === 0 ? (
        <Text color="yellow">レスが見つかりません</Text>
      ) : (
        responses.map((res, idx) => (
          <Box
            key={res.num}
            flexDirection="column"
            borderStyle="round"
            borderColor={selected === idx ? 'blue' : 'white'}
            paddingLeft={1}
            marginBottom={1}
          >
            <Text>
              {res.rsc} {res.date} No.{res.num} {res.name} そうだね:{res.sod}
            </Text>
            <Text>{res.body}</Text>
            {/* 画像・動画表示 */}
            {res.mediaUrls && res.mediaUrls.map((url, i) => {
              if (/\.(jpg|png|gif)$/i.test(url)) {
                // 画像
								if (mediaThumbCache[url]) {
                  // キャッシュサムネ
                  return <Text key={i}>{mediaThumbCache[url]}</Text>;
                } else {
                  return <Text key={i} color="green">画像: {url}</Text>;
                }
              } else if (/\.(webm|mp4)$/i.test(url)) {
                // 動画
                return <Text key={i} color="yellow">動画: {url}</Text>;
              }
              return null;
            })}
            {selected === idx && resThumb && <Text>{resThumb}</Text>}
            {selected === idx && res.imgUrl && !resThumb && (
              <Text color="green">画像: {res.imgUrl}</Text>
            )}
          </Box>
        ))
      )}
    </Box>
  );
}
