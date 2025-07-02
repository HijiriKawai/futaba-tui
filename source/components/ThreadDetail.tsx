import React from 'react';
import { Box, Text } from 'ink';
import type { Res } from '../types/futaba.js';

const WINDOW_SIZE = 7;

type Props = {
  responses: Res[];
  selected: number;
  resThumb: string | null;
  mediaThumbCache: { [url: string]: string };
  scrollOffset: number;
  setScrollOffset: (offset: number) => void;
};

export default function ThreadDetail({ responses, selected, resThumb, mediaThumbCache, scrollOffset, setScrollOffset }: Props) {
  // スクロールオフセット調整
  React.useEffect(() => {
    if (selected < scrollOffset) {
      setScrollOffset(selected);
    } else if (selected >= scrollOffset + WINDOW_SIZE) {
      setScrollOffset(selected - WINDOW_SIZE + 1);
    }
  }, [selected, scrollOffset, setScrollOffset]);

  const visibleResponses = responses.slice(scrollOffset, scrollOffset + WINDOW_SIZE);

  return (
    <Box flexDirection="column">
      <Text color="cyan">レス一覧（↑↓で移動、bでスレ一覧に戻る、rでリロード、qで終了）</Text>
      <Text color="yellow">
        全{responses.length}件中、{Math.min(scrollOffset + 1, responses.length)}〜{Math.min(scrollOffset + WINDOW_SIZE, responses.length)}件を表示中
      </Text>
      {responses.length === 0 ? (
        <Text color="yellow">レスが見つかりません</Text>
      ) : (
        visibleResponses.map((res, idx) => {
          const realIdx = scrollOffset + idx;
          return (
            <Box
              key={res.num}
              flexDirection="column"
              borderStyle="round"
              borderColor={selected === realIdx ? 'blue' : 'white'}
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
                  if (mediaThumbCache[url]) {
                    return <Text key={i}>{mediaThumbCache[url]}</Text>;
                  } else {
                    return <Text key={i} color="green">画像: {url}</Text>;
                  }
                } else if (/\.(webm|mp4)$/i.test(url)) {
                  return <Text key={i} color="yellow">動画: {url}</Text>;
                }
                return null;
              })}
              {selected === realIdx && res.imgUrl && !resThumb && (
                <Text color="green">画像: {res.imgUrl}</Text>
              )}
            </Box>
          );
        })
      )}
    </Box>
  );
}
